"""Shared entity helpers for Chore Tracker."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import ChoreTrackerCoordinator

if TYPE_CHECKING:
    from . import ChoreTrackerConfigEntry


class ChoreTrackerEntity(CoordinatorEntity[ChoreTrackerCoordinator]):
    """Base entity attached to the household device."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: ChoreTrackerCoordinator,
        config_entry: ChoreTrackerConfigEntry,
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, config_entry.entry_id)},
            name=self._household_name,
            manufacturer="Chore Tracker",
            model="Household",
            configuration_url=coordinator.client.url,
        )

    @property
    def _household_name(self) -> str:
        """Return the household display name from coordinator data."""
        household = (self.coordinator.data or {}).get("household") or {}
        name = household.get("name")
        if isinstance(name, str) and name:
            return name
        return self._config_entry.title or "Chore Tracker"

    @property
    def _household(self) -> dict[str, Any]:
        return (self.coordinator.data or {}).get("household") or {}

    @property
    def _members(self) -> list[dict[str, Any]]:
        members = (self.coordinator.data or {}).get("members") or []
        return members if isinstance(members, list) else []

    @property
    def _occurrences(self) -> list[dict[str, Any]]:
        occurrences = (self.coordinator.data or {}).get("occurrences") or []
        return occurrences if isinstance(occurrences, list) else []
