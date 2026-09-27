"""Tests for integration setup."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry


async def test_setup_and_unload(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Integration sets up without platforms and unloads cleanly."""
    entry = setup_integration
    assert entry.state is ConfigEntryState.LOADED
    assert entry.runtime_data is not None
    client = entry.runtime_data.client

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED
    client.async_stop_ws_listener.assert_awaited()
