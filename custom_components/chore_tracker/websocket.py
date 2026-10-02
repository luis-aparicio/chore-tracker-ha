"""Home Assistant WebSocket commands for Chore Tracker cards."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv

from .const import ATTR_CONFIG_ENTRY_ID, DOMAIN
from .coordinator import ChoreTrackerCoordinator
from .helpers import (
    assignee_id,
    chore_title,
    due_local_date,
    eligible_member_ids,
    household_zone,
    is_actionable,
    local_today,
    occurrence_row,
    parse_due_at,
)

WS_TYPE_FRESHNESS = f"{DOMAIN}/freshness"
WS_TYPE_KIOSK_ITEMS = f"{DOMAIN}/kiosk_items"
WS_TYPE_KIOSK_LIST = f"{DOMAIN}/kiosk_list"
ATTR_MEMBER_ID = "member_id"


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


def _member_names(data: dict[str, Any]) -> dict[str, str]:
    """Map member id → display name from the snapshot."""
    names: dict[str, str] = {}
    members = data.get("members") or []
    if not isinstance(members, list):
        return names
    for member in members:
        if not isinstance(member, dict):
            continue
        member_id = member.get("id")
        name = member.get("displayName")
        if isinstance(member_id, str):
            names[member_id] = name if isinstance(name, str) and name else member_id
    return names


def _kiosk_item(
    item: dict[str, Any],
    rooms_by_id: dict[str, str],
    member_names: dict[str, str],
) -> dict[str, Any] | None:
    occurrence = occurrence_row(item)
    if occurrence is None:
        return None
    occ_id = occurrence.get("id")
    if not isinstance(occ_id, str) or not occ_id:
        return None
    chore = item.get("chore") if isinstance(item.get("chore"), dict) else {}
    _, room_name = _resolve_room(item, chore, rooms_by_id)
    due_at = occurrence.get("dueAt")
    current = assignee_id(item)
    return {
        "occurrenceId": occ_id,
        "title": chore_title(item),
        "dueAt": due_at if isinstance(due_at, str) else None,
        "roomName": room_name,
        "assigneeId": current,
        "assigneeName": member_names.get(current) if current else None,
    }


def kiosk_items(
    data: dict[str, Any] | None,
    member_id: str,
) -> dict[str, list[dict[str, Any]]] | None:
    """
    Split actionable occurrences into a member's assigned and up-for-grabs lists.

    Returns None when the member is not in this household. Up for grabs covers
    chores the member is eligible for (the server's claim rules) but that are
    unassigned or assigned to someone else. This filters what the kiosk shows;
    the server's complete endpoint does not check eligibility itself.
    """
    member_names = _member_names(data or {})
    if member_id not in member_names:
        return None
    rooms_by_id = _rooms_by_id(data)
    member_ids = list(member_names)
    occurrences = data.get("occurrences") or []
    assigned: list[dict[str, Any]] = []
    available: list[dict[str, Any]] = []
    for item in occurrences if isinstance(occurrences, list) else []:
        if not isinstance(item, dict) or not is_actionable(item):
            continue
        row = _kiosk_item(item, rooms_by_id, member_names)
        if row is None:
            continue
        if row["assigneeId"] == member_id:
            assigned.append(row)
            continue
        eligible = eligible_member_ids(item, member_ids)
        if eligible is None:
            # No assignment to judge by: only unassigned chores are fair game.
            if row["assigneeId"] is None:
                available.append(row)
        elif member_id in eligible:
            available.append(row)

    def _by_due(row: dict[str, Any]) -> tuple[bool, str]:
        due = row["dueAt"]
        return (due is None, due or "")

    assigned.sort(key=_by_due)
    available.sort(key=_by_due)
    return {"assigned": assigned, "available": available}


def _member_view(member: dict[str, Any]) -> dict[str, Any] | None:
    member_id = member.get("id")
    if not isinstance(member_id, str) or not member_id:
        return None
    name = member.get("displayName")
    colour = member.get("colour")
    avatar = member.get("avatar")
    return {
        "id": member_id,
        "displayName": name if isinstance(name, str) and name else member_id,
        "colour": colour if isinstance(colour, str) else None,
        "avatar": avatar if isinstance(avatar, str) and avatar else None,
    }


def _due_by_end_of_today(due_at: Any, today: date, timezone_name: str | None) -> bool:
    due = parse_due_at(due_at)
    if due is None:
        return False
    return due_local_date(due, timezone_name) <= today


def kiosk_list(
    data: dict[str, Any] | None,
    *,
    now: datetime | None = None,
) -> dict[str, Any]:
    """
    Household chores for the kiosk card, mirroring the web app's kiosk list.

    Rows are actionable occurrences due by the end of today (household time) plus
    every decay chore, which stays listed by freshness. Locked occurrences are
    already omitted by the server list.
    """
    data = data or {}
    household = data.get("household") or {}
    timezone_name = household.get("timezone") if isinstance(household, dict) else None
    zone = household_zone(timezone_name)
    today = local_today(timezone_name, now=now)
    members = [
        view
        for member in (data.get("members") or [])
        if isinstance(member, dict) and (view := _member_view(member)) is not None
    ]
    by_id = {member["id"]: member for member in members}
    rooms_by_id = _rooms_by_id(data)

    rows: list[dict[str, Any]] = []
    occurrences = data.get("occurrences") or []
    for item in occurrences if isinstance(occurrences, list) else []:
        if not isinstance(item, dict) or not is_actionable(item):
            continue
        occurrence = occurrence_row(item)
        if occurrence is None:
            continue
        occ_id = occurrence.get("id")
        if not isinstance(occ_id, str) or not occ_id:
            continue
        chore = item.get("chore") if isinstance(item.get("chore"), dict) else {}
        schedule = (
            chore.get("schedule") if isinstance(chore.get("schedule"), dict) else {}
        )
        decay = schedule.get("type") == "decay"
        due_at = occurrence.get("dueAt")
        if not decay and not _due_by_end_of_today(due_at, today, timezone_name):
            continue
        _, room_name = _resolve_room(item, chore, rooms_by_id)
        current = assignee_id(item)
        freshness = item.get("freshnessPct")
        points = chore.get("points")
        rows.append(
            {
                "occurrenceId": occ_id,
                "title": chore_title(item),
                "dueAt": due_at if isinstance(due_at, str) else None,
                "roomName": room_name,
                "assignee": by_id.get(current) if current else None,
                "points": points if isinstance(points, int) else 0,
                "freshnessPct": freshness
                if isinstance(freshness, (int, float)) and decay
                else None,
                "decay": decay,
                # Who may claim it, per the server's claim rules; None when the
                # chore carries no assignment to judge by.
                "eligibleMemberIds": eligible_member_ids(item, list(by_id)),
            }
        )

    rows.sort(key=lambda row: (row["dueAt"] is None, row["dueAt"] or ""))
    return {
        "members": members,
        "rows": rows,
        "points": bool(household.get("featurePoints"))
        if isinstance(household, dict)
        else False,
        "timezone": str(zone),
    }


@callback
def async_setup_websocket(hass: HomeAssistant) -> None:
    """Register WebSocket commands (idempotent)."""
    key = f"{DOMAIN}_websocket_setup"
    if hass.data.get(key):
        return
    websocket_api.async_register_command(hass, websocket_freshness)
    websocket_api.async_register_command(hass, websocket_kiosk_items)
    websocket_api.async_register_command(hass, websocket_kiosk_list)
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


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_KIOSK_ITEMS,
        vol.Required(ATTR_MEMBER_ID): cv.string,
        vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string,
    }
)
@websocket_api.async_response
async def websocket_kiosk_items(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return a member's assigned and up-for-grabs chores for the kiosk card."""
    try:
        coordinator = _coordinator_for(hass, msg.get(ATTR_CONFIG_ENTRY_ID))
    except HomeAssistantError as err:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, str(err))
        return

    result = kiosk_items(coordinator.data, msg[ATTR_MEMBER_ID])
    if result is None:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown member")
        return

    connection.send_result(
        msg["id"],
        {
            **result,
            "config_entry_id": coordinator.config_entry.entry_id
            if coordinator.config_entry
            else None,
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_KIOSK_LIST,
        vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string,
    }
)
@websocket_api.async_response
async def websocket_kiosk_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return members and today's household chores for the kiosk card."""
    try:
        coordinator = _coordinator_for(hass, msg.get(ATTR_CONFIG_ENTRY_ID))
    except HomeAssistantError as err:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, str(err))
        return

    connection.send_result(
        msg["id"],
        {
            **kiosk_list(coordinator.data),
            "config_entry_id": coordinator.config_entry.entry_id
            if coordinator.config_entry
            else None,
        },
    )
