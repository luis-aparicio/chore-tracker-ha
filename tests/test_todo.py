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

from custom_components.chore_tracker.api import ChoreTrackerApiError
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
    client.async_complete_occurrence.assert_awaited_with(
        "occ_alex_1", body={"completedForMemberId": "mem_alex"}
    )


async def test_todo_household_complete_has_no_member_body(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Household list completions keep the token-owner attribution."""
    client = setup_integration.runtime_data.client

    await hass.services.async_call(
        TODO_DOMAIN,
        TodoServices.UPDATE_ITEM,
        {
            ATTR_ENTITY_ID: "todo.household_chores",
            "item": "occ_open_1",
            "status": "completed",
        },
        blocking=True,
    )
    client.async_complete_occurrence.assert_awaited_with("occ_open_1", body=None)


async def test_todo_member_entity_exposes_member_id(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Member lists carry member_id; the household list does not."""
    assert hass.states.get("todo.alex_chores").attributes["member_id"] == "mem_alex"
    assert hass.states.get("todo.sam_chores").attributes["member_id"] == "mem_sam"
    assert "member_id" not in hass.states.get("todo.household_chores").attributes


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


async def test_todo_member_added_and_removed(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """New members get a todo list; removed members drop from the registry."""
    from homeassistant.helpers import entity_registry as er

    coordinator = setup_integration.runtime_data
    data = dict(coordinator.data)
    members = list(data["members"])
    members.append(
        {
            "id": "mem_pat",
            "householdId": "hh_test_1",
            "displayName": "Pat",
            "role": "member",
            "colour": "#778899",
            "avatar": None,
            "haUserId": None,
            "username": None,
            "createdAt": "2026-01-01T00:00:00.000Z",
            "invitePending": False,
            "inviteExpiresAt": None,
        }
    )
    data["members"] = members
    coordinator.async_set_updated_data(data)
    await hass.async_block_till_done()
    assert hass.states.get("todo.pat_chores") is not None

    data = dict(coordinator.data)
    data["members"] = [m for m in members if m["id"] != "mem_pat"]
    coordinator.async_set_updated_data(data)
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    assert registry.async_get("todo.pat_chores") is None


async def test_todo_member_complete_api_error_raises(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """A rejected member check-off surfaces as a HomeAssistantError."""
    client = setup_integration.runtime_data.client
    client.async_complete_occurrence.side_effect = ChoreTrackerApiError("forbidden")

    with pytest.raises(HomeAssistantError, match="forbidden"):
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
