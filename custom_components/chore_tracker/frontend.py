"""Serve bundled Lovelace cards and auto-register the resource (storage mode)."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

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


def card_resource_url(digest: str) -> str:
    """Return the content-hash versioned module URL for the bundled card."""
    return f"{URL_BASE}/{CARD_FILENAME}?v={digest}"


def _card_digest(path: Path) -> str:
    """Return a short content hash for cache-busting the card URL."""
    return hashlib.sha256(path.read_bytes()).hexdigest()[:8]


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


async def _async_register_lovelace_resource(hass: HomeAssistant, url: str) -> bool:
    """
    Create or update the storage-mode Lovelace resource for the card bundle.

    Returns True when a storage-mode resource is present at ``url``.
    """
    resources = _lovelace_resources(hass)
    if resources is None:
        LOGGER.debug("Lovelace resources not ready; skipping auto-register")
        return False

    if not _is_storage_collection(resources):
        LOGGER.warning(
            "Lovelace is in YAML mode, so Chore Tracker cannot register its card "
            "automatically. Add this resource manually: {url: %s, type: module}",
            url,
        )
        return False

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
        return True

    if existing.get("url") != url or existing.get("type") != "module":
        await resources.async_update_item(
            existing["id"], {"res_type": "module", "url": url}
        )
        LOGGER.debug("Updated Lovelace card resource to %s", url)
    return True


async def async_setup_frontend(hass: HomeAssistant) -> None:
    """Serve ``www/`` once and keep the Lovelace module resource current."""
    www_dir = Path(__file__).parent / "www"
    card_path = www_dir / CARD_FILENAME
    if not await hass.async_add_executor_job(card_path.is_file):
        LOGGER.error(
            "Bundled card %s is missing from %s; Lovelace cards will not load",
            CARD_FILENAME,
            www_dir,
        )
        return

    if not hass.data.get(FRONTEND_SETUP_KEY):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(www_dir), cache_headers=False)]
        )
        # Static paths cannot be unregistered; keep this flag for the hass lifetime.
        hass.data[FRONTEND_SETUP_KEY] = True
        LOGGER.debug("Serving Lovelace cards from %s at %s/", www_dir, URL_BASE)

    digest = await hass.async_add_executor_job(_card_digest, card_path)
    url = card_resource_url(digest)
    await _async_register_lovelace_resource(hass, url)


async def async_unload_frontend(hass: HomeAssistant) -> None:
    """
    Leave static paths and Lovelace resources in place for the hass lifetime.

    Home Assistant cannot unregister HTTP static paths, so clearing the setup
    flag would risk duplicate registration on the next config-entry setup.
    """
    if hass.data.get(DOMAIN):
        return
    # Intentionally keep FRONTEND_SETUP_KEY set.
