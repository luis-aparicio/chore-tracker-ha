"""Tests for the household overdue binary sensor."""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry


async def test_household_overdue_binary(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Binary sensor turns on when any actionable occurrence is overdue."""
    coordinator = setup_integration.runtime_data
    data = dict(coordinator.data)

    fixed_now = datetime(2026, 9, 27, 16, 0, tzinfo=UTC)
    with patch(
        "custom_components.chore_tracker.helpers.dt_util.utcnow",
        return_value=fixed_now,
    ):
        data["occurrences"] = [
            {
                "occurrence": {
                    "id": "occ_future",
                    "householdId": "hh_test_1",
                    "choreId": "chore_f",
                    "assigneeId": "mem_alex",
                    "dueAt": "2026-09-28T12:00:00.000Z",
                    "state": "pending",
                    "createdAt": "2026-01-01T00:00:00.000Z",
                },
                "chore": {"id": "chore_f", "title": "Future"},
                "assignee": {"id": "mem_alex", "displayName": "Alex"},
            }
        ]
        coordinator.async_set_updated_data(data)
        await hass.async_block_till_done()
        assert hass.states.get("binary_sensor.household_overdue").state == "off"

        data = dict(coordinator.data)
        data["occurrences"] = [
            {
                "occurrence": {
                    "id": "occ_late",
                    "householdId": "hh_test_1",
                    "choreId": "chore_l",
                    "assigneeId": None,
                    "dueAt": "2026-09-26T12:00:00.000Z",
                    "state": "pending",
                    "createdAt": "2026-01-01T00:00:00.000Z",
                },
                "chore": {"id": "chore_l", "title": "Late open"},
                "assignee": None,
            }
        ]
        coordinator.async_set_updated_data(data)
        await hass.async_block_till_done()
        assert hass.states.get("binary_sensor.household_overdue").state == "on"
