"""Constants for the Chore Tracker integration."""

from __future__ import annotations

from logging import Logger, getLogger
from typing import Final

LOGGER: Logger = getLogger(__package__)

DOMAIN: Final = "chore_tracker"

CONF_URL: Final = "url"
CONF_TOKEN: Final = "token"

DEFAULT_NAME: Final = "Chore Tracker"
DEFAULT_POLL_INTERVAL_SECONDS: Final = 60

# Narrow due window for the coordinator REST snapshot (days).
OCCURRENCE_LOOKBACK_DAYS: Final = 7
OCCURRENCE_LOOKAHEAD_DAYS: Final = 14
