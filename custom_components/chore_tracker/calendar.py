"""Calendar platform for Chore Tracker occurrences."""

from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .api import ChoreTrackerApiError, ChoreTrackerConnectionError
from .const import OCCURRENCE_LOOKAHEAD_DAYS, OCCURRENCE_LOOKBACK_DAYS
from .coordinator import ChoreTrackerCoordinator
from .entity import ChoreTrackerEntity
from .helpers import parse_due_at

if TYPE_CHECKING:
    from . import ChoreTrackerConfigEntry

PARALLEL_UPDATES = 0

DEFAULT_EVENT_DURATION = timedelta(hours=1)


def _row_to_event(item: dict[str, Any]) -> CalendarEvent | None:
    """Convert an enriched occurrence row to a calendar event."""
    occurrence = item.get("occurrence")
    if not isinstance(occurrence, dict):
        return None
    uid = occurrence.get("id")
    if not isinstance(uid, str) or not uid:
        return None
    due = parse_due_at(occurrence.get("dueAt"))
    if due is None:
        return None

    chore = item.get("chore")
    title = "Chore"
    if isinstance(chore, dict):
        chore_title = chore.get("title")
        if isinstance(chore_title, str) and chore_title:
            title = chore_title

    if isinstance(due, datetime):
        start: date | datetime = due
        end: date | datetime = due + DEFAULT_EVENT_DURATION
    else:
        start = due
        end = due

    return CalendarEvent(
        uid=uid,
        summary=title,
        start=start,
        end=end,
    )


def _event_in_range(
    event: CalendarEvent,
    start_date: datetime,
    end_date: datetime,
) -> bool:
    """Return True if the event overlaps [start_date, end_date)."""
    event_start = event.start
    event_end = event.end
    if isinstance(event_start, date) and not isinstance(event_start, datetime):
        start_cmp = datetime.combine(
            event_start, datetime.min.time(), tzinfo=dt_util.UTC
        )
    else:
        start_cmp = event_start
        if start_cmp.tzinfo is None:
            start_cmp = start_cmp.replace(tzinfo=dt_util.UTC)
    if isinstance(event_end, date) and not isinstance(event_end, datetime):
        end_cmp = datetime.combine(
            event_end + timedelta(days=1),
            datetime.min.time(),
            tzinfo=dt_util.UTC,
        )
    else:
        end_cmp = event_end
        if end_cmp.tzinfo is None:
            end_cmp = end_cmp.replace(tzinfo=dt_util.UTC)

    start_date = dt_util.as_utc(start_date)
    end_date = dt_util.as_utc(end_date)
    start_cmp = dt_util.as_utc(start_cmp)
    end_cmp = dt_util.as_utc(end_cmp)
    return start_cmp < end_date and end_cmp > start_date


def _snapshot_covers_range(start_date: datetime, end_date: datetime) -> bool:
    """Whether the coordinator snapshot window fully covers the query range."""
    now = dt_util.utcnow()
    window_start = now - timedelta(days=OCCURRENCE_LOOKBACK_DAYS)
    window_end = now + timedelta(days=OCCURRENCE_LOOKAHEAD_DAYS)
    start_date = dt_util.as_utc(start_date)
    end_date = dt_util.as_utc(end_date)
    return start_date >= window_start and end_date <= window_end


async def async_setup_entry(
    hass: HomeAssistant,  # noqa: ARG001 — required by platform signature
    entry: ChoreTrackerConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the Chore Tracker calendar."""
    async_add_entities([ChoreTrackerCalendarEntity(entry.runtime_data, entry)])


class ChoreTrackerCalendarEntity(ChoreTrackerEntity, CalendarEntity):
    """Read-only calendar of chore occurrences."""

    def __init__(
        self,
        coordinator: ChoreTrackerCoordinator,
        config_entry: ChoreTrackerConfigEntry,
    ) -> None:
        """Initialize the calendar entity."""
        super().__init__(coordinator, config_entry)
        self._attr_name = "Chores"
        self._attr_unique_id = f"{config_entry.entry_id}_calendar_chores"
        self.entity_id = "calendar.chores"

    @property
    def event(self) -> CalendarEvent | None:
        """Return the next upcoming occurrence event."""
        now = dt_util.now()
        upcoming: list[CalendarEvent] = []
        for row in self._occurrences:
            event = _row_to_event(row)
            if event is None:
                continue
            start = event.start
            if isinstance(start, datetime):
                start_local = dt_util.as_local(start)
            else:
                start_local = datetime.combine(
                    start, datetime.min.time(), tzinfo=dt_util.DEFAULT_TIME_ZONE
                )
            if start_local >= now or (
                isinstance(event.end, datetime) and dt_util.as_local(event.end) > now
            ):
                upcoming.append(event)
        if not upcoming:
            return None

        def sort_key(event: CalendarEvent) -> datetime:
            start = event.start
            if isinstance(start, datetime):
                return dt_util.as_utc(start)
            return datetime.combine(start, datetime.min.time(), tzinfo=dt_util.UTC)

        upcoming.sort(key=sort_key)
        return upcoming[0]

    async def async_get_events(
        self,
        hass: HomeAssistant,  # noqa: ARG002 — required by CalendarEntity
        start_date: datetime,
        end_date: datetime,
    ) -> list[CalendarEvent]:
        """Return calendar events in the requested range."""
        if _snapshot_covers_range(start_date, end_date):
            rows = self._occurrences
        else:
            try:
                rows = await self.coordinator.client.async_get_occurrences(
                    from_iso=dt_util.as_utc(start_date).isoformat(),
                    to_iso=dt_util.as_utc(end_date).isoformat(),
                )
            except ChoreTrackerApiError, ChoreTrackerConnectionError:
                rows = self._occurrences

        events: list[CalendarEvent] = []
        for row in rows:
            event = _row_to_event(row)
            if event is None:
                continue
            if _event_in_range(event, start_date, end_date):
                events.append(event)
        return events
