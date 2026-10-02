"""Tests for chore_tracker WebSocket commands."""

from __future__ import annotations

from datetime import UTC, datetime

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.chore_tracker.websocket import (
    freshness_rows,
    kiosk_items,
    kiosk_list,
)
from tests.conftest import MEMBERS, OCCURRENCES, ROOMS


def test_freshness_rows_skips_completed_and_includes_room() -> None:
    """Freshness rows are actionable only and carry room / lastCompletedAt."""
    rows = freshness_rows(
        {
            "rooms": ROOMS,
            "occurrences": OCCURRENCES,
        }
    )
    assert [row["occurrenceId"] for row in rows] == ["occ_alex_1", "occ_open_1"]
    trash = rows[0]
    assert trash["title"] == "Take out trash"
    assert trash["roomId"] == "room_kitchen"
    assert trash["roomName"] == "Kitchen"
    assert trash["lastCompletedAt"] == "2026-09-20T12:00:00.000Z"
    assert trash["freshnessPct"] is None

    plants = rows[1]
    assert plants["roomId"] is None
    assert plants["roomName"] is None
    assert plants["lastCompletedAt"] is None


def test_freshness_rows_resolves_room_from_map_when_projection_missing() -> None:
    """Fall back to chore.roomId + rooms list when room projection is absent."""
    rows = freshness_rows(
        {
            "rooms": ROOMS,
            "occurrences": [
                {
                    "occurrence": {
                        "id": "occ_x",
                        "choreId": "chore_x",
                        "dueAt": "2026-09-28T12:00:00.000Z",
                        "state": "pending",
                    },
                    "chore": {
                        "id": "chore_x",
                        "title": "Mop",
                        "roomId": "room_bath",
                    },
                    "assignee": None,
                }
            ],
        }
    )
    assert len(rows) == 1
    assert rows[0]["roomId"] == "room_bath"
    assert rows[0]["roomName"] == "Bath"


def test_freshness_rows_empty_without_data() -> None:
    """Empty / missing coordinator data yields no rows."""
    assert freshness_rows(None) == []
    assert freshness_rows({}) == []


def _occ(
    occ_id: str,
    *,
    assignee: str | None,
    assignment: dict | None,
    due: str,
    state: str = "pending",
) -> dict:
    chore: dict = {"id": f"chore_{occ_id}", "title": occ_id.title()}
    if assignment is not None:
        chore["assignment"] = assignment
    return {
        "occurrence": {
            "id": occ_id,
            "choreId": chore["id"],
            "assigneeId": assignee,
            "dueAt": due,
            "state": state,
        },
        "chore": chore,
    }


KIOSK_OCCURRENCES = [
    _occ(
        "mine",
        assignee="mem_sam",
        assignment={
            "strategy": "fixed",
            "fixedMemberId": "mem_sam",
            "pool": ["mem_sam"],
        },
        due="2026-09-29T09:00:00.000Z",
    ),
    _occ(
        "open_all",
        assignee=None,
        assignment={"strategy": "open", "pool": []},
        due="2026-09-28T09:00:00.000Z",
    ),
    _occ(
        "others_pool",
        assignee="mem_alex",
        assignment={
            "strategy": "fixed",
            "fixedMemberId": "mem_alex",
            "pool": ["mem_alex", "mem_sam"],
        },
        due="2026-09-30T09:00:00.000Z",
    ),
    _occ(
        "not_eligible",
        assignee="mem_alex",
        assignment={
            "strategy": "fixed",
            "fixedMemberId": "mem_alex",
            "pool": ["mem_alex"],
        },
        due="2026-09-27T09:00:00.000Z",
    ),
    _occ(
        "open_pool_excludes",
        assignee=None,
        assignment={"strategy": "open", "pool": ["mem_alex"]},
        due="2026-09-27T09:00:00.000Z",
    ),
    _occ(
        "legacy_unassigned",
        assignee=None,
        assignment=None,
        due="2026-10-01T09:00:00.000Z",
    ),
    _occ(
        "done",
        assignee=None,
        assignment={"strategy": "open", "pool": []},
        due="2026-09-26T09:00:00.000Z",
        state="completed",
    ),
]


def test_kiosk_items_splits_assigned_and_up_for_grabs() -> None:
    """Assigned to the member vs other chores they are eligible to do."""
    result = kiosk_items(
        {"members": MEMBERS, "rooms": ROOMS, "occurrences": KIOSK_OCCURRENCES},
        "mem_sam",
    )
    assert result is not None
    assert [row["occurrenceId"] for row in result["assigned"]] == ["mine"]
    assert [row["occurrenceId"] for row in result["available"]] == [
        "open_all",
        "others_pool",
        "legacy_unassigned",
    ]
    others = result["available"][1]
    assert others["assigneeId"] == "mem_alex"
    assert others["assigneeName"] == "Alex"
    assert result["available"][0]["assigneeName"] is None


def test_kiosk_items_unknown_member() -> None:
    """A member outside this household gets None (not another household's data)."""
    assert (
        kiosk_items({"members": MEMBERS, "occurrences": KIOSK_OCCURRENCES}, "mem_x")
        is None
    )
    assert kiosk_items(None, "mem_x") is None


async def test_kiosk_items_websocket(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
) -> None:
    """The WS command returns lists for a member and errors for unknown ones."""
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": "chore_tracker/kiosk_items", "member_id": "mem_alex"}
    )
    msg = await client.receive_json()
    assert msg["success"]
    assert [row["occurrenceId"] for row in msg["result"]["assigned"]] == ["occ_alex_1"]
    assert [row["occurrenceId"] for row in msg["result"]["available"]] == ["occ_open_1"]
    assert msg["result"]["config_entry_id"] == setup_integration.entry_id

    await client.send_json_auto_id(
        {"type": "chore_tracker/kiosk_items", "member_id": "mem_nobody"}
    )
    msg = await client.receive_json()
    assert not msg["success"]
    assert msg["error"]["code"] == "not_found"


DEFAULT_POINTS = 3
DECAY_FRESHNESS = 62.5


def _list_occ(  # noqa: PLR0913 — test row builder
    occ_id: str,
    *,
    due: str,
    assignee: str | None = None,
    schedule: str = "interval",
    freshness: float | None = None,
    points: int = DEFAULT_POINTS,
    state: str = "pending",
) -> dict:
    return {
        "occurrence": {
            "id": occ_id,
            "choreId": f"chore_{occ_id}",
            "assigneeId": assignee,
            "dueAt": due,
            "state": state,
        },
        "chore": {
            "id": f"chore_{occ_id}",
            "title": occ_id.title(),
            "points": points,
            "schedule": {"type": schedule},
        },
        "freshnessPct": freshness,
    }


def test_kiosk_list_today_overdue_and_decay() -> None:
    """Due by end of household today plus all decay chores, like the web kiosk."""
    household = {"timezone": "America/Chicago", "featurePoints": True}
    data = {
        "household": household,
        "members": MEMBERS,
        "occurrences": [
            _list_occ("overdue", due="2026-09-29T14:00:00.000Z", assignee="mem_alex"),
            # 03:00Z on Oct 2 is still Oct 1 in Chicago.
            _list_occ("tonight", due="2026-10-02T03:00:00.000Z"),
            _list_occ("all_day_today", due="2026-10-01"),
            _list_occ("tomorrow", due="2026-10-02T15:00:00.000Z"),
            _list_occ(
                "decay",
                due="2026-10-09T15:00:00.000Z",
                schedule="decay",
                freshness=DECAY_FRESHNESS,
            ),
            _list_occ("done", due="2026-09-30T15:00:00.000Z", state="completed"),
        ],
    }
    result = kiosk_list(data, now=datetime(2026, 10, 1, 18, 0, tzinfo=UTC))

    ids = [row["occurrenceId"] for row in result["rows"]]
    assert ids == ["overdue", "all_day_today", "tonight", "decay"]
    overdue = result["rows"][0]
    assert overdue["assignee"] == {
        "id": "mem_alex",
        "displayName": "Alex",
        "colour": "#112233",
        "avatar": None,
    }
    assert overdue["points"] == DEFAULT_POINTS
    assert overdue["freshnessPct"] is None
    decay = result["rows"][3]
    assert decay["decay"] is True
    # No assignment on these test chores: claim eligibility is unknown.
    assert decay["eligibleMemberIds"] is None
    assert decay["strategy"] is None
    assert decay["freshnessPct"] == DECAY_FRESHNESS
    assert result["points"] is True
    assert result["timezone"] == "America/Chicago"
    assert [member["displayName"] for member in result["members"]] == ["Alex", "Sam"]


def test_kiosk_list_empty_without_data() -> None:
    """Missing coordinator data yields an empty, well-formed payload."""
    result = kiosk_list(None)
    assert result["rows"] == []
    assert result["members"] == []
    assert result["points"] is False


async def test_kiosk_list_websocket(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    setup_integration: MockConfigEntry,
) -> None:
    """The WS command returns members, rows, and the entry id."""
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "chore_tracker/kiosk_list"})
    msg = await client.receive_json()
    assert msg["success"]
    assert {member["id"] for member in msg["result"]["members"]} == {
        "mem_alex",
        "mem_sam",
    }
    assert msg["result"]["config_entry_id"] == setup_integration.entry_id
    assert isinstance(msg["result"]["rows"], list)


def test_kiosk_list_carries_assignment_strategy() -> None:
    """Rows expose the strategy so the card only offers Release on open chores."""
    result = kiosk_list(
        {"members": MEMBERS, "occurrences": KIOSK_OCCURRENCES},
        now=datetime(2026, 10, 1, 18, 0, tzinfo=UTC),
    )
    by_id = {row["occurrenceId"]: row for row in result["rows"]}
    assert by_id["open_all"]["strategy"] == "open"
    assert by_id["mine"]["strategy"] == "fixed"
