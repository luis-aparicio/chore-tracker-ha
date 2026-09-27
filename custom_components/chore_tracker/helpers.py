"""Shared helpers for parsing Chore Tracker API values."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

from homeassistant.util import dt as dt_util

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
