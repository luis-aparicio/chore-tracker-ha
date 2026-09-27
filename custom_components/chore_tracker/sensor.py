"""Sensor platform for Chore Tracker member due counts."""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.sensor import (
    SensorEntity,
    SensorStateClass,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import slugify

from .entity import ChoreTrackerEntity
from .helpers import (
    assignee_id,
    is_actionable,
    is_due_today,
    is_overdue,
    occurrence_row,
    parse_due_at,
)

if TYPE_CHECKING:
    from . import ChoreTrackerConfigEntry
    from .coordinator import ChoreTrackerCoordinator

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ChoreTrackerConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up Chore Tracker member sensors."""
    coordinator = entry.runtime_data
    known: dict[str, list[ChoreTrackerMemberCountSensor]] = {}

    @callback
    def _sync_member_entities() -> None:
        members = (coordinator.data or {}).get("members") or []
        if not isinstance(members, list):
            return
        current_ids = {
            member_id
            for member in members
            if isinstance(member, dict)
            and isinstance((member_id := member.get("id")), str)
        }

        new_entities: list[ChoreTrackerMemberCountSensor] = []
        for member in members:
            if not isinstance(member, dict):
                continue
            member_id = member.get("id")
            if not isinstance(member_id, str) or member_id in known:
                continue
            due_today = ChoreTrackerMemberCountSensor(
                coordinator, entry, member_id, kind="due_today"
            )
            overdue = ChoreTrackerMemberCountSensor(
                coordinator, entry, member_id, kind="overdue"
            )
            known[member_id] = [due_today, overdue]
            new_entities.extend((due_today, overdue))
        if new_entities:
            async_add_entities(new_entities)

        registry = er.async_get(hass)
        for member_id in list(known):
            if member_id in current_ids:
                continue
            for entity in known.pop(member_id):
                entity_id = entity.entity_id
                if entity_id and registry.async_is_registered(entity_id):
                    registry.async_remove(entity_id)

    entry.async_on_unload(coordinator.async_add_listener(_sync_member_entities))
    _sync_member_entities()


class ChoreTrackerMemberCountSensor(ChoreTrackerEntity, SensorEntity):
    """Numeric count of due-today or overdue chores for one member."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement: str | None = None

    def __init__(
        self,
        coordinator: ChoreTrackerCoordinator,
        config_entry: ChoreTrackerConfigEntry,
        member_id: str,
        *,
        kind: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, config_entry)
        self._member_id = member_id
        self._kind = kind
        self._attr_unique_id = f"{config_entry.entry_id}_sensor_{member_id}_{kind}"
        display_name = self._member_display_name()
        if kind == "due_today":
            self._attr_name = f"{display_name} due today"
            self.entity_id = f"sensor.{slugify(display_name)}_due_today"
        else:
            self._attr_name = f"{display_name} overdue"
            self.entity_id = f"sensor.{slugify(display_name)}_overdue"

    def _member_display_name(self) -> str:
        for member in self._members:
            if member.get("id") == self._member_id:
                name = member.get("displayName")
                if isinstance(name, str) and name:
                    return name
        return "Member"

    def _household_timezone(self) -> str | None:
        timezone = self._household.get("timezone")
        return timezone if isinstance(timezone, str) else None

    def _count(self) -> int:
        timezone = self._household_timezone()
        total = 0
        for row in self._occurrences:
            if not is_actionable(row):
                continue
            if assignee_id(row) != self._member_id:
                continue
            occurrence = occurrence_row(row)
            if occurrence is None:
                continue
            due = parse_due_at(occurrence.get("dueAt"))
            if self._kind == "due_today":
                if is_due_today(due, timezone):
                    total += 1
            elif is_overdue(due, timezone):
                total += 1
        return total

    @property
    def native_value(self) -> int:
        """Return the count."""
        return self._count()

    @callback
    def _handle_coordinator_update(self) -> None:
        """Refresh name when member display name changes."""
        display_name = self._member_display_name()
        if self._kind == "due_today":
            self._attr_name = f"{display_name} due today"
        else:
            self._attr_name = f"{display_name} overdue"
        super()._handle_coordinator_update()
