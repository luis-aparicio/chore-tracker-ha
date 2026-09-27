"""Tests for the calendar platform."""

from __future__ import annotations

from datetime import UTC, datetime

from homeassistant.components.calendar import DOMAIN as CALENDAR_DOMAIN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_component import EntityComponent
from pytest_homeassistant_custom_component.common import MockConfigEntry


async def test_calendar_entity_exists(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """calendar.chores is created."""
    state = hass.states.get("calendar.chores")
    assert state is not None


async def test_calendar_events_in_range(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """async_get_events returns occurrence-backed events in range."""
    component: EntityComponent = hass.data[CALENDAR_DOMAIN]
    entity = component.get_entity("calendar.chores")
    assert entity is not None
    events = await entity.async_get_events(
        hass,
        datetime(2026, 9, 27, tzinfo=UTC),
        datetime(2026, 9, 30, tzinfo=UTC),
    )
    uids = {event.uid for event in events}
    assert "occ_alex_1" in uids
    assert "occ_open_1" in uids
    # completed still has a due date in range — calendar shows occurrences from snapshot
    assert "occ_done_1" in uids

    summaries = {event.uid: event.summary for event in events}
    assert summaries["occ_alex_1"] == "Take out trash"
    assert summaries["occ_open_1"] == "Water plants"
