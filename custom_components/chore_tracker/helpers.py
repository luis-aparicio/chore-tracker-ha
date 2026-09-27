"""Shared helpers for parsing Chore Tracker API values."""

from __future__ import annotations

from datetime import date, datetime, time
from typing import Any
from zoneinfo import ZoneInfo

from homeassistant.util import dt as dt_util

from .const import ACTIONABLE_STATES

_DATE_ONLY_LEN = 10


def _ensure_aware(value: datetime) -> datetime:
    """Attach UTC when the datetime is naive."""
    if value.tzinfo is None:
        return value.replace(tzinfo=dt_util.UTC)
    return value


def parse_due_at(value: Any) -> date | datetime | None:
    """Parse an API dueAt into a date or timezone-aware datetime."""
    if isinstance(value, datetime):
        return _ensure_aware(value)
    if isinstance(value, date):
        return value
    if not isinstance(value, str):
        return None

    text = value.strip()
    if len(text) == _DATE_ONLY_LEN and text[4] == "-" and text[7] == "-":
        with_context = date.fromisoformat
    else:
        with_context = datetime.fromisoformat

    try:
        parsed = with_context(text)
    except ValueError:
        return None

    if isinstance(parsed, datetime):
        return _ensure_aware(parsed)
    return parsed


def household_zone(timezone_name: str | None) -> ZoneInfo:
    """Return a ZoneInfo for the household, falling back to UTC."""
    if isinstance(timezone_name, str) and timezone_name:
        try:
            return ZoneInfo(timezone_name)
        except Exception:  # noqa: BLE001,S110 — bad tz from server
            pass
    return ZoneInfo("UTC")


def local_today(timezone_name: str | None, *, now: datetime | None = None) -> date:
    """Return today's calendar date in the household timezone."""
    zone = household_zone(timezone_name)
    clock = now if now is not None else dt_util.utcnow()
    if clock.tzinfo is None:
        clock = clock.replace(tzinfo=dt_util.UTC)
    return clock.astimezone(zone).date()


def due_local_date(
    due: date | datetime,
    timezone_name: str | None,
) -> date:
    """Calendar date of a due value in the household timezone."""
    if isinstance(due, datetime):
        zone = household_zone(timezone_name)
        return due.astimezone(zone).date()
    return due


def is_due_today(
    due: date | datetime | None,
    timezone_name: str | None,
    *,
    now: datetime | None = None,
) -> bool:
    """Return whether due falls on the household-local calendar day."""
    if due is None:
        return False
    return due_local_date(due, timezone_name) == local_today(timezone_name, now=now)


def is_overdue(
    due: date | datetime | None,
    timezone_name: str | None,
    *,
    now: datetime | None = None,
) -> bool:
    """Return whether due is before now (date-only: after that local day ends)."""
    if due is None:
        return False
    clock = now if now is not None else dt_util.utcnow()
    if clock.tzinfo is None:
        clock = clock.replace(tzinfo=dt_util.UTC)

    if isinstance(due, datetime):
        return due < clock

    # All-day: overdue once the household-local calendar day is over.
    zone = household_zone(timezone_name)
    end_of_due_day = datetime.combine(due, time.max, tzinfo=zone)
    return clock > end_of_due_day


def occurrence_row(item: dict[str, Any]) -> dict[str, Any] | None:
    """Return the nested occurrence dict from a list item."""
    occurrence = item.get("occurrence")
    return occurrence if isinstance(occurrence, dict) else None


def chore_title(item: dict[str, Any]) -> str:
    """Return the chore title from a list item."""
    chore = item.get("chore")
    if isinstance(chore, dict):
        title = chore.get("title")
        if isinstance(title, str) and title:
            return title
    return "Chore"


def is_actionable(item: dict[str, Any]) -> bool:
    """Return whether the occurrence is pending or snoozed."""
    occurrence = occurrence_row(item)
    if occurrence is None:
        return False
    return occurrence.get("state") in ACTIONABLE_STATES


def assignee_id(item: dict[str, Any]) -> str | None:
    """Return the occurrence assignee id, if any."""
    occurrence = occurrence_row(item)
    if occurrence is None:
        return None
    value = occurrence.get("assigneeId")
    return value if isinstance(value, str) else None
