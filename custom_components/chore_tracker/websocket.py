"""Home Assistant WebSocket commands for Chore Tracker cards."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv

from .const import ATTR_CONFIG_ENTRY_ID, DOMAIN
from .coordinator import ChoreTrackerCoordinator
from .helpers import chore_title, is_actionable, occurrence_row

WS_TYPE_FRESHNESS = f"{DOMAIN}/freshness"


def _coordinator_for(
    hass: HomeAssistant,
    config_entry_id: str | None,
) -> ChoreTrackerCoordinator:
    """Resolve a loaded coordinator, optionally by config entry id."""
    domain_data = hass.data.get(DOMAIN) or {}
    if not isinstance(domain_data, dict) or not domain_data:
        msg = "Chore Tracker is not configured"
        raise HomeAssistantError(msg)

    if config_entry_id is not None:
        coordinator = domain_data.get(config_entry_id)
        if not isinstance(coordinator, ChoreTrackerCoordinator):
            msg = f"Unknown config entry: {config_entry_id}"
            raise HomeAssistantError(msg)
        return coordinator

    if len(domain_data) == 1:
        only = next(iter(domain_data.values()))
        if isinstance(only, ChoreTrackerCoordinator):
            return only

    msg = "Multiple Chore Tracker entries loaded; pass config_entry_id"
    raise HomeAssistantError(msg)


def _rooms_by_id(data: dict[str, Any]) -> dict[str, str]:
    """Map room id → name from snapshot rooms list."""
    rooms_by_id: dict[str, str] = {}
    rooms = data.get("rooms") or []
    if not isinstance(rooms, list):
        return rooms_by_id
    for room in rooms:
        if not isinstance(room, dict):
            continue
        room_id = room.get("id")
        name = room.get("name")
        if isinstance(room_id, str) and isinstance(name, str) and name:
            rooms_by_id[room_id] = name
    return rooms_by_id


def _resolve_room(
    item: dict[str, Any],
    chore: dict[str, Any],
    rooms_by_id: dict[str, str],
) -> tuple[str | None, str | None]:
    """Resolve room id/name from occurrence projection or chore.roomId."""
    room_id: str | None = None
    room_name: str | None = None
    room_proj = item.get("room")
    if isinstance(room_proj, dict):
        rid = room_proj.get("id")
        rname = room_proj.get("name")
        if isinstance(rid, str):
            room_id = rid
        if isinstance(rname, str):
            room_name = rname
    if room_id is None:
        rid = chore.get("roomId")
        if isinstance(rid, str):
            room_id = rid
            room_name = rooms_by_id.get(rid)
    elif room_name is None:
        room_name = rooms_by_id.get(room_id)
    return room_id, room_name


def _freshness_row(
    item: dict[str, Any],
    rooms_by_id: dict[str, str],
) -> dict[str, Any] | None:
    """Build one freshness row, or None if the occurrence is not usable."""
    if not is_actionable(item):
        return None
    occurrence = occurrence_row(item)
    if occurrence is None:
        return None
    occ_id = occurrence.get("id")
    if not isinstance(occ_id, str) or not occ_id:
        return None

    chore = item.get("chore") if isinstance(item.get("chore"), dict) else {}
    if not isinstance(chore, dict):
        chore = {}
    chore_id = chore.get("id")
    if not isinstance(chore_id, str):
        chore_id = occurrence.get("choreId")
    if not isinstance(chore_id, str):
        return None

    room_id, room_name = _resolve_room(item, chore, rooms_by_id)

    last_completed = item.get("lastCompletedAt")
    if last_completed is not None and not isinstance(last_completed, str):
        last_completed = None

    freshness_pct = item.get("freshnessPct")
    if freshness_pct is not None and not isinstance(freshness_pct, (int, float)):
        freshness_pct = None

    due_at = occurrence.get("dueAt")
    return {
        "occurrenceId": occ_id,
        "choreId": chore_id,
        "title": chore_title(item),
        "roomId": room_id,
        "roomName": room_name,
        "dueAt": due_at if isinstance(due_at, str) else None,
        "lastCompletedAt": last_completed,
        "freshnessPct": freshness_pct,
    }


def freshness_rows(data: dict[str, Any] | None) -> list[dict[str, Any]]:
    """Build freshness rows from coordinator snapshot data."""
    if not data:
        return []

    rooms_by_id = _rooms_by_id(data)
    occurrences = data.get("occurrences") or []
    if not isinstance(occurrences, list):
        return []

    rows: list[dict[str, Any]] = []
    for item in occurrences:
        if not isinstance(item, dict):
            continue
        row = _freshness_row(item, rooms_by_id)
        if row is not None:
            rows.append(row)
    return rows


@callback
def async_setup_websocket(hass: HomeAssistant) -> None:
    """Register WebSocket commands (idempotent)."""
    key = f"{DOMAIN}_websocket_setup"
    if hass.data.get(key):
        return
    websocket_api.async_register_command(hass, websocket_freshness)
    hass.data[key] = True


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_FRESHNESS,
        vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string,
    }
)
@websocket_api.async_response
async def websocket_freshness(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return freshness rows for Lovelace cards."""
    try:
        coordinator = _coordinator_for(hass, msg.get(ATTR_CONFIG_ENTRY_ID))
    except HomeAssistantError as err:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, str(err))
        return

    connection.send_result(
        msg["id"],
        {
            "rows": freshness_rows(coordinator.data),
            "config_entry_id": coordinator.config_entry.entry_id
            if coordinator.config_entry
            else None,
        },
    )
