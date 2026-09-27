"""Tests for chore_tracker WebSocket commands."""

from __future__ import annotations

from custom_components.chore_tracker.websocket import freshness_rows
from tests.conftest import OCCURRENCES, ROOMS


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
