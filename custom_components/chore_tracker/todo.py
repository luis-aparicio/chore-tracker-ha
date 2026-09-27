"""Todo list platform for Chore Tracker occurrences."""

from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING, Any
from zoneinfo import ZoneInfo

from homeassistant.components.todo import (
    TodoItem,
    TodoItemStatus,
    TodoListEntity,
    TodoListEntityFeature,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util
from homeassistant.util import slugify

from .api import ChoreTrackerApiError, ChoreTrackerConnectionError
from .entity import ChoreTrackerEntity
from .helpers import parse_due_at

if TYPE_CHECKING:
    from . import ChoreTrackerConfigEntry
    from .coordinator import ChoreTrackerCoordinator

PARALLEL_UPDATES = 0

ACTIONABLE_STATES = frozenset({"pending", "snoozed"})

_UNSUPPORTED_MSG = (
    "Chore Tracker todo lists only support completing items and creating "
    "one-off chores. Delete and uncomplete are not supported."
)


def _occurrence_row(item: dict[str, Any]) -> dict[str, Any] | None:
    occurrence = item.get("occurrence")
    return occurrence if isinstance(occurrence, dict) else None


def _chore_title(item: dict[str, Any]) -> str:
    chore = item.get("chore")
    if isinstance(chore, dict):
        title = chore.get("title")
        if isinstance(title, str) and title:
            return title
    return "Chore"


def _is_actionable(item: dict[str, Any]) -> bool:
    occurrence = _occurrence_row(item)
    if occurrence is None:
        return False
    return occurrence.get("state") in ACTIONABLE_STATES


def _to_todo_item(item: dict[str, Any]) -> TodoItem | None:
    occurrence = _occurrence_row(item)
    if occurrence is None:
        return None
    uid = occurrence.get("id")
    if not isinstance(uid, str) or not uid:
        return None
    return TodoItem(
        uid=uid,
        summary=_chore_title(item),
        status=TodoItemStatus.NEEDS_ACTION,
        due=parse_due_at(occurrence.get("dueAt")),
    )


def _due_at_for_create(
    item: TodoItem,
    *,
    household_timezone: str,
) -> str:
    """Build schedule.dueAt for a one-off chore create."""
    due = item.due
    if isinstance(due, datetime):
        if due.tzinfo is None:
            due = due.replace(tzinfo=dt_util.DEFAULT_TIME_ZONE)
        return due.isoformat()
    if isinstance(due, date):
        return due.isoformat()
    try:
        tz = ZoneInfo(household_timezone)
    except Exception:  # noqa: BLE001 — fall back to UTC on bad tz
        tz = ZoneInfo("UTC")
    return datetime.now(tz=tz).date().isoformat()


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ChoreTrackerConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up Chore Tracker todo lists."""
    coordinator = entry.runtime_data
    known_members: dict[str, ChoreTrackerMemberTodoEntity] = {}

    async_add_entities([ChoreTrackerHouseholdTodoEntity(coordinator, entry)])

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

        new_entities: list[ChoreTrackerMemberTodoEntity] = []
        for member in members:
            if not isinstance(member, dict):
                continue
            member_id = member.get("id")
            if not isinstance(member_id, str) or member_id in known_members:
                continue
            entity = ChoreTrackerMemberTodoEntity(coordinator, entry, member_id)
            known_members[member_id] = entity
            new_entities.append(entity)
        if new_entities:
            async_add_entities(new_entities)

        registry = er.async_get(hass)
        for member_id in list(known_members):
            if member_id in current_ids:
                continue
            entity = known_members.pop(member_id)
            entity_id = entity.entity_id
            if entity_id and registry.async_is_registered(entity_id):
                registry.async_remove(entity_id)

    entry.async_on_unload(coordinator.async_add_listener(_sync_member_entities))
    _sync_member_entities()


class ChoreTrackerTodoEntity(ChoreTrackerEntity, TodoListEntity):
    """Shared todo list behavior for household and member lists."""

    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.SET_DUE_DATE_ON_ITEM
        | TodoListEntityFeature.SET_DUE_DATETIME_ON_ITEM
    )

    def _filtered_items(self) -> list[dict[str, Any]]:
        """Return actionable occurrence rows for this list."""
        raise NotImplementedError

    def _assignment_for_create(self) -> dict[str, Any]:
        """Return assignment payload for a new one-off chore."""
        raise NotImplementedError

    @property
    def todo_items(self) -> list[TodoItem] | None:
        """Return the current to-do items."""
        items: list[TodoItem] = []
        for row in self._filtered_items():
            todo = _to_todo_item(row)
            if todo is not None:
                items.append(todo)
        return items

    async def async_create_todo_item(self, item: TodoItem) -> None:
        """Create a one-off chore from a new to-do item."""
        summary = (item.summary or "").strip()
        if not summary:
            msg = "Chore title is required"
            raise HomeAssistantError(msg)

        household = self._household
        timezone = household.get("timezone")
        if not isinstance(timezone, str) or not timezone:
            timezone = "UTC"

        payload = {
            "title": summary,
            "schedule": {
                "type": "one_off",
                "dueAt": _due_at_for_create(item, household_timezone=timezone),
            },
            "assignment": self._assignment_for_create(),
        }
        try:
            await self.coordinator.client.async_create_chore(payload)
        except (ChoreTrackerApiError, ChoreTrackerConnectionError) as err:
            raise HomeAssistantError(str(err)) from err
        await self.coordinator.async_request_refresh()

    async def async_update_todo_item(self, item: TodoItem) -> None:
        """Complete an occurrence; reject uncomplete and other edits."""
        if item.status == TodoItemStatus.NEEDS_ACTION:
            raise HomeAssistantError(_UNSUPPORTED_MSG)
        if item.status != TodoItemStatus.COMPLETED:
            raise HomeAssistantError(_UNSUPPORTED_MSG)
        uid = item.uid
        if not isinstance(uid, str) or not uid:
            msg = "Missing occurrence id"
            raise HomeAssistantError(msg)
        try:
            await self.coordinator.client.async_complete_occurrence(uid)
        except (ChoreTrackerApiError, ChoreTrackerConnectionError) as err:
            raise HomeAssistantError(str(err)) from err
        await self.coordinator.async_request_refresh()

    async def async_delete_todo_items(self, uids: list[str]) -> None:  # noqa: ARG002
        """Reject delete — not mapped to skip/undo."""
        raise HomeAssistantError(_UNSUPPORTED_MSG)


class ChoreTrackerHouseholdTodoEntity(ChoreTrackerTodoEntity):
    """Household to-do list with all actionable occurrences."""

    def __init__(
        self,
        coordinator: ChoreTrackerCoordinator,
        config_entry: ChoreTrackerConfigEntry,
    ) -> None:
        """Initialize the household list."""
        super().__init__(coordinator, config_entry)
        self._attr_name = "Household chores"
        self._attr_unique_id = f"{config_entry.entry_id}_todo_household"
        self.entity_id = "todo.household_chores"

    def _filtered_items(self) -> list[dict[str, Any]]:
        return [row for row in self._occurrences if _is_actionable(row)]

    def _assignment_for_create(self) -> dict[str, Any]:
        return {"strategy": "open", "pool": []}


class ChoreTrackerMemberTodoEntity(ChoreTrackerTodoEntity):
    """Per-member to-do list filtered by assignee."""

    def __init__(
        self,
        coordinator: ChoreTrackerCoordinator,
        config_entry: ChoreTrackerConfigEntry,
        member_id: str,
    ) -> None:
        """Initialize a member list."""
        super().__init__(coordinator, config_entry)
        self._member_id = member_id
        self._attr_unique_id = f"{config_entry.entry_id}_todo_{member_id}"
        display_name = self._member_display_name()
        self._attr_name = f"{display_name} chores"
        self.entity_id = f"todo.{slugify(display_name)}_chores"

    def _member_display_name(self) -> str:
        for member in self._members:
            if member.get("id") == self._member_id:
                name = member.get("displayName")
                if isinstance(name, str) and name:
                    return name
        return "Member"

    def _filtered_items(self) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        for row in self._occurrences:
            if not _is_actionable(row):
                continue
            occurrence = _occurrence_row(row)
            if occurrence is None:
                continue
            if occurrence.get("assigneeId") == self._member_id:
                rows.append(row)
        return rows

    def _assignment_for_create(self) -> dict[str, Any]:
        return {
            "strategy": "fixed",
            "fixedMemberId": self._member_id,
            "pool": [self._member_id],
        }

    @callback
    def _handle_coordinator_update(self) -> None:
        """Refresh name/entity_id suggestion when member display name changes."""
        display_name = self._member_display_name()
        self._attr_name = f"{display_name} chores"
        super()._handle_coordinator_update()
