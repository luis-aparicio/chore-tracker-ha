"""Tests for the Chore Tracker API client helpers."""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.const import CONF_TOKEN, CONF_URL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.chore_tracker.api import (
    ChoreTrackerApiClient,
    ChoreTrackerAuthError,
    normalize_url,
)
from custom_components.chore_tracker.const import DOMAIN
from custom_components.chore_tracker.coordinator import ChoreTrackerCoordinator


def test_normalize_url_strips_slash() -> None:
    """URL normalization strips trailing slashes."""
    assert normalize_url("http://host:8080/") == "http://host:8080"
    assert normalize_url("  https://example.com/path/  ") == "https://example.com/path"


async def test_get_household_bearer() -> None:
    """REST client sends Bearer auth and returns household JSON."""
    session = MagicMock()
    response = MagicMock()
    response.status = 200
    response.raise_for_status = MagicMock()
    response.json = AsyncMock(return_value={"id": "hh1", "name": "Home"})
    response.__aenter__ = AsyncMock(return_value=response)
    response.__aexit__ = AsyncMock(return_value=None)
    session.request = MagicMock(return_value=response)

    api = ChoreTrackerApiClient(
        url="http://host:8080",
        token="ct_secret",
        session=session,
    )
    household = await api.async_get_household()
    assert household["id"] == "hh1"
    session.request.assert_called_once()
    _args, kwargs = session.request.call_args
    assert kwargs["headers"]["Authorization"] == "Bearer ct_secret"


async def test_get_household_invalid_token() -> None:
    """Invalid Bearer returns ChoreTrackerAuthError."""
    session = MagicMock()
    response = MagicMock()
    response.status = 401
    response.__aenter__ = AsyncMock(return_value=response)
    response.__aexit__ = AsyncMock(return_value=None)
    session.request = MagicMock(return_value=response)

    api = ChoreTrackerApiClient(
        url="http://host:8080",
        token="ct_bad",
        session=session,
    )
    with pytest.raises(ChoreTrackerAuthError):
        await api.async_get_household()


async def test_ws_message_handling() -> None:
    """WebSocket payload handler updates last_event_id and invokes callbacks."""
    session = MagicMock()
    api = ChoreTrackerApiClient(
        url="http://host:8080",
        token="ct_x",
        session=session,
    )
    messages: list[dict[str, Any]] = []
    truncated_calls = 0

    async def on_message(payload: dict[str, Any]) -> None:
        messages.append(payload)

    async def on_truncated() -> None:
        nonlocal truncated_calls
        truncated_calls += 1

    await api._handle_ws_payload(
        {"type": "heartbeat", "at": "2026-01-01T00:00:00+00:00"},
        on_message=on_message,
        on_ready_truncated=on_truncated,
    )
    await api._handle_ws_payload(
        {"type": "ready", "lastEventId": "evt_1", "truncated": True},
        on_message=on_message,
        on_ready_truncated=on_truncated,
    )
    await api._handle_ws_payload(
        {"type": "event", "event": {"id": "evt_2", "type": "occurrence.completed"}},
        on_message=on_message,
        on_ready_truncated=on_truncated,
    )

    assert api.last_event_id == "evt_2"
    assert truncated_calls == 1
    assert len(messages) == 1
    assert messages[0]["type"] == "event"


async def test_skip_snooze_reassign_paths() -> None:
    """Skip / snooze / reassign hit the expected REST paths."""
    session = MagicMock()
    response = MagicMock()
    response.status = 200
    response.raise_for_status = MagicMock()
    response.json = AsyncMock(return_value={"ok": True})
    response.__aenter__ = AsyncMock(return_value=response)
    response.__aexit__ = AsyncMock(return_value=None)
    session.request = MagicMock(return_value=response)

    api = ChoreTrackerApiClient(
        url="http://host:8080",
        token="ct_secret",
        session=session,
    )

    await api.async_skip_occurrence("occ_1")
    method, url = session.request.call_args.args[:2]
    assert method == "POST"
    assert url.endswith("/api/v1/occurrences/occ_1/skip")

    await api.async_snooze_occurrence("occ_1", snooze_until="2026-09-28T18:00:00")
    _method, url = session.request.call_args.args[:2]
    assert url.endswith("/api/v1/occurrences/occ_1/snooze")
    assert session.request.call_args.kwargs["json"] == {
        "snoozeUntil": "2026-09-28T18:00:00"
    }

    await api.async_reassign_occurrence("occ_1", assignee_id="mem_sam")
    _method, url = session.request.call_args.args[:2]
    assert url.endswith("/api/v1/occurrences/occ_1/reassign")
    assert session.request.call_args.kwargs["json"] == {"assigneeId": "mem_sam"}


async def test_coordinator_poll_and_ws_refresh(hass: HomeAssistant) -> None:
    """Coordinator poll enriches snapshot; WS message requests refresh."""
    client = AsyncMock()
    client.async_get_snapshot = AsyncMock(
        return_value={
            "household": {"id": "hh1", "name": "H"},
            "members": [{"id": "m1", "displayName": "Alex"}],
            "occurrences": [{"occurrence": {"id": "o1"}}],
            "fetched_at": "2026-01-01T00:00:00+00:00",
        }
    )
    client.ws_connected = True
    client.last_event_id = "evt_9"
    client.last_error = None
    client.start_ws_listener = MagicMock()
    client.async_stop_ws_listener = AsyncMock()

    entry = MockConfigEntry(
        domain=DOMAIN,
        data={CONF_URL: "http://host:8080", CONF_TOKEN: "ct_x"},
        unique_id="hh1",
    )
    entry.add_to_hass(hass)

    coordinator = ChoreTrackerCoordinator(hass, client=client, config_entry=entry)
    data = await coordinator._async_update_data()
    assert data["ws_connected"] is True
    assert data["last_event_id"] == "evt_9"
    assert len(data["occurrences"]) == 1
    assert len(data["members"]) == 1

    with patch.object(
        coordinator,
        "async_request_refresh",
        new_callable=AsyncMock,
    ) as refresh:
        await coordinator._async_on_ws_message({"type": "event"})
        refresh.assert_awaited()


async def test_snapshot_occurrences_have_no_lower_bound() -> None:
    """The default fetch sends only `to`, so long-overdue chores are included."""
    client = ChoreTrackerApiClient(
        url="http://host:8080", token="ct_token", session=MagicMock()
    )
    with patch.object(client, "_request", AsyncMock(return_value=[])) as request:
        await client.async_get_occurrences()
        params = request.await_args.kwargs["params"]
        assert set(params) == {"to"}

        await client.async_get_occurrences(
            from_iso="2026-09-01T00:00:00+00:00", to_iso="2026-10-01T00:00:00+00:00"
        )
        params = request.await_args.kwargs["params"]
        assert params == {
            "from": "2026-09-01T00:00:00+00:00",
            "to": "2026-10-01T00:00:00+00:00",
        }
