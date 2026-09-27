"""Diagnostics support for Chore Tracker."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.const import CONF_TOKEN, CONF_URL
from homeassistant.core import HomeAssistant

from .coordinator import ChoreTrackerCoordinator

TO_REDACT = {CONF_TOKEN}


def _redact_token(token: str) -> str:
    """Redact an API token while preserving the ct_ prefix shape."""
    if token.startswith("ct_") and len(token) > 3:
        return "ct_***"
    return "***"


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,  # noqa: ARG001 — required by HA diagnostics signature
    entry: Any,
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    coordinator: ChoreTrackerCoordinator | None = getattr(entry, "runtime_data", None)
    data = async_redact_data(dict(entry.data), TO_REDACT)
    # Ensure token is never left as a partial leak if redact_data leaves empties oddly.
    if CONF_TOKEN in entry.data:
        data[CONF_TOKEN] = _redact_token(str(entry.data[CONF_TOKEN]))

    snapshot = coordinator.data if coordinator and coordinator.data else {}
    occurrences = snapshot.get("occurrences") or []
    household = snapshot.get("household") or {}

    return {
        "entry": {
            "title": entry.title,
            "unique_id": entry.unique_id,
            "data": data,
            "url": data.get(CONF_URL),
        },
        "coordinator": {
            "last_update_success": (
                coordinator.last_update_success if coordinator else None
            ),
            "ws_connected": (coordinator.client.ws_connected if coordinator else None),
            "last_event_id": (
                coordinator.client.last_event_id if coordinator else None
            ),
            "last_error": coordinator.client.last_error if coordinator else None,
            "household_id": household.get("id"),
            "household_name": household.get("name"),
            "occurrence_count": len(occurrences)
            if isinstance(occurrences, list)
            else 0,
        },
    }
