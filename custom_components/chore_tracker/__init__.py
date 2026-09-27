"""The Chore Tracker Home Assistant integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_TOKEN, CONF_URL, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import ChoreTrackerApiClient
from .const import DOMAIN
from .coordinator import ChoreTrackerCoordinator

type ChoreTrackerConfigEntry = ConfigEntry[ChoreTrackerCoordinator]

PLATFORMS: list[Platform] = [Platform.TODO, Platform.CALENDAR]


async def async_setup_entry(
    hass: HomeAssistant, entry: ChoreTrackerConfigEntry
) -> bool:
    """Set up Chore Tracker from a config entry."""
    client = ChoreTrackerApiClient(
        url=entry.data[CONF_URL],
        token=entry.data[CONF_TOKEN],
        session=async_get_clientsession(hass),
    )
    coordinator = ChoreTrackerCoordinator(
        hass,
        client=client,
        config_entry=entry,
    )
    await coordinator.async_config_entry_first_refresh()
    await coordinator.async_start_listener()

    entry.runtime_data = coordinator
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(
    hass: HomeAssistant, entry: ChoreTrackerConfigEntry
) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        coordinator = entry.runtime_data
        await coordinator.async_shutdown()
        hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return unload_ok
