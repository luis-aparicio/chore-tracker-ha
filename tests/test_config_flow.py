"""Tests for the Chore Tracker config flow."""

from __future__ import annotations

from unittest.mock import AsyncMock

from homeassistant.config_entries import SOURCE_USER
from homeassistant.const import CONF_TOKEN, CONF_URL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers.service_info.hassio import HassioServiceInfo
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.chore_tracker.api import (
    ChoreTrackerAuthError,
    ChoreTrackerConnectionError,
)
from custom_components.chore_tracker.const import DOMAIN
from tests.conftest import HOUSEHOLD, MOCK_TOKEN, MOCK_URL


async def test_user_flow_success(hass: HomeAssistant, mock_api: AsyncMock) -> None:
    """Test a successful manual user flow."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": SOURCE_USER},
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"

    result2 = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_URL: MOCK_URL + "/", CONF_TOKEN: f"  {MOCK_TOKEN}  "},
    )
    await hass.async_block_till_done()

    assert result2["type"] is FlowResultType.CREATE_ENTRY
    assert result2["title"] == HOUSEHOLD["name"]
    assert result2["data"][CONF_URL] == MOCK_URL
    assert result2["data"][CONF_TOKEN] == MOCK_TOKEN
    assert result2["result"].unique_id == HOUSEHOLD["id"]


async def test_user_flow_invalid_auth(hass: HomeAssistant, mock_api: AsyncMock) -> None:
    """Test manual flow with an invalid token."""
    mock_api.async_get_household = AsyncMock(
        side_effect=ChoreTrackerAuthError("Invalid API token")
    )

    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": SOURCE_USER},
    )
    result2 = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_URL: MOCK_URL, CONF_TOKEN: "ct_bad"},
    )

    assert result2["type"] is FlowResultType.FORM
    assert result2["errors"]["base"] == "invalid_auth"
    assert not hass.config_entries.async_entries(DOMAIN)


async def test_user_flow_cannot_connect(
    hass: HomeAssistant, mock_api: AsyncMock
) -> None:
    """Test manual flow when the server is unreachable."""
    mock_api.async_get_household = AsyncMock(
        side_effect=ChoreTrackerConnectionError("down")
    )

    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": SOURCE_USER},
    )
    result2 = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_URL: MOCK_URL, CONF_TOKEN: MOCK_TOKEN},
    )

    assert result2["type"] is FlowResultType.FORM
    assert result2["errors"]["base"] == "cannot_connect"


async def test_hassio_flow_confirm(hass: HomeAssistant, mock_api: AsyncMock) -> None:
    """Test Supervisor discovery confirm flow."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": "hassio"},
        data=HassioServiceInfo(
            config={
                "host": "816670ef-chore-tracker",
                "port": 8080,
                "token": MOCK_TOKEN,
            },
            name="chore_tracker",
            slug="chore_tracker",
            uuid="00000000-0000-0000-0000-000000000001",
        ),
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "hassio_confirm"

    result2 = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        user_input={},
    )
    await hass.async_block_till_done()

    assert result2["type"] is FlowResultType.CREATE_ENTRY
    assert result2["data"][CONF_URL] == MOCK_URL
    assert result2["data"][CONF_TOKEN] == MOCK_TOKEN
    assert result2["result"].unique_id == HOUSEHOLD["id"]


async def test_hassio_flow_updates_existing(
    hass: HomeAssistant,
    mock_api: AsyncMock,
) -> None:
    """Test discovery updates URL/token on an existing unique_id."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title=HOUSEHOLD["name"],
        data={CONF_URL: "http://old-host:8080", CONF_TOKEN: "ct_old"},
        unique_id=HOUSEHOLD["id"],
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": "hassio"},
        data=HassioServiceInfo(
            config={
                "host": "816670ef-chore-tracker",
                "port": 8080,
                "token": MOCK_TOKEN,
            },
            name="chore_tracker",
            slug="chore_tracker",
            uuid="00000000-0000-0000-0000-000000000001",
        ),
    )

    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"
    assert entry.data[CONF_URL] == MOCK_URL
    assert entry.data[CONF_TOKEN] == MOCK_TOKEN
