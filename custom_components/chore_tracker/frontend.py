"""Serve bundled Lovelace cards and auto-register the resource (storage mode)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import (
    CARD_FILENAME,
    DOMAIN,
    FRONTEND_SETUP_KEY,
    LOGGER,
    URL_BASE,
)

try:
    from homeassistant.components.lovelace import LOVELACE_DATA
except ImportError:  # pragma: no cover - older HA
    LOVELACE_DATA = "lovelace"

try:
    from homeassistant.components.lovelace.resources import ResourceStorageCollection
except ImportError:  # pragma: no cover - older HA
    ResourceStorageCollection = type("ResourceStorageCollection", (), {})  # type: ignore[misc,assignment]


def card_resource_url(version: str) -> str:
    """Return the versioned module URL for the bundled card."""
    return f"{URL_BASE}/{CARD_FILENAME}?v={version}"


def _lovelace_resources(hass: HomeAssistant) -> Any | None:
    """Return the Lovelace resources collection when available."""
    lovelace_data = hass.data.get(LOVELACE_DATA)
    if lovelace_data is None:
        lovelace_data = hass.data.get("lovelace")

    if lovelace_data is None:
        return None
    if isinstance(lovelace_data, dict):
        return lovelace_data.get("resources")
    return getattr(lovelace_data, "resources", None)


def _is_storage_collection(resources: Any) -> bool:
    """Return True when resources can be created or updated by the integration."""
    return isinstance(resources, ResourceStorageCollection)


def _find_resource(resources: Any, base_url: str) -> dict[str, Any] | None:
    """Return our Lovelace resource, ignoring the version query."""
    for item in resources.async_items():
        item_url = str(item.get("url", ""))
        if item_url.partition("?")[0] == base_url:
            return dict(item)
    return None


async def _async_register_lovelace_resource(hass: HomeAssistant, url: str) -> None:
    """Create or update the storage-mode Lovelace resource for the card bundle."""
    resources = _lovelace_resources(hass)
    if resources is None:
        LOGGER.debug("Lovelace resources not ready; skipping auto-register")
        return

    if not _is_storage_collection(resources):
        LOGGER.warning(
            "Lovelace is in YAML mode, so Chore Tracker cannot register its card "
            "automatically. Add this resource manually: {url: %s, type: module}",
            url,
        )
        return

    if not getattr(resources, "loaded", True):
        await resources.async_load()
        resources.loaded = True
    else:
        await resources.async_get_info()

    base_url = f"{URL_BASE}/{CARD_FILENAME}"
    existing = _find_resource(resources, base_url)
    if existing is None:
        await resources.async_create_item({"res_type": "module", "url": url})
        LOGGER.debug("Registered Lovelace card resource %s", url)
        return

    if existing.get("url") != url or existing.get("type") != "module":
        await resources.async_update_item(
            existing["id"], {"res_type": "module", "url": url}
        )
        LOGGER.debug("Updated Lovelace card resource to %s", url)


async def async_setup_frontend(hass: HomeAssistant) -> None:
    """Serve ``www/`` and register the Lovelace module once per Home Assistant."""
    if hass.data.get(FRONTEND_SETUP_KEY):
        return

    www_dir = Path(__file__).parent / "www"
    card_path = www_dir / CARD_FILENAME
    if not await hass.async_add_executor_job(card_path.is_file):
        LOGGER.error(
            "Bundled card %s is missing from %s; Lovelace cards will not load",
            CARD_FILENAME,
            www_dir,
        )
        return

    await hass.http.async_register_static_paths(
        [StaticPathConfig(URL_BASE, str(www_dir), cache_headers=False)]
    )

    integration = await async_get_integration(hass, DOMAIN)
    version = str(integration.version or "0")
    url = card_resource_url(version)
    await _async_register_lovelace_resource(hass, url)

    hass.data[FRONTEND_SETUP_KEY] = True
    LOGGER.debug("Serving Lovelace cards from %s at %s/", www_dir, URL_BASE)


async def async_unload_frontend(hass: HomeAssistant) -> None:
    """
    Clear the setup flag when the last config entry unloads.

    Static paths and Lovelace resources are left in place for the hass lifetime
    so other sessions keep a working module URL.
    """
    if hass.data.get(DOMAIN):
        return
    hass.data.pop(FRONTEND_SETUP_KEY, None)
