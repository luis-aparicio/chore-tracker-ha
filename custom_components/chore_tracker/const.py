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

ACTIONABLE_STATES: Final = frozenset({"pending", "snoozed"})

# Domain services
SERVICE_COMPLETE: Final = "complete"
SERVICE_SKIP: Final = "skip"
SERVICE_SNOOZE: Final = "snooze"
SERVICE_ASSIGN: Final = "assign"

ATTR_OCCURRENCE_ID: Final = "occurrence_id"
ATTR_SNOOZE_UNTIL: Final = "snooze_until"
ATTR_ASSIGNEE_ID: Final = "assignee_id"
ATTR_COMPLETED_FOR_MEMBER_ID: Final = "completed_for_member_id"
ATTR_CONFIG_ENTRY_ID: Final = "config_entry_id"

# Home Assistant bus events
EVENT_COMPLETED: Final = "chore_tracker_completed"
EVENT_OVERDUE: Final = "chore_tracker_overdue"

# Domain event type from the Chore Tracker WebSocket stream
DOMAIN_EVENT_COMPLETED: Final = "completed"

# Bundled Lovelace cards (served from www/)
CARD_FILENAME: Final = "chore-tracker-cards.js"
URL_BASE: Final = f"/{DOMAIN}"
FRONTEND_SETUP_KEY: Final = f"{DOMAIN}_frontend_setup"
FRONTEND_RESOURCE_RETRY_KEY: Final = f"{DOMAIN}_frontend_resource_retry"
