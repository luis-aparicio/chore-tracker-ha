"""
Optional starter Lovelace dashboard (Managing + per-member Doing views).

Uses the same internal storage-mode path as the frontend
``lovelace/dashboards/create`` WebSocket command. Never runs on config-entry
setup — call ``chore_tracker.create_starter_dashboard`` or the options flow.
"""

from __future__ import annotations

from typing import Any, Literal

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import slugify

from .const import (
    DASHBOARD_ICON,
    DASHBOARD_URL_PATH,
    DOMAIN,
    LOGGER,
)
from .coordinator import ChoreTrackerCoordinator

try:
    from homeassistant.components import frontend
    from homeassistant.components.lovelace import _register_panel
    from homeassistant.components.lovelace.const import LOVELACE_DATA, MODE_STORAGE
    from homeassistant.components.lovelace.dashboard import (
        DashboardsCollection,
        LovelaceStorage,
        LovelaceYAML,
    )
except ImportError:  # pragma: no cover - older HA
    frontend = None  # type: ignore[assignment]
    _register_panel = None  # type: ignore[assignment]
    LOVELACE_DATA = "lovelace"
    MODE_STORAGE = "storage"
    DashboardsCollection = type("DashboardsCollection", (), {})  # type: ignore[misc,assignment]
    LovelaceStorage = type("LovelaceStorage", (), {})  # type: ignore[misc,assignment]
    LovelaceYAML = type("LovelaceYAML", (), {})  # type: ignore[misc,assignment]

DashboardStatus = Literal["created", "updated", "skipped", "failed"]

RESULT_URL_PATH = "url_path"
RESULT_STATUS = "status"
RESULT_VIEW_PATHS = "view_paths"
RESULT_MESSAGE = "message"


def starter_dashboard_url_path(hass: HomeAssistant, entry_id: str) -> str:
    """Return the sidebar url_path for this config entry."""
    entries = hass.data.get(DOMAIN) or {}
    if len(entries) <= 1:
        return DASHBOARD_URL_PATH
    return f"{DASHBOARD_URL_PATH}-{entry_id[:8]}"


def _heading(heading: str, *, icon: str | None = None) -> dict[str, Any]:
    card: dict[str, Any] = {
        "type": "heading",
        "heading": heading,
        "heading_style": "title",
    }
    if icon:
        card["icon"] = icon
    return card


def _grid(*cards: dict[str, Any]) -> dict[str, Any]:
    return {"type": "grid", "cards": list(cards)}


def _member_todo_entity_id(
    hass: HomeAssistant,
    entry_id: str,
    member_id: str,
) -> str | None:
    """Resolve a member todo entity_id from the entity registry."""
    registry = er.async_get(hass)
    return registry.async_get_entity_id("todo", DOMAIN, f"{entry_id}_todo_{member_id}")


def _household_todo_entity_id(hass: HomeAssistant, entry_id: str) -> str:
    """Resolve the household todo entity_id, with a stable fallback."""
    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id(
        "todo", DOMAIN, f"{entry_id}_todo_household"
    )
    return entity_id or "todo.household_chores"


def _result(
    *,
    url_path: str,
    view_paths: list[str],
    status: DashboardStatus,
    message: str,
) -> dict[str, Any]:
    return {
        RESULT_URL_PATH: url_path,
        RESULT_VIEW_PATHS: view_paths,
        RESULT_STATUS: status,
        RESULT_MESSAGE: message,
    }


def build_starter_dashboard_config(
    hass: HomeAssistant,
    coordinator: ChoreTrackerCoordinator,
    *,
    entry_id: str,
) -> tuple[dict[str, Any], list[str]]:
    """Build a sections-mode Lovelace config and the list of view paths."""
    data = coordinator.data or {}
    household = data.get("household") if isinstance(data.get("household"), dict) else {}
    members = data.get("members") if isinstance(data.get("members"), list) else []
    title = household.get("name") if isinstance(household.get("name"), str) else None
    dashboard_title = title or "Chores"

    household_todo = _household_todo_entity_id(hass, entry_id)
    view_paths: list[str] = ["managing"]
    views: list[dict[str, Any]] = [
        {
            "title": "Managing",
            "path": "managing",
            "icon": "mdi:clipboard-check-outline",
            "type": "sections",
            "max_columns": 2,
            "sections": [
                _grid(
                    _heading("Household", icon="mdi:home-outline"),
                    {
                        "type": "custom:chore-tracker-freshness-card",
                        "title": "Freshness",
                        "group_by": "room",
                        "config_entry_id": entry_id,
                    },
                    {
                        "type": "custom:chore-tracker-leaderboard-card",
                        "title": "Leaderboard",
                        "period": "week",
                    },
                    {
                        "type": "custom:chore-tracker-member-list-card",
                        "title": "Household chores",
                        "entity": household_todo,
                    },
                    {
                        "type": "custom:chore-tracker-kiosk-card",
                        "title": "Kiosk",
                        "config_entry_id": entry_id,
                    },
                )
            ],
        }
    ]

    for member in members:
        if not isinstance(member, dict):
            continue
        member_id = member.get("id")
        display_name = member.get("displayName")
        if not isinstance(member_id, str) or not member_id:
            continue
        if not isinstance(display_name, str) or not display_name.strip():
            continue

        entity_id = _member_todo_entity_id(hass, entry_id, member_id)
        if entity_id is None:
            LOGGER.warning(
                "Skipping Doing view for member %s (%s): todo entity not ready",
                display_name,
                member_id,
            )
            continue

        path = slugify(display_name)
        if not path or path == "managing":
            path = slugify(f"member-{member_id}") or member_id.lower()
        view_paths.append(path)
        views.append(
            {
                "title": display_name,
                "path": path,
                "icon": "mdi:account-check-outline",
                "type": "sections",
                "max_columns": 1,
                "sections": [
                    _grid(
                        _heading(display_name, icon="mdi:checkbox-marked-outline"),
                        {
                            "type": "custom:chore-tracker-member-list-card",
                            "title": f"{display_name} chores",
                            "entity": entity_id,
                        },
                    )
                ],
            }
        )

    return {"title": dashboard_title, "views": views}, view_paths


def _get_core_dashboards_collection(hass: HomeAssistant) -> Any | None:
    """Return core's live DashboardsCollection via the WS create handler."""
    try:
        handler, _schema = hass.data["websocket_api"]["lovelace/dashboards/create"]
        # require_admin -> async_response wrappers around the bound method
        ws = handler.__wrapped__.__wrapped__.__self__
        coll = ws.storage_collection
    except (KeyError, AttributeError):
        return None
    return coll if isinstance(coll, DashboardsCollection) else None


def _lovelace_data(hass: HomeAssistant) -> Any | None:
    """Return LovelaceData when the lovelace component is set up."""
    return hass.data.get(LOVELACE_DATA) or hass.data.get("lovelace")


def _dashboard_title(coordinator: ChoreTrackerCoordinator) -> str:
    household = (coordinator.data or {}).get("household") or {}
    if isinstance(household, dict) and isinstance(household.get("name"), str):
        return household["name"]
    return "Chores"


async def _async_ensure_dashboard_panel(
    hass: HomeAssistant,
    lovelace: Any,
    *,
    url_path: str,
    title: str,
) -> None:
    """Create the storage dashboard registry entry and panel when missing."""
    coll = _get_core_dashboards_collection(hass)
    if coll is None:
        msg = (
            "Starter dashboard unavailable: core Lovelace dashboards collection "
            "is not reachable (is Lovelace set up?)"
        )
        raise RuntimeError(msg)

    item = next(
        (i for i in coll.async_items() if i.get("url_path") == url_path),
        None,
    )
    if item is None:
        item = await coll.async_create_item(
            {
                "url_path": url_path,
                "title": title,
                "icon": DASHBOARD_ICON,
                "show_in_sidebar": True,
                "require_admin": False,
            }
        )

    if url_path in lovelace.dashboards:
        return

    # Core's CHANGE_ADDED listener normally registers LovelaceStorage + panel.
    # If the item already existed in the collection but not in lovelace.dashboards
    # (rare), register the storage handle so async_save can proceed.
    lovelace.dashboards[url_path] = LovelaceStorage(hass, item)
    if (
        frontend is not None
        and _register_panel is not None
        and not frontend.async_panel_exists(hass, url_path)
    ):
        _register_panel(
            hass,
            url_path,
            MODE_STORAGE,
            item,
            False,  # noqa: FBT003 — HA core positional API
        )


def _preflight_result(
    hass: HomeAssistant,
    *,
    url_path: str,
    view_paths: list[str],
    force: bool,
) -> tuple[Any | None, dict[str, Any] | None]:
    """
    Validate Lovelace readiness.

    Returns ``(lovelace, None)`` on success, or ``(None, result)`` when the
    caller should return early.
    """
    if frontend is None or _register_panel is None:
        msg = "Starter dashboard unavailable: Lovelace APIs missing"
        LOGGER.warning(msg)
        return None, _result(
            url_path=url_path, view_paths=view_paths, status="failed", message=msg
        )

    if hass.config.recovery_mode:
        msg = "Starter dashboard skipped: Home Assistant is in recovery mode"
        LOGGER.warning(msg)
        return None, _result(
            url_path=url_path, view_paths=view_paths, status="skipped", message=msg
        )

    lovelace = _lovelace_data(hass)
    if lovelace is None or not hasattr(lovelace, "dashboards"):
        msg = "Starter dashboard skipped: Lovelace is not set up"
        LOGGER.warning(msg)
        return None, _result(
            url_path=url_path, view_paths=view_paths, status="failed", message=msg
        )

    existing = lovelace.dashboards.get(url_path)
    if existing is not None and isinstance(existing, LovelaceYAML):
        msg = (
            f"Starter dashboard skipped: /{url_path} is a YAML-mode dashboard. "
            "Remove it or choose another url_path before generating."
        )
        LOGGER.warning(msg)
        return None, _result(
            url_path=url_path, view_paths=view_paths, status="skipped", message=msg
        )

    if existing is not None and not force:
        msg = (
            f"Starter dashboard already exists at /{url_path}; "
            "pass force=true to overwrite"
        )
        LOGGER.info(msg)
        return None, _result(
            url_path=url_path, view_paths=view_paths, status="skipped", message=msg
        )

    return lovelace, None


async def async_create_starter_dashboard(
    hass: HomeAssistant,
    coordinator: ChoreTrackerCoordinator,
    *,
    entry_id: str,
    force: bool = False,
) -> dict[str, Any]:
    """
    Create or refresh the starter storage-mode dashboard.

    Returns a response dict with ``url_path``, ``status``, ``view_paths``, and
    ``message``. Never raises for Lovelace internals — failures become
    ``status=failed`` (callers may still raise HomeAssistantError for UX).
    """
    url_path = starter_dashboard_url_path(hass, entry_id)
    config, view_paths = build_starter_dashboard_config(
        hass, coordinator, entry_id=entry_id
    )

    lovelace, early = _preflight_result(
        hass, url_path=url_path, view_paths=view_paths, force=force
    )
    if early is not None or lovelace is None:
        return early or _result(
            url_path=url_path,
            view_paths=view_paths,
            status="failed",
            message="Starter dashboard skipped: Lovelace is not set up",
        )

    existed = url_path in lovelace.dashboards
    try:
        if not existed:
            await _async_ensure_dashboard_panel(
                hass,
                lovelace,
                url_path=url_path,
                title=_dashboard_title(coordinator),
            )

        dashboard = lovelace.dashboards[url_path]
        async_save = getattr(dashboard, "async_save", None)
        if not callable(async_save):
            msg = f"Starter dashboard at /{url_path} is not storage-mode"
            LOGGER.warning(msg)
            return _result(
                url_path=url_path, view_paths=view_paths, status="failed", message=msg
            )

        await async_save(config)
    except Exception as err:  # noqa: BLE001 — internal Lovelace APIs
        LOGGER.exception("Starter dashboard create/save failed")
        return _result(
            url_path=url_path,
            view_paths=view_paths,
            status="failed",
            message=f"Starter dashboard failed: {err}",
        )

    status: DashboardStatus = "updated" if existed else "created"
    msg = f"Starter dashboard {status} at /{url_path}"
    LOGGER.info(msg)
    return _result(url_path=url_path, view_paths=view_paths, status=status, message=msg)
