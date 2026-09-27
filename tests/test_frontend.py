"""Tests for Lovelace card static path and resource registration."""

from __future__ import annotations

from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.const import CONF_TOKEN, CONF_URL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.chore_tracker.const import (
    CARD_FILENAME,
    DOMAIN,
    FRONTEND_RESOURCE_RETRY_KEY,
    FRONTEND_SETUP_KEY,
    URL_BASE,
)
from custom_components.chore_tracker.frontend import (
    _async_register_lovelace_resource,
    _card_digest,
    async_setup_frontend,
    async_unload_frontend,
    card_resource_url,
)
from tests.conftest import HOUSEHOLD, MOCK_TOKEN, MOCK_URL

WWW_CARD = (
    Path(__file__).resolve().parents[1]
    / "custom_components"
    / "chore_tracker"
    / "www"
    / CARD_FILENAME
)


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
    """Static path registers once; resource URL uses the bundle content hash."""
    with patch(
        "custom_components.chore_tracker.frontend._async_register_lovelace_resource",
        new_callable=AsyncMock,
        return_value=True,
    ) as mock_register_resource:
        await async_setup_frontend(hass)
        await async_setup_frontend(hass)

        mock_http.async_register_static_paths.assert_awaited_once()
        configs = mock_http.async_register_static_paths.await_args.args[0]
        assert len(configs) == 1
        assert configs[0].url_path == URL_BASE
        expected = card_resource_url(_card_digest(WWW_CARD))
        assert len(mock_register_resource.await_args_list) > 1
        mock_register_resource.assert_awaited_with(hass, expected)
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
        return_value=True,
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
        assert len(mock_register_resource.await_args_list) > 1
        assert hass.data[FRONTEND_SETUP_KEY] is True


async def test_setup_frontend_missing_bundle_skips_registration(
    hass: HomeAssistant,
    mock_http: MagicMock,
) -> None:
    """Missing www bundle does not register a static path or resource."""
    with (
        patch.object(
            hass, "async_add_executor_job", new_callable=AsyncMock, return_value=False
        ),
        patch(
            "custom_components.chore_tracker.frontend._async_register_lovelace_resource",
            new_callable=AsyncMock,
        ) as mock_register_resource,
    ):
        await async_setup_frontend(hass)

    mock_http.async_register_static_paths.assert_not_awaited()
    mock_register_resource.assert_not_awaited()
    assert FRONTEND_SETUP_KEY not in hass.data


async def test_register_resource_storage_mode_creates_and_updates(
    hass: HomeAssistant,
) -> None:
    """Storage-mode resources are created once and updated on digest change."""
    resources = _FakeStorageResources()
    hass.data["lovelace"] = {"resources": resources}

    with patch(
        "custom_components.chore_tracker.frontend._is_storage_collection",
        return_value=True,
    ):
        url_v1 = card_resource_url("abcd1234")
        assert await _async_register_lovelace_resource(hass, url_v1) is True
        items = resources.async_items()
        assert len(items) == 1
        assert items[0]["url"] == url_v1
        assert items[0]["type"] == "module"

        url_v2 = card_resource_url("efgh5678")
        assert await _async_register_lovelace_resource(hass, url_v2) is True
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
        assert (
            await _async_register_lovelace_resource(hass, card_resource_url("abcd1234"))
            is False
        )

    assert "YAML mode" in caplog.text
    assert CARD_FILENAME in caplog.text


async def test_unload_frontend_keeps_setup_flag(hass: HomeAssistant) -> None:
    """Unload must not clear the static-path flag (paths are not unregisterable)."""
    hass.data[FRONTEND_SETUP_KEY] = True
    hass.data[DOMAIN] = {}
    await async_unload_frontend(hass)
    assert hass.data[FRONTEND_SETUP_KEY] is True


async def test_setup_frontend_defers_when_lovelace_not_ready(
    hass: HomeAssistant,
    mock_http: MagicMock,
) -> None:
    """When Lovelace resources are missing, schedule a once-only deferred retry."""
    scheduled: list[Any] = []

    def _capture_when_setup(
        hass_: HomeAssistant, component: str, callback: Any
    ) -> None:
        assert component == "lovelace"
        scheduled.append(callback)

    with (
        patch(
            "custom_components.chore_tracker.frontend._async_register_lovelace_resource",
            new_callable=AsyncMock,
            return_value=False,
        ) as mock_register,
        patch(
            "custom_components.chore_tracker.frontend._lovelace_resources",
            return_value=None,
        ),
        patch(
            "custom_components.chore_tracker.frontend.async_when_setup_or_start",
            side_effect=_capture_when_setup,
        ),
    ):
        await async_setup_frontend(hass)

        assert mock_register.await_count == 1
        assert hass.data[FRONTEND_RESOURCE_RETRY_KEY] is True
        assert len(scheduled) == 1

        await scheduled[0](hass, "lovelace")
        after_retry = len(mock_register.await_args_list)
        assert after_retry > 1

        await async_setup_frontend(hass)
        assert len(scheduled) == 1
        assert len(mock_register.await_args_list) > after_retry


async def test_setup_frontend_does_not_defer_for_yaml_mode(
    hass: HomeAssistant,
    mock_http: MagicMock,
) -> None:
    """YAML-mode (resources present, non-storage) must not schedule a retry."""
    with (
        patch(
            "custom_components.chore_tracker.frontend._async_register_lovelace_resource",
            new_callable=AsyncMock,
            return_value=False,
        ),
        patch(
            "custom_components.chore_tracker.frontend._lovelace_resources",
            return_value=_YamlResources(),
        ),
        patch(
            "custom_components.chore_tracker.frontend.async_when_setup_or_start",
        ) as mock_when,
    ):
        await async_setup_frontend(hass)

    mock_when.assert_not_called()
    assert FRONTEND_RESOURCE_RETRY_KEY not in hass.data
