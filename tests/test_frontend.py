"""Tests for Lovelace card static path and resource registration."""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.const import CONF_TOKEN, CONF_URL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.chore_tracker.const import (
    CARD_FILENAME,
    DOMAIN,
    FRONTEND_SETUP_KEY,
    URL_BASE,
)
from custom_components.chore_tracker.frontend import (
    _async_register_lovelace_resource,
    async_setup_frontend,
    async_unload_frontend,
    card_resource_url,
)
from tests.conftest import HOUSEHOLD, MOCK_TOKEN, MOCK_URL


class _FakeStorageResources:
    """Minimal storage-mode resources collection."""

    def __init__(self) -> None:
        self.loaded = True
        self._items: dict[str, dict[str, Any]] = {}
        self._next_id = 1

    def async_items(self) -> list[dict[str, Any]]:
        return list(self._items.values())

    async def async_get_info(self) -> dict[str, Any]:
        return {"version": 1}

    async def async_load(self) -> None:
        self.loaded = True

    async def async_create_item(self, data: dict[str, Any]) -> dict[str, Any]:
        item_id = str(self._next_id)
        self._next_id += 1
        item = {"id": item_id, "type": "module", "url": data["url"]}
        self._items[item_id] = item
        return item

    async def async_update_item(
        self, item_id: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        item = self._items[item_id]
        if "url" in data:
            item["url"] = data["url"]
        if "res_type" in data:
            item["type"] = data["res_type"]
        return item


class _YamlResources:
    """Read-only YAML-mode stand-in."""

    def async_items(self) -> list[dict[str, Any]]:
        return []


async def test_setup_frontend_registers_once(
    hass: HomeAssistant,
    mock_http: MagicMock,
) -> None:
    """Static path + resource registration run once, then are skipped."""
    with patch(
        "custom_components.chore_tracker.frontend._async_register_lovelace_resource",
        new_callable=AsyncMock,
    ) as mock_register_resource:
        await async_setup_frontend(hass)
        await async_setup_frontend(hass)

        mock_http.async_register_static_paths.assert_awaited_once()
        configs = mock_http.async_register_static_paths.await_args.args[0]
        assert len(configs) == 1
        assert configs[0].url_path == URL_BASE
        mock_register_resource.assert_awaited_once_with(
            hass, card_resource_url("0.4.0")
        )
        assert hass.data[FRONTEND_SETUP_KEY] is True


async def test_setup_frontend_idempotent_across_entries(
    hass: HomeAssistant,
    mock_api: MagicMock,
    mock_http: MagicMock,
) -> None:
    """Second config entry does not re-register the static path."""
    with patch(
        "custom_components.chore_tracker.frontend._async_register_lovelace_resource",
        new_callable=AsyncMock,
    ) as mock_register_resource:
        entry_a = MockConfigEntry(
            domain=DOMAIN,
            title=HOUSEHOLD["name"],
            data={CONF_URL: MOCK_URL, CONF_TOKEN: MOCK_TOKEN},
            unique_id=HOUSEHOLD["id"],
        )
        entry_a.add_to_hass(hass)
        assert await hass.config_entries.async_setup(entry_a.entry_id)
        await hass.async_block_till_done()

        entry_b = MockConfigEntry(
            domain=DOMAIN,
            title="Other",
            data={CONF_URL: MOCK_URL, CONF_TOKEN: MOCK_TOKEN},
            unique_id="hh_other",
        )
        entry_b.add_to_hass(hass)
        assert await hass.config_entries.async_setup(entry_b.entry_id)
        await hass.async_block_till_done()

        mock_http.async_register_static_paths.assert_awaited_once()
        mock_register_resource.assert_awaited_once()
        assert hass.data[FRONTEND_SETUP_KEY] is True


async def test_register_resource_storage_mode_creates_and_updates(
    hass: HomeAssistant,
) -> None:
    """Storage-mode resources are created once and updated on version change."""
    resources = _FakeStorageResources()
    hass.data["lovelace"] = {"resources": resources}

    with patch(
        "custom_components.chore_tracker.frontend._is_storage_collection",
        return_value=True,
    ):
        url_v1 = card_resource_url("0.4.0")
        await _async_register_lovelace_resource(hass, url_v1)
        items = resources.async_items()
        assert len(items) == 1
        assert items[0]["url"] == url_v1
        assert items[0]["type"] == "module"

        url_v2 = card_resource_url("0.4.1")
        await _async_register_lovelace_resource(hass, url_v2)
        items = resources.async_items()
        assert len(items) == 1
        assert items[0]["url"] == url_v2


async def test_register_resource_yaml_mode_logs_warning(
    hass: HomeAssistant,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """YAML-mode resources are not mutated; a warning explains the manual step."""
    hass.data["lovelace"] = {"resources": _YamlResources()}

    with patch(
        "custom_components.chore_tracker.frontend._is_storage_collection",
        return_value=False,
    ):
        await _async_register_lovelace_resource(hass, card_resource_url("0.4.0"))

    assert "YAML mode" in caplog.text
    assert CARD_FILENAME in caplog.text


async def test_unload_frontend_clears_flag_when_last_entry(
    hass: HomeAssistant,
) -> None:
    """Unload clears the setup flag only when no entries remain in hass.data."""
    hass.data[FRONTEND_SETUP_KEY] = True
    hass.data[DOMAIN] = {"entry": object()}
    await async_unload_frontend(hass)
    assert FRONTEND_SETUP_KEY in hass.data

    hass.data[DOMAIN] = {}
    await async_unload_frontend(hass)
    assert FRONTEND_SETUP_KEY not in hass.data
