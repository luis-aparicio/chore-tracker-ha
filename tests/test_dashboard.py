"""Tests for the optional starter Lovelace dashboard generator."""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.chore_tracker.const import (
    DASHBOARD_URL_PATH,
    DOMAIN,
    SERVICE_CREATE_STARTER_DASHBOARD,
)
from custom_components.chore_tracker.dashboard import (
    RESULT_STATUS,
    RESULT_URL_PATH,
    RESULT_VIEW_PATHS,
    async_create_starter_dashboard,
    build_starter_dashboard_config,
    starter_dashboard_url_path,
)


class _FakeLovelaceStorage:
    """Minimal storage-mode dashboard stand-in."""

    def __init__(self, config: dict[str, Any] | None = None) -> None:
        self.config = config
        self.saved: list[dict[str, Any]] = []

    async def async_save(self, config: dict[str, Any]) -> None:
        self.saved.append(config)
        self.config = config


class _FakeYamlDashboard:
    """YAML-mode dashboard stand-in."""

    config: dict[str, Any] | None = None


class _FakeDashboardsCollection:
    """Minimal DashboardsCollection stand-in."""

    def __init__(self) -> None:
        self._items: list[dict[str, Any]] = []

    def async_items(self) -> list[dict[str, Any]]:
        return list(self._items)

    async def async_load(self) -> None:
        return None

    async def async_create_item(self, data: dict[str, Any]) -> dict[str, Any]:
        item = {"id": f"dash_{len(self._items) + 1}", **data}
        self._items.append(item)
        return item


class _FakeLovelaceData:
    """Minimal LovelaceData stand-in."""

    def __init__(self) -> None:
        self.dashboards: dict[str | None, Any] = {None: object()}


def _register_member_todos(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    """Register household + member todo entities for dashboard resolution."""
    registry = er.async_get(hass)
    registry.async_get_or_create(
        "todo",
        DOMAIN,
        f"{entry.entry_id}_todo_household",
        suggested_object_id="household_chores",
        config_entry=entry,
    )
    registry.async_get_or_create(
        "todo",
        DOMAIN,
        f"{entry.entry_id}_todo_mem_alex",
        suggested_object_id="alex_chores",
        config_entry=entry,
    )
    registry.async_get_or_create(
        "todo",
        DOMAIN,
        f"{entry.entry_id}_todo_mem_sam",
        suggested_object_id="sam_chores",
        config_entry=entry,
    )


async def test_build_config_managing_and_member_views(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Builder emits Managing + per-member Doing views with our cards."""
    entry = setup_integration
    _register_member_todos(hass, entry)
    coordinator = entry.runtime_data

    config, view_paths = build_starter_dashboard_config(
        hass, coordinator, entry_id=entry.entry_id
    )

    assert view_paths[0] == "managing"
    assert "alex" in view_paths
    assert "sam" in view_paths
    assert config["title"] == "Test Household"
    managing = config["views"][0]
    assert managing["path"] == "managing"
    assert managing["type"] == "sections"
    cards = managing["sections"][0]["cards"]
    types = [card["type"] for card in cards if card["type"] != "heading"]
    assert types == [
        "custom:chore-tracker-freshness-card",
        "custom:chore-tracker-leaderboard-card",
        "custom:chore-tracker-member-list-card",
        "custom:chore-tracker-kiosk-card",
    ]
    member_list = next(
        c for c in cards if c.get("type") == "custom:chore-tracker-member-list-card"
    )
    assert member_list["entity"] == "todo.household_chores"
    freshness = next(
        c for c in cards if c.get("type") == "custom:chore-tracker-freshness-card"
    )
    assert freshness["config_entry_id"] == entry.entry_id
    assert freshness["group_by"] == "room"

    alex_view = next(v for v in config["views"] if v["path"] == "alex")
    alex_cards = alex_view["sections"][0]["cards"]
    member_type = "custom:chore-tracker-member-list-card"
    alex_list = next(c for c in alex_cards if c.get("type") == member_type)
    assert alex_list["entity"] == "todo.alex_chores"


async def test_url_path_scopes_when_multiple_entries(hass: HomeAssistant) -> None:
    """Multi-entry installs get an entry-scoped url_path."""
    hass.data[DOMAIN] = {"aaaa1111bbbb": object(), "cccc2222dddd": object()}
    assert starter_dashboard_url_path(hass, "aaaa1111bbbb") == (
        f"{DASHBOARD_URL_PATH}-aaaa1111"
    )
    hass.data[DOMAIN] = {"only": object()}
    assert starter_dashboard_url_path(hass, "only") == DASHBOARD_URL_PATH


async def test_create_skips_without_force(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Existing storage dashboard is left alone unless force=true."""
    entry = setup_integration
    _register_member_todos(hass, entry)
    lovelace = _FakeLovelaceData()
    existing = _FakeLovelaceStorage({"views": []})
    lovelace.dashboards[DASHBOARD_URL_PATH] = existing

    with patch(
        "custom_components.chore_tracker.dashboard._lovelace_data",
        return_value=lovelace,
    ):
        result = await async_create_starter_dashboard(
            hass,
            entry.runtime_data,
            entry_id=entry.entry_id,
            force=False,
        )

    assert result[RESULT_STATUS] == "skipped"
    assert result[RESULT_URL_PATH] == DASHBOARD_URL_PATH
    assert existing.saved == []


async def test_create_force_overwrites(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """force=true saves a new config onto an existing storage dashboard."""
    entry = setup_integration
    _register_member_todos(hass, entry)
    lovelace = _FakeLovelaceData()
    existing = _FakeLovelaceStorage({"views": []})
    lovelace.dashboards[DASHBOARD_URL_PATH] = existing

    with (
        patch(
            "custom_components.chore_tracker.dashboard._lovelace_data",
            return_value=lovelace,
        ),
        patch(
            "custom_components.chore_tracker.dashboard.LovelaceYAML",
            _FakeYamlDashboard,
        ),
    ):
        result = await async_create_starter_dashboard(
            hass,
            entry.runtime_data,
            entry_id=entry.entry_id,
            force=True,
        )

    assert result[RESULT_STATUS] == "updated"
    assert len(existing.saved) == 1
    assert existing.saved[0]["views"][0]["path"] == "managing"
    assert "managing" in result[RESULT_VIEW_PATHS]


async def test_create_new_dashboard(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Missing url_path creates a storage dashboard and saves config."""
    entry = setup_integration
    _register_member_todos(hass, entry)
    lovelace = _FakeLovelaceData()
    collection = _FakeDashboardsCollection()

    created_storage: list[_FakeLovelaceStorage] = []

    def _storage(_hass: HomeAssistant, item: dict[str, Any]) -> _FakeLovelaceStorage:
        storage = _FakeLovelaceStorage()
        created_storage.append(storage)
        lovelace.dashboards[item["url_path"]] = storage
        return storage

    with (
        patch(
            "custom_components.chore_tracker.dashboard._lovelace_data",
            return_value=lovelace,
        ),
        patch(
            "custom_components.chore_tracker.dashboard._get_core_dashboards_collection",
            return_value=collection,
        ),
        patch(
            "custom_components.chore_tracker.dashboard.LovelaceStorage",
            side_effect=_storage,
        ),
        patch(
            "custom_components.chore_tracker.dashboard.LovelaceYAML",
            _FakeYamlDashboard,
        ),
        patch(
            "custom_components.chore_tracker.dashboard.frontend.async_panel_exists",
            return_value=True,
        ),
    ):
        result = await async_create_starter_dashboard(
            hass,
            entry.runtime_data,
            entry_id=entry.entry_id,
            force=False,
        )

    assert result[RESULT_STATUS] == "created"
    assert result[RESULT_URL_PATH] == DASHBOARD_URL_PATH
    assert collection.async_items()[0]["url_path"] == DASHBOARD_URL_PATH
    assert created_storage
    assert created_storage[0].saved
    assert created_storage[0].saved[0]["views"][0]["path"] == "managing"


async def test_yaml_mode_dashboard_skipped(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """YAML-mode dashboard at the target path is skipped with a warning."""
    entry = setup_integration
    lovelace = _FakeLovelaceData()
    lovelace.dashboards[DASHBOARD_URL_PATH] = _FakeYamlDashboard()

    with (
        patch(
            "custom_components.chore_tracker.dashboard._lovelace_data",
            return_value=lovelace,
        ),
        patch(
            "custom_components.chore_tracker.dashboard.LovelaceYAML",
            _FakeYamlDashboard,
        ),
    ):
        result = await async_create_starter_dashboard(
            hass,
            entry.runtime_data,
            entry_id=entry.entry_id,
            force=True,
        )

    assert result[RESULT_STATUS] == "skipped"
    assert "YAML-mode" in result["message"]


async def test_service_create_starter_dashboard(
    hass: HomeAssistant,
    setup_integration: MockConfigEntry,
) -> None:
    """Domain service returns the helper response and raises on failure."""
    with patch(
        "custom_components.chore_tracker.services.async_create_starter_dashboard",
        new_callable=AsyncMock,
        return_value={
            RESULT_URL_PATH: DASHBOARD_URL_PATH,
            RESULT_STATUS: "created",
            RESULT_VIEW_PATHS: ["managing", "alex"],
            "message": "ok",
        },
    ) as mock_create:
        response = await hass.services.async_call(
            DOMAIN,
            SERVICE_CREATE_STARTER_DASHBOARD,
            {"force": False},
            blocking=True,
            return_response=True,
        )

    mock_create.assert_awaited_once()
    assert response[RESULT_STATUS] == "created"
    assert response[RESULT_URL_PATH] == DASHBOARD_URL_PATH

    with (
        patch(
            "custom_components.chore_tracker.services.async_create_starter_dashboard",
            new_callable=AsyncMock,
            return_value={
                RESULT_URL_PATH: DASHBOARD_URL_PATH,
                RESULT_STATUS: "failed",
                RESULT_VIEW_PATHS: [],
                "message": "boom",
            },
        ),
        pytest.raises(HomeAssistantError, match="boom"),
    ):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_CREATE_STARTER_DASHBOARD,
            {},
            blocking=True,
            return_response=True,
        )
