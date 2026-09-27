"""DataUpdateCoordinator for Chore Tracker."""

from __future__ import annotations

from datetime import timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import (
    ChoreTrackerApiError,
    ChoreTrackerAuthError,
    ChoreTrackerConnectionError,
)
from .const import DEFAULT_POLL_INTERVAL_SECONDS, DOMAIN, LOGGER

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

    from .api import ChoreTrackerApiClient


class ChoreTrackerCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Fetch household snapshot; push updates via WebSocket when connected."""

    def __init__(
        self,
        hass: HomeAssistant,
        *,
        client: ChoreTrackerApiClient,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            LOGGER,
            config_entry=config_entry,
            name=DOMAIN,
            update_interval=timedelta(seconds=DEFAULT_POLL_INTERVAL_SECONDS),
        )
        self.client = client

    async def async_start_listener(self) -> None:
        """Start the WebSocket listener after the first successful refresh."""
        self.client.start_ws_listener(
            on_message=self._async_on_ws_message,
            on_ready_truncated=self._async_on_ready_truncated,
        )

    async def async_shutdown(self) -> None:
        """Stop the WebSocket listener and the coordinator."""
        await self.client.async_stop_ws_listener()
        await super().async_shutdown()

    async def _async_update_data(self) -> dict[str, Any]:
        """Poll REST for a snapshot (also used as WS reconnect fallback)."""
        try:
            snapshot = await self.client.async_get_snapshot()
        except ChoreTrackerAuthError as err:
            raise ConfigEntryAuthFailed(err) from err
        except (ChoreTrackerConnectionError, ChoreTrackerApiError) as err:
            raise UpdateFailed(err) from err

        return self._enrich(snapshot)

    def _enrich(self, snapshot: dict[str, Any]) -> dict[str, Any]:
        """Attach connection diagnostics to coordinator data."""
        return {
            **snapshot,
            "ws_connected": self.client.ws_connected,
            "last_event_id": self.client.last_event_id,
            "last_error": self.client.last_error,
        }

    async def _async_on_ws_message(self, _payload: dict[str, Any]) -> None:
        """Handle a domain event by requesting a full REST refresh."""
        await self.async_request_refresh()

    async def _async_on_ready_truncated(self) -> None:
        """Force a full REST refresh when the server reports truncated replay."""
        await self.async_request_refresh()
