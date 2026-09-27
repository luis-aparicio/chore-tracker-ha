"""Tests for the todo platform."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from homeassistant.components.todo import DOMAIN as TODO_DOMAIN
from homeassistant.components.todo import TodoServices
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.chore_tracker.todo import (
    ChoreTrackerHouseholdTodoEntity,
    ChoreTrackerMemberTodoEntity,
)


async def test_todo_entities_created(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Household and per-member todo lists are created."""
    assert hass.states.get("todo.household_chores") is not None
    assert hass.states.get("todo.alex_chores") is not None
    assert hass.states.get("todo.sam_chores") is not None


async def test_todo_member_filter_and_household_all(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Member lists filter by assignee; household includes all actionable."""
    alex = await hass.services.async_call(
        TODO_DOMAIN,
        TodoServices.GET_ITEMS,
        {ATTR_ENTITY_ID: "todo.alex_chores"},
        blocking=True,
        return_response=True,
    )
    household = await hass.services.async_call(
        TODO_DOMAIN,
        TodoServices.GET_ITEMS,
        {ATTR_ENTITY_ID: "todo.household_chores"},
        blocking=True,
        return_response=True,
    )

    alex_items = alex["todo.alex_chores"]["items"]
    household_items = household["todo.household_chores"]["items"]

    assert {item["uid"] for item in alex_items} == {"occ_alex_1"}
    assert {item["uid"] for item in household_items} == {"occ_alex_1", "occ_open_1"}
    assert all(item["status"] == "needs_action" for item in household_items)


async def test_todo_complete_calls_api(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
    mock_api: MagicMock,
) -> None:
    """Completing a todo item posts to the occurrences complete endpoint."""
    # setup patches ChoreTrackerApiClient on the package; coordinator uses that instance
    coordinator = setup_integration.runtime_data
    client = coordinator.client

    await hass.services.async_call(
        TODO_DOMAIN,
        TodoServices.UPDATE_ITEM,
        {
            ATTR_ENTITY_ID: "todo.alex_chores",
            "item": "occ_alex_1",
            "status": "completed",
        },
        blocking=True,
    )
    client.async_complete_occurrence.assert_awaited_with("occ_alex_1")


async def test_todo_create_builds_one_off_payload(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Creating a todo item POSTs a one-off chore with the right assignment."""
    coordinator = setup_integration.runtime_data
    client = coordinator.client

    await hass.services.async_call(
        TODO_DOMAIN,
        TodoServices.ADD_ITEM,
        {
            ATTR_ENTITY_ID: "todo.alex_chores",
            "item": "Vacuum living room",
            "due_date": "2026-10-01",
        },
        blocking=True,
    )
    client.async_create_chore.assert_awaited()
    payload = client.async_create_chore.await_args.args[0]
    assert payload["title"] == "Vacuum living room"
    assert payload["schedule"] == {"type": "one_off", "dueAt": "2026-10-01"}
    assert payload["assignment"] == {
        "strategy": "fixed",
        "fixedMemberId": "mem_alex",
        "pool": ["mem_alex"],
    }

    await hass.services.async_call(
        TODO_DOMAIN,
        TodoServices.ADD_ITEM,
        {
            ATTR_ENTITY_ID: "todo.household_chores",
            "item": "Wipe counters",
        },
        blocking=True,
    )
    household_payload = client.async_create_chore.await_args.args[0]
    assert household_payload["assignment"] == {"strategy": "open", "pool": []}
    assert household_payload["schedule"]["type"] == "one_off"


async def test_todo_uncomplete_rejected(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Uncomplete raises HomeAssistantError."""
    entity = hass.data["todo"].get_entity("todo.alex_chores")
    assert isinstance(
        entity, (ChoreTrackerMemberTodoEntity, ChoreTrackerHouseholdTodoEntity)
    )
    from homeassistant.components.todo import TodoItem, TodoItemStatus

    with pytest.raises(HomeAssistantError):
        await entity.async_update_todo_item(
            TodoItem(uid="occ_alex_1", status=TodoItemStatus.NEEDS_ACTION)
        )
