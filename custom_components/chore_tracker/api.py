"""Async API client for the Chore Tracker server."""

from __future__ import annotations

import asyncio
import contextlib
import logging
import socket
from collections.abc import Awaitable, Callable
from datetime import UTC, datetime, timedelta
from typing import Any
from urllib.parse import urlparse, urlunparse

import aiohttp

from .const import (
    OCCURRENCE_LOOKAHEAD_DAYS,
    OCCURRENCE_LOOKBACK_DAYS,
)

_LOGGER = logging.getLogger(__name__)


class ChoreTrackerApiError(Exception):
    """Exception to indicate a general API error."""


class ChoreTrackerAuthError(ChoreTrackerApiError):
    """Exception to indicate an authentication error."""


class ChoreTrackerConnectionError(ChoreTrackerApiError):
    """Exception to indicate a communication error."""


def normalize_url(url: str) -> str:
    """Normalize a base URL (strip trailing slash, require scheme)."""
    cleaned = url.strip().rstrip("/")
    parsed = urlparse(cleaned)
    if not parsed.scheme or not parsed.netloc:
        msg = "URL must include scheme and host"
        raise ChoreTrackerConnectionError(msg)
    return urlunparse(
        (parsed.scheme, parsed.netloc, parsed.path.rstrip("/"), "", "", "")
    )


def _ws_url(base_url: str, after: str | None = None) -> str:
    """Build the events WebSocket URL from a REST base URL."""
    parsed = urlparse(base_url)
    scheme = "wss" if parsed.scheme == "https" else "ws"
    path = f"{parsed.path.rstrip('/')}/api/v1/events/stream"
    query = f"after={after}" if after else ""
    return urlunparse((scheme, parsed.netloc, path, "", query, ""))


class ChoreTrackerApiClient:
    """REST + WebSocket client for Chore Tracker."""

    def __init__(
        self,
        url: str,
        token: str,
        session: aiohttp.ClientSession,
    ) -> None:
        """Initialize the client."""
        self._url = normalize_url(url)
        self._token = token
        self._session = session
        self._ws_task: asyncio.Task[None] | None = None
        self._ws_stop = asyncio.Event()
        self.ws_connected = False
        self.last_event_id: str | None = None
        self.last_error: str | None = None

    @property
    def url(self) -> str:
        """Return the normalized base URL."""
        return self._url

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self._token}"}

    async def async_get_household(self) -> dict[str, Any]:
        """GET /api/v1/household — validates the token and returns household."""
        return await self._request("GET", "/api/v1/household")

    async def async_get_members(self) -> list[dict[str, Any]]:
        """GET /api/v1/members."""
        data = await self._request("GET", "/api/v1/members")
        if not isinstance(data, list):
            msg = "Unexpected members response"
            raise ChoreTrackerApiError(msg)
        return data

    async def async_get_occurrences(
        self,
        *,
        lookback_days: int = OCCURRENCE_LOOKBACK_DAYS,
        lookahead_days: int = OCCURRENCE_LOOKAHEAD_DAYS,
        from_iso: str | None = None,
        to_iso: str | None = None,
    ) -> list[dict[str, Any]]:
        """GET /api/v1/occurrences for a due window."""
        if from_iso is None or to_iso is None:
            now = datetime.now(tz=UTC)
            from_iso = (now - timedelta(days=lookback_days)).isoformat()
            to_iso = (now + timedelta(days=lookahead_days)).isoformat()
        params = {"from": from_iso, "to": to_iso}
        data = await self._request("GET", "/api/v1/occurrences", params=params)
        if not isinstance(data, list):
            msg = "Unexpected occurrences response"
            raise ChoreTrackerApiError(msg)
        return data

    async def async_complete_occurrence(
        self,
        occurrence_id: str,
        *,
        body: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """POST /api/v1/occurrences/:id/complete."""
        return await self._request(
            "POST",
            f"/api/v1/occurrences/{occurrence_id}/complete",
            json_data=body if body is not None else {},
        )

    async def async_create_chore(self, payload: dict[str, Any]) -> dict[str, Any]:
        """POST /api/v1/chores."""
        return await self._request("POST", "/api/v1/chores", json_data=payload)

    async def async_get_snapshot(self) -> dict[str, Any]:
        """Fetch household + members + occurrences for the coordinator."""
        household = await self.async_get_household()
        members = await self.async_get_members()
        occurrences = await self.async_get_occurrences()
        return {
            "household": household,
            "members": members,
            "occurrences": occurrences,
            "fetched_at": datetime.now(tz=UTC).isoformat(),
        }

    def start_ws_listener(
        self,
        *,
        on_message: Callable[[dict[str, Any]], Awaitable[None]],
        on_ready_truncated: Callable[[], Awaitable[None]] | None = None,
    ) -> None:
        """Start the background WebSocket listener (idempotent)."""
        if self._ws_task and not self._ws_task.done():
            return
        self._ws_stop.clear()
        self._ws_task = asyncio.create_task(
            self._ws_loop(on_message=on_message, on_ready_truncated=on_ready_truncated),
            name="chore_tracker_ws",
        )

    async def async_stop_ws_listener(self) -> None:
        """Stop the WebSocket listener if running."""
        self._ws_stop.set()
        task = self._ws_task
        self._ws_task = None
        if task is not None:
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task
        self.ws_connected = False

    async def _ws_loop(
        self,
        *,
        on_message: Callable[[dict[str, Any]], Awaitable[None]],
        on_ready_truncated: Callable[[], Awaitable[None]] | None,
    ) -> None:
        """Reconnect loop for the events stream."""
        backoff = 1.0
        while not self._ws_stop.is_set():
            try:
                await self._ws_session(
                    on_message=on_message,
                    on_ready_truncated=on_ready_truncated,
                )
                backoff = 1.0
            except asyncio.CancelledError:
                raise
            except Exception as err:  # noqa: BLE001 — reconnect on any WS failure
                self.ws_connected = False
                self.last_error = str(err)
                _LOGGER.debug("WebSocket disconnected: %s", err)
                try:
                    await asyncio.wait_for(self._ws_stop.wait(), timeout=backoff)
                    break
                except TimeoutError:
                    backoff = min(backoff * 2, 60.0)

    async def _ws_session(
        self,
        *,
        on_message: Callable[[dict[str, Any]], Awaitable[None]],
        on_ready_truncated: Callable[[], Awaitable[None]] | None,
    ) -> None:
        """Single WebSocket connection until disconnect."""
        url = _ws_url(self._url, after=self.last_event_id)
        async with self._session.ws_connect(
            url,
            headers=self._headers(),
            heartbeat=None,
        ) as ws:
            self.ws_connected = True
            self.last_error = None
            async for msg in ws:
                if self._ws_stop.is_set():
                    break
                if msg.type == aiohttp.WSMsgType.TEXT:
                    try:
                        payload = msg.json()
                    except Exception:  # noqa: BLE001
                        _LOGGER.debug("Ignoring non-JSON WebSocket message")
                        continue
                    if not isinstance(payload, dict):
                        continue
                    await self._handle_ws_payload(
                        payload,
                        on_message=on_message,
                        on_ready_truncated=on_ready_truncated,
                    )
                elif msg.type in (
                    aiohttp.WSMsgType.CLOSED,
                    aiohttp.WSMsgType.ERROR,
                ):
                    break

        self.ws_connected = False

    async def _handle_ws_payload(
        self,
        payload: dict[str, Any],
        *,
        on_message: Callable[[dict[str, Any]], Awaitable[None]],
        on_ready_truncated: Callable[[], Awaitable[None]] | None,
    ) -> None:
        """Dispatch a parsed server message."""
        msg_type = payload.get("type")
        if msg_type == "heartbeat":
            return
        if msg_type == "ready":
            last = payload.get("lastEventId")
            if isinstance(last, str):
                self.last_event_id = last
            elif last is None:
                pass
            if payload.get("truncated") and on_ready_truncated is not None:
                await on_ready_truncated()
            return
        if msg_type == "event":
            event = payload.get("event")
            if isinstance(event, dict):
                event_id = event.get("id")
                if isinstance(event_id, str):
                    self.last_event_id = event_id
            await on_message(payload)

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, str] | None = None,
        json_data: dict[str, Any] | None = None,
    ) -> Any:
        """Perform an authenticated REST request."""
        url = f"{self._url}{path}"
        try:
            async with asyncio.timeout(15):
                async with self._session.request(
                    method,
                    url,
                    headers=self._headers(),
                    params=params,
                    json=json_data,
                ) as response:
                    if response.status in (401, 403):
                        msg = "Invalid API token"
                        raise ChoreTrackerAuthError(msg)
                    response.raise_for_status()
                    return await response.json()
        except (ChoreTrackerAuthError, ChoreTrackerApiError):
            raise
        except TimeoutError as err:
            msg = f"Timeout talking to Chore Tracker: {err}"
            raise ChoreTrackerConnectionError(msg) from err
        except (aiohttp.ClientError, socket.gaierror) as err:
            msg = f"Error talking to Chore Tracker: {err}"
            raise ChoreTrackerConnectionError(msg) from err
        except Exception as err:
            msg = f"Unexpected Chore Tracker API error: {err}"
            raise ChoreTrackerApiError(msg) from err
