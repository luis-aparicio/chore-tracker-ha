"""Tests for integration setup."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.chore_tracker import PLATFORMS


async def test_setup_and_unload(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Integration forwards todo/calendar platforms and unloads cleanly."""
    entry = setup_integration
    assert entry.state is ConfigEntryState.LOADED
    assert entry.runtime_data is not None
    assert Platform.TODO in PLATFORMS
    assert Platform.CALENDAR in PLATFORMS
    assert Platform.SENSOR in PLATFORMS
    assert Platform.BINARY_SENSOR in PLATFORMS
    assert hass.states.get("todo.household_chores") is not None
    assert hass.states.get("calendar.chores") is not None
    assert hass.states.get("binary_sensor.household_overdue") is not None
    assert hass.states.get("sensor.alex_due_today") is not None
    assert hass.states.get("sensor.alex_overdue") is not None
    client = entry.runtime_data.client

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED
    client.async_stop_ws_listener.assert_awaited()
