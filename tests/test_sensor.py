"""Tests for member count sensors."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry


async def test_member_sensors_created(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Per-member due_today and overdue sensors are created."""
    assert hass.states.get("sensor.alex_due_today") is not None
    assert hass.states.get("sensor.alex_overdue") is not None
    assert hass.states.get("sensor.sam_due_today") is not None
    assert hass.states.get("sensor.sam_overdue") is not None

    due = hass.states.get("sensor.alex_due_today")
    assert due is not None
    assert due.attributes.get("state_class") == "measurement"


async def test_due_today_and_overdue_counts(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Counts reflect household-local due day and overdue rules."""
    coordinator = setup_integration.runtime_data
    data = dict(coordinator.data)
    data["occurrences"] = [
        {
            "occurrence": {
                "id": "occ_today",
                "householdId": "hh_test_1",
                "choreId": "chore_t",
                "assigneeId": "mem_alex",
                "dueAt": "2026-09-27T18:00:00.000Z",
                "state": "pending",
                "createdAt": "2026-01-01T00:00:00.000Z",
            },
            "chore": {"id": "chore_t", "title": "Today chore"},
            "assignee": {"id": "mem_alex", "displayName": "Alex"},
        },
        {
            "occurrence": {
                "id": "occ_overdue",
                "householdId": "hh_test_1",
                "choreId": "chore_o",
                "assigneeId": "mem_alex",
                "dueAt": "2026-09-26T12:00:00.000Z",
                "state": "pending",
                "createdAt": "2026-01-01T00:00:00.000Z",
            },
            "chore": {"id": "chore_o", "title": "Overdue chore"},
            "assignee": {"id": "mem_alex", "displayName": "Alex"},
        },
        {
            "occurrence": {
                "id": "occ_open_overdue",
                "householdId": "hh_test_1",
                "choreId": "chore_open",
                "assigneeId": None,
                "dueAt": "2026-09-25T12:00:00.000Z",
                "state": "pending",
                "createdAt": "2026-01-01T00:00:00.000Z",
            },
            "chore": {"id": "chore_open", "title": "Open overdue"},
            "assignee": None,
        },
    ]

    # 16:00 — today chore (18:00) counts due_today only; yesterday is overdue.
    fixed_now = datetime(2026, 9, 27, 16, 0, tzinfo=UTC)
    with patch(
        "custom_components.chore_tracker.helpers.dt_util.utcnow",
        return_value=fixed_now,
    ):
        coordinator.async_set_updated_data(data)
        await hass.async_block_till_done()

        assert hass.states.get("sensor.alex_due_today").state == "1"
        assert hass.states.get("sensor.alex_overdue").state == "1"
        assert hass.states.get("sensor.sam_due_today").state == "0"
        assert hass.states.get("sensor.sam_overdue").state == "0"


async def test_member_sensor_added_and_removed(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """New members get sensors; removed members drop from the registry."""
    coordinator = setup_integration.runtime_data
    data = dict(coordinator.data)
    members: list[dict[str, Any]] = list(data["members"])
    members.append(
        {
            "id": "mem_pat",
            "householdId": "hh_test_1",
            "displayName": "Pat",
            "role": "member",
            "colour": "#778899",
            "avatar": None,
            "haUserId": None,
            "username": None,
            "createdAt": "2026-01-01T00:00:00.000Z",
            "invitePending": False,
            "inviteExpiresAt": None,
        }
    )
    data["members"] = members
    coordinator.async_set_updated_data(data)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.pat_due_today") is not None
    assert hass.states.get("sensor.pat_overdue") is not None

    data = dict(coordinator.data)
    data["members"] = [m for m in members if m["id"] != "mem_pat"]
    coordinator.async_set_updated_data(data)
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    assert registry.async_get("sensor.pat_due_today") is None
    assert registry.async_get("sensor.pat_overdue") is None
