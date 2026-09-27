"""Fixtures for Chore Tracker tests."""

from __future__ import annotations

from collections.abc import Generator
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.const import CONF_TOKEN, CONF_URL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.chore_tracker.const import DOMAIN

pytest_plugins = "pytest_homeassistant_custom_component"

HOUSEHOLD = {
    "id": "hh_test_1",
    "name": "Test Household",
    "timezone": "UTC",
    "weekStart": "monday",
    "gamificationPreset": "off",
    "featurePoints": False,
    "featureRewards": False,
    "featureApproval": False,
    "featureStreaks": False,
    "featureFairness": False,
    "haIngressUnlinkedPolicy": "auto_create",
    "onboardingStep": 7,
    "onboardingCompletedAt": "2026-01-01T00:00:00.000Z",
    "createdAt": "2026-01-01T00:00:00.000Z",
}

OCCURRENCES: list[dict[str, Any]] = []

MOCK_URL = "http://816670ef-chore-tracker:8080"
MOCK_TOKEN = "ct_test_token_secret"


def _configure_client(client: MagicMock) -> MagicMock:
    """Attach default async behavior to a mocked API client instance."""
    client.async_get_household = AsyncMock(return_value=HOUSEHOLD)
    client.async_get_snapshot = AsyncMock(
        return_value={
            "household": HOUSEHOLD,
            "occurrences": OCCURRENCES,
            "fetched_at": "2026-01-01T00:00:00+00:00",
        }
    )
    client.async_get_occurrences = AsyncMock(return_value=OCCURRENCES)
    client.start_ws_listener = MagicMock()
    client.async_stop_ws_listener = AsyncMock()
    client.ws_connected = False
    client.last_event_id = None
    client.last_error = None
    client.url = MOCK_URL
    return client


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Enable custom integrations for all tests."""


@pytest.fixture
def mock_api() -> Generator[MagicMock]:
    """Patch the API client used by config flow and setup."""
    with (
        patch(
            "custom_components.chore_tracker.config_flow.ChoreTrackerApiClient",
        ) as mock_flow_cls,
        patch(
            "custom_components.chore_tracker.ChoreTrackerApiClient",
        ) as mock_setup_cls,
    ):
        flow_client = _configure_client(mock_flow_cls.return_value)
        _configure_client(mock_setup_cls.return_value)
        yield flow_client


@pytest.fixture
def mock_config_entry() -> MockConfigEntry:
    """Return a mock config entry."""
    return MockConfigEntry(
        domain=DOMAIN,
        title=HOUSEHOLD["name"],
        data={CONF_URL: MOCK_URL, CONF_TOKEN: MOCK_TOKEN},
        unique_id=HOUSEHOLD["id"],
    )


@pytest.fixture
async def setup_integration(
    hass: HomeAssistant,
    mock_api: MagicMock,
    mock_config_entry: MockConfigEntry,
) -> MockConfigEntry:
    """Set up the integration."""
    mock_config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    return mock_config_entry
