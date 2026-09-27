"""Binary sensor platform for household overdue state."""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .entity import ChoreTrackerEntity
from .helpers import is_actionable, is_overdue, occurrence_row, parse_due_at

if TYPE_CHECKING:
    from . import ChoreTrackerConfigEntry
    from .coordinator import ChoreTrackerCoordinator

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,  # noqa: ARG001 — required by platform signature
    entry: ChoreTrackerConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the household overdue binary sensor."""
    coordinator = entry.runtime_data
    async_add_entities([ChoreTrackerHouseholdOverdueBinarySensor(coordinator, entry)])


class ChoreTrackerHouseholdOverdueBinarySensor(ChoreTrackerEntity, BinarySensorEntity):
    """On when any actionable household occurrence is overdue."""

    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_name = "Household overdue"

    def __init__(
        self,
        coordinator: ChoreTrackerCoordinator,
        config_entry: ChoreTrackerConfigEntry,
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator, config_entry)
        self._attr_unique_id = f"{config_entry.entry_id}_binary_household_overdue"
        self.entity_id = "binary_sensor.household_overdue"

    @property
    def is_on(self) -> bool:
        """Return True when any actionable occurrence is overdue."""
        timezone = self._household.get("timezone")
        tz_name = timezone if isinstance(timezone, str) else None
        for row in self._occurrences:
            if not is_actionable(row):
                continue
            occurrence = occurrence_row(row)
            if occurrence is None:
                continue
            due = parse_due_at(occurrence.get("dueAt"))
            if is_overdue(due, tz_name):
                return True
        return False
