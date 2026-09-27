"""Domain services for Chore Tracker occurrence actions."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .api import ChoreTrackerApiError, ChoreTrackerConnectionError
from .const import (
    ATTR_ASSIGNEE_ID,
    ATTR_COMPLETED_FOR_MEMBER_ID,
    ATTR_CONFIG_ENTRY_ID,
    ATTR_OCCURRENCE_ID,
    ATTR_SNOOZE_UNTIL,
    DOMAIN,
    SERVICE_ASSIGN,
    SERVICE_COMPLETE,
    SERVICE_SKIP,
    SERVICE_SNOOZE,
)
from .coordinator import ChoreTrackerCoordinator

SERVICE_COMPLETE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_OCCURRENCE_ID): cv.string,
        vol.Optional(ATTR_COMPLETED_FOR_MEMBER_ID): cv.string,
        vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string,
    }
)

SERVICE_SKIP_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_OCCURRENCE_ID): cv.string,
        vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string,
    }
)

SERVICE_SNOOZE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_OCCURRENCE_ID): cv.string,
        vol.Required(ATTR_SNOOZE_UNTIL): cv.string,
        vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string,
    }
)

SERVICE_ASSIGN_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_OCCURRENCE_ID): cv.string,
        vol.Required(ATTR_ASSIGNEE_ID): cv.string,
        vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string,
    }
)


def _get_coordinator(hass: HomeAssistant, call: ServiceCall) -> ChoreTrackerCoordinator:
    """Resolve the coordinator for a service call."""
    entries: dict[str, ChoreTrackerCoordinator] = hass.data.get(DOMAIN, {})
    if not entries:
        msg = "Chore Tracker is not configured"
        raise ServiceValidationError(msg)

    entry_id = call.data.get(ATTR_CONFIG_ENTRY_ID)
    if entry_id is not None:
        coordinator = entries.get(entry_id)
        if coordinator is None:
            msg = f"Unknown config entry id: {entry_id}"
            raise ServiceValidationError(msg)
        return coordinator

    if len(entries) == 1:
        return next(iter(entries.values()))

    msg = (
        "Multiple Chore Tracker entries are configured; "
        "pass config_entry_id to select one"
    )
    raise ServiceValidationError(msg)


async def _handle_complete(call: ServiceCall) -> None:
    """Complete an occurrence."""
    coordinator = _get_coordinator(call.hass, call)
    occurrence_id: str = call.data[ATTR_OCCURRENCE_ID]
    body: dict[str, Any] = {}
    completed_for = call.data.get(ATTR_COMPLETED_FOR_MEMBER_ID)
    if completed_for is not None:
        body["completedForMemberId"] = completed_for
    try:
        result = await coordinator.client.async_complete_occurrence(
            occurrence_id, body=body or None
        )
    except (ChoreTrackerApiError, ChoreTrackerConnectionError) as err:
        raise HomeAssistantError(str(err)) from err
    if isinstance(result, dict):
        coordinator.fire_completed_from_action(result)
    await coordinator.async_request_refresh()


async def _handle_skip(call: ServiceCall) -> None:
    """Skip an occurrence."""
    coordinator = _get_coordinator(call.hass, call)
    occurrence_id: str = call.data[ATTR_OCCURRENCE_ID]
    try:
        await coordinator.client.async_skip_occurrence(occurrence_id)
    except (ChoreTrackerApiError, ChoreTrackerConnectionError) as err:
        raise HomeAssistantError(str(err)) from err
    await coordinator.async_request_refresh()


async def _handle_snooze(call: ServiceCall) -> None:
    """Snooze an occurrence until a new due time."""
    coordinator = _get_coordinator(call.hass, call)
    occurrence_id: str = call.data[ATTR_OCCURRENCE_ID]
    snooze_until: str = call.data[ATTR_SNOOZE_UNTIL]
    try:
        await coordinator.client.async_snooze_occurrence(
            occurrence_id, snooze_until=snooze_until
        )
    except (ChoreTrackerApiError, ChoreTrackerConnectionError) as err:
        raise HomeAssistantError(str(err)) from err
    await coordinator.async_request_refresh()


async def _handle_assign(call: ServiceCall) -> None:
    """Reassign an occurrence to a member."""
    coordinator = _get_coordinator(call.hass, call)
    occurrence_id: str = call.data[ATTR_OCCURRENCE_ID]
    assignee_id: str = call.data[ATTR_ASSIGNEE_ID]
    try:
        await coordinator.client.async_reassign_occurrence(
            occurrence_id, assignee_id=assignee_id
        )
    except (ChoreTrackerApiError, ChoreTrackerConnectionError) as err:
        raise HomeAssistantError(str(err)) from err
    await coordinator.async_request_refresh()


@callback
def async_setup_services(hass: HomeAssistant) -> None:
    """Register domain services once."""
    if hass.services.has_service(DOMAIN, SERVICE_COMPLETE):
        return

    hass.services.async_register(
        DOMAIN,
        SERVICE_COMPLETE,
        _handle_complete,
        schema=SERVICE_COMPLETE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SKIP,
        _handle_skip,
        schema=SERVICE_SKIP_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SNOOZE,
        _handle_snooze,
        schema=SERVICE_SNOOZE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_ASSIGN,
        _handle_assign,
        schema=SERVICE_ASSIGN_SCHEMA,
    )


@callback
def async_unload_services(hass: HomeAssistant) -> None:
    """Remove domain services when the last entry unloads."""
    if hass.data.get(DOMAIN):
        return
    for service_name in (
        SERVICE_COMPLETE,
        SERVICE_SKIP,
        SERVICE_SNOOZE,
        SERVICE_ASSIGN,
    ):
        if hass.services.has_service(DOMAIN, service_name):
            hass.services.async_remove(DOMAIN, service_name)
