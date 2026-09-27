"""Tests for Chore Tracker domain services and bus events."""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import patch

from homeassistant.core import Event, HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.chore_tracker.const import (
    DOMAIN,
    EVENT_COMPLETED,
    EVENT_OVERDUE,
    SERVICE_ASSIGN,
    SERVICE_COMPLETE,
    SERVICE_SKIP,
    SERVICE_SNOOZE,
)


async def test_services_call_api(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Domain services map to the correct API helpers and refresh."""
    coordinator = setup_integration.runtime_data
    client = coordinator.client

    events: list[Event] = []

    def _capture(event: Event) -> None:
        events.append(event)

    hass.bus.async_listen(EVENT_COMPLETED, _capture)

    await hass.services.async_call(
        DOMAIN,
        SERVICE_COMPLETE,
        {"occurrence_id": "occ_alex_1", "completed_for_member_id": "mem_sam"},
        blocking=True,
    )
    client.async_complete_occurrence.assert_awaited_with(
        "occ_alex_1", body={"completedForMemberId": "mem_sam"}
    )
    await hass.async_block_till_done()
    assert len(events) == 1
    assert events[0].data["occurrence_id"] == "occ_alex_1"

    await hass.services.async_call(
        DOMAIN,
        SERVICE_SKIP,
        {"occurrence_id": "occ_alex_1"},
        blocking=True,
    )
    client.async_skip_occurrence.assert_awaited_with("occ_alex_1")

    await hass.services.async_call(
        DOMAIN,
        SERVICE_SNOOZE,
        {"occurrence_id": "occ_alex_1", "snooze_until": "2026-09-28T18:00:00"},
        blocking=True,
    )
    client.async_snooze_occurrence.assert_awaited_with(
        "occ_alex_1", snooze_until="2026-09-28T18:00:00"
    )

    await hass.services.async_call(
        DOMAIN,
        SERVICE_ASSIGN,
        {"occurrence_id": "occ_alex_1", "assignee_id": "mem_sam"},
        blocking=True,
    )
    client.async_reassign_occurrence.assert_awaited_with(
        "occ_alex_1", assignee_id="mem_sam"
    )


async def test_completed_bus_event_from_ws(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """WS completed domain events fire chore_tracker_completed."""
    coordinator = setup_integration.runtime_data
    events: list[Event] = []

    def _capture(event: Event) -> None:
        events.append(event)

    hass.bus.async_listen(EVENT_COMPLETED, _capture)

    with patch.object(coordinator, "async_request_refresh") as refresh:
        await coordinator._async_on_ws_message(
            {
                "type": "event",
                "event": {
                    "id": "evt_1",
                    "householdId": "hh_test_1",
                    "type": "completed",
                    "choreId": "chore_1",
                    "occurrenceId": "occ_alex_1",
                    "actorId": "mem_alex",
                    "payload": {},
                    "createdAt": "2026-09-27T12:00:00.000Z",
                },
            }
        )
        refresh.assert_awaited()

    await hass.async_block_till_done()
    assert len(events) == 1
    assert events[0].data["occurrence_id"] == "occ_alex_1"
    assert events[0].data["chore_id"] == "chore_1"


async def test_overdue_edge_event(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Newly overdue occurrences fire chore_tracker_overdue once."""
    coordinator = setup_integration.runtime_data
    events: list[Event] = []

    def _capture(event: Event) -> None:
        events.append(event)

    hass.bus.async_listen(EVENT_OVERDUE, _capture)

    fixed_now = datetime(2026, 9, 27, 16, 0, tzinfo=UTC)
    with patch(
        "custom_components.chore_tracker.helpers.dt_util.utcnow",
        return_value=fixed_now,
    ):
        # Seed: already overdue — should not fire.
        data = dict(coordinator.data)
        data["occurrences"] = [
            {
                "occurrence": {
                    "id": "occ_seed",
                    "householdId": "hh_test_1",
                    "choreId": "chore_seed",
                    "assigneeId": "mem_alex",
                    "dueAt": "2026-09-20T12:00:00.000Z",
                    "state": "pending",
                    "createdAt": "2026-01-01T00:00:00.000Z",
                },
                "chore": {"id": "chore_seed", "title": "Seed overdue"},
                "assignee": {"id": "mem_alex", "displayName": "Alex"},
            }
        ]
        # Reset seed state so this update is treated as first seed after setup.
        coordinator._overdue_seeded = False
        coordinator._known_overdue_ids = set()
        coordinator.async_set_updated_data(data)
        await hass.async_block_till_done()
        assert events == []

        # New overdue id — should fire.
        data = dict(coordinator.data)
        data["occurrences"] = [
            *data["occurrences"],
            {
                "occurrence": {
                    "id": "occ_new_late",
                    "householdId": "hh_test_1",
                    "choreId": "chore_new",
                    "assigneeId": "mem_sam",
                    "dueAt": "2026-09-26T08:00:00.000Z",
                    "state": "pending",
                    "createdAt": "2026-01-01T00:00:00.000Z",
                },
                "chore": {"id": "chore_new", "title": "Newly late"},
                "assignee": {"id": "mem_sam", "displayName": "Sam"},
            },
        ]
        coordinator.async_set_updated_data(data)
        await hass.async_block_till_done()

    assert len(events) == 1
    assert events[0].data["occurrence_id"] == "occ_new_late"
    assert events[0].data["chore_title"] == "Newly late"
    assert events[0].data["assignee_id"] == "mem_sam"
