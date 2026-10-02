"""DataUpdateCoordinator for Chore Tracker."""

from __future__ import annotations

from datetime import timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import (
    ChoreTrackerApiError,
    ChoreTrackerAuthError,
    ChoreTrackerConnectionError,
)
from .const import (
    DEFAULT_POLL_INTERVAL_SECONDS,
    DOMAIN,
    DOMAIN_EVENT_COMPLETED,
    EVENT_COMPLETED,
    EVENT_OVERDUE,
    LOGGER,
)
from .helpers import (
    assignee_id,
    chore_title,
    is_actionable,
    is_overdue,
    occurrence_row,
    parse_due_at,
)

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

    from .api import ChoreTrackerApiClient


def _credited_member_id(event: dict[str, Any], payload: Any) -> str | None:
    """Member credited for a completion; actor_id is the API token's owner."""
    if isinstance(payload, dict):
        for key in ("attributedMemberId", "completedForMemberId"):
            value = payload.get(key)
            if isinstance(value, str) and value:
                return value
    actor = event.get("actorId")
    return actor if isinstance(actor, str) and actor else None


class ChoreTrackerCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Fetch household snapshot; push updates via WebSocket when connected."""

    def __init__(
        self,
        hass: HomeAssistant,
        *,
        client: ChoreTrackerApiClient,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            LOGGER,
            config_entry=config_entry,
            name=DOMAIN,
            update_interval=timedelta(seconds=DEFAULT_POLL_INTERVAL_SECONDS),
        )
        self.client = client
        self._known_overdue_ids: set[str] = set()
        self._overdue_seeded = False
        self._fired_completed_ids: set[str] = set()

    async def async_start_listener(self) -> None:
        """Start the WebSocket listener after the first successful refresh."""
        self.client.start_ws_listener(
            on_message=self._async_on_ws_message,
            on_ready_truncated=self._async_on_ready_truncated,
        )

    async def async_shutdown(self) -> None:
        """Stop the WebSocket listener and the coordinator."""
        await self.client.async_stop_ws_listener()
        await super().async_shutdown()

    async def _async_update_data(self) -> dict[str, Any]:
        """Poll REST for a snapshot (also used as WS reconnect fallback)."""
        try:
            snapshot = await self.client.async_get_snapshot()
        except ChoreTrackerAuthError as err:
            raise ConfigEntryAuthFailed(err) from err
        except (ChoreTrackerConnectionError, ChoreTrackerApiError) as err:
            raise UpdateFailed(err) from err

        data = self._enrich(snapshot)
        # Poll/refresh sets self.data directly and does not call
        # async_set_updated_data — detect overdue edges here too.
        self._detect_overdue_edges(data)
        return data

    def _enrich(self, snapshot: dict[str, Any]) -> dict[str, Any]:
        """Attach connection diagnostics to coordinator data."""
        return {
            **snapshot,
            "ws_connected": self.client.ws_connected,
            "last_event_id": self.client.last_event_id,
            "last_error": self.client.last_error,
        }

    def async_set_updated_data(self, data: dict[str, Any]) -> None:
        """Set new data and run overdue edge detection."""
        self._detect_overdue_edges(data)
        super().async_set_updated_data(data)

    async def _async_on_ws_message(self, payload: dict[str, Any]) -> None:
        """Handle a domain event: fire HA bus events, then refresh."""
        self._fire_domain_bus_events(payload)
        await self.async_request_refresh()

    async def _async_on_ready_truncated(self) -> None:
        """Force a full REST refresh when the server reports truncated replay."""
        await self.async_request_refresh()

    async def async_refresh_after_action(self) -> None:
        """
        Refresh now after a user action, bypassing the request debouncer.

        The server's WebSocket push for the same action usually triggers a debounced
        refresh first, which would put async_request_refresh in its cooldown and leave
        cards reading stale data for up to 10 seconds (taps looked like they failed).
        """
        await self.async_refresh()

    def fire_completed_from_action(self, result: dict[str, Any]) -> None:
        """Fire chore_tracker_completed from a complete API response (deduped)."""
        event = result.get("event")
        if isinstance(event, dict):
            self._fire_completed_event(event)

    def _fire_domain_bus_events(self, payload: dict[str, Any]) -> None:
        """Map server WebSocket domain events onto the Home Assistant bus."""
        if payload.get("type") != "event":
            return
        event = payload.get("event")
        if not isinstance(event, dict):
            return
        if event.get("type") != DOMAIN_EVENT_COMPLETED:
            return
        self._fire_completed_event(event)

    def _fire_completed_event(self, event: dict[str, Any]) -> None:
        """Fire chore_tracker_completed once per domain event id."""
        event_id = event.get("id")
        if isinstance(event_id, str) and event_id:
            if event_id in self._fired_completed_ids:
                return
            self._fired_completed_ids.add(event_id)
            if len(self._fired_completed_ids) > 200:  # noqa: PLR2004 — dedupe bound
                # Bound memory; keep recent half.
                keep = list(self._fired_completed_ids)[-100:]
                self._fired_completed_ids = set(keep)

        payload = event.get("payload") or {}
        self.hass.bus.async_fire(
            EVENT_COMPLETED,
            {
                "event_id": event.get("id"),
                "household_id": event.get("householdId"),
                "occurrence_id": event.get("occurrenceId"),
                "chore_id": event.get("choreId"),
                "actor_id": event.get("actorId"),
                "member_id": _credited_member_id(event, payload),
                "payload": payload,
                "created_at": event.get("createdAt"),
                "config_entry_id": self.config_entry.entry_id
                if self.config_entry
                else None,
            },
        )

    def _detect_overdue_edges(self, data: dict[str, Any]) -> None:
        """Fire chore_tracker_overdue when an occurrence newly becomes overdue."""
        household = data.get("household") or {}
        timezone = household.get("timezone") if isinstance(household, dict) else None
        tz_name = timezone if isinstance(timezone, str) else None
        occurrences = data.get("occurrences") or []
        if not isinstance(occurrences, list):
            occurrences = []

        current_overdue: set[str] = set()
        newly_overdue: list[dict[str, Any]] = []

        for row in occurrences:
            if not isinstance(row, dict) or not is_actionable(row):
                continue
            occurrence = occurrence_row(row)
            if occurrence is None:
                continue
            occ_id = occurrence.get("id")
            if not isinstance(occ_id, str) or not occ_id:
                continue
            due = parse_due_at(occurrence.get("dueAt"))
            if not is_overdue(due, tz_name):
                continue
            current_overdue.add(occ_id)
            if self._overdue_seeded and occ_id not in self._known_overdue_ids:
                newly_overdue.append(row)

        if not self._overdue_seeded:
            # Seed without firing so existing overdue items do not spam on startup.
            self._known_overdue_ids = current_overdue
            self._overdue_seeded = True
            return

        for row in newly_overdue:
            occurrence = occurrence_row(row)
            if occurrence is None:
                continue
            self.hass.bus.async_fire(
                EVENT_OVERDUE,
                {
                    "occurrence_id": occurrence.get("id"),
                    "chore_id": occurrence.get("choreId"),
                    "chore_title": chore_title(row),
                    "assignee_id": assignee_id(row),
                    "due_at": occurrence.get("dueAt"),
                    "household_id": occurrence.get("householdId"),
                    "config_entry_id": self.config_entry.entry_id
                    if self.config_entry
                    else None,
                },
            )

        self._known_overdue_ids = current_overdue
