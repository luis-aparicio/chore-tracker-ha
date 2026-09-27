"""Tests for Chore Tracker diagnostics."""

from __future__ import annotations

from homeassistant.const import CONF_TOKEN, CONF_URL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.chore_tracker.diagnostics import (
    async_get_config_entry_diagnostics,
)
from tests.conftest import MOCK_TOKEN, MOCK_URL


async def test_diagnostics_redacts_token(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Diagnostics redact the API token and expose url / WS fields."""
    entry = setup_integration
    diag = await async_get_config_entry_diagnostics(hass, entry)

    assert diag["entry"]["data"][CONF_URL] == MOCK_URL
    assert diag["entry"]["data"][CONF_TOKEN] == "ct_***"
    assert MOCK_TOKEN not in str(diag)
    assert "ws_connected" in diag["coordinator"]
    assert "last_event_id" in diag["coordinator"]
    assert "occurrence_count" in diag["coordinator"]
    assert diag["coordinator"]["household_id"] == "hh_test_1"
