"""Config flow for Chore Tracker (manual + hassio discovery)."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import CONF_TOKEN, CONF_URL
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.service_info.hassio import HassioServiceInfo

from .api import (
    ChoreTrackerApiClient,
    ChoreTrackerApiError,
    ChoreTrackerAuthError,
    ChoreTrackerConnectionError,
    normalize_url,
)
from .const import ATTR_FORCE, DEFAULT_NAME, DOMAIN, LOGGER
from .dashboard import (
    RESULT_MESSAGE,
    RESULT_STATUS,
    RESULT_URL_PATH,
    async_create_starter_dashboard,
)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_URL): str,
        vol.Required(CONF_TOKEN): str,
    }
)

STEP_OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_FORCE, default=False): bool,
    }
)


class ChoreTrackerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Chore Tracker."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize flow state for hassio discovery."""
        self._discovered_url: str | None = None
        self._discovered_token: str | None = None
        self._household_name: str | None = None

    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle a manual configuration flow."""
        errors: dict[str, str] = {}

        if user_input is not None:
            try:
                url = normalize_url(user_input[CONF_URL])
                token = user_input[CONF_TOKEN].strip()
                household = await self._async_validate(url, token)
            except ChoreTrackerAuthError:
                errors["base"] = "invalid_auth"
            except ChoreTrackerConnectionError:
                errors["base"] = "cannot_connect"
            except (ChoreTrackerApiError, ValueError):
                errors["base"] = "unknown"
            else:
                await self.async_set_unique_id(household["id"])
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=household.get("name") or DEFAULT_NAME,
                    data={CONF_URL: url, CONF_TOKEN: token},
                )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
        )

    async def async_step_hassio(
        self,
        discovery_info: HassioServiceInfo,
    ) -> ConfigFlowResult:
        """Handle Supervisor discovery from the Chore Tracker app (#18)."""
        config = discovery_info.config
        try:
            host = config["host"]
            port = config["port"]
            token = str(config["token"]).strip()
            url = normalize_url(f"http://{host}:{port}")
        except (KeyError, TypeError, ValueError, ChoreTrackerConnectionError):
            return self.async_abort(reason="invalid_discovery_info")

        try:
            household = await self._async_validate(url, token)
        except ChoreTrackerAuthError:
            return self.async_abort(reason="invalid_auth")
        except ChoreTrackerConnectionError:
            return self.async_abort(reason="cannot_connect")
        except ChoreTrackerApiError:
            LOGGER.exception("Unexpected error during hassio discovery")
            return self.async_abort(reason="unknown")

        await self.async_set_unique_id(household["id"])
        self._abort_if_unique_id_configured(
            updates={CONF_URL: url, CONF_TOKEN: token},
            reload_on_update=True,
        )

        self._discovered_url = url
        self._discovered_token = token
        self._household_name = household.get("name") or DEFAULT_NAME
        return await self.async_step_hassio_confirm()

    async def async_step_hassio_confirm(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Confirm Supervisor discovery before creating the entry."""
        if user_input is not None:
            if self._discovered_url is None or self._discovered_token is None:
                return self.async_abort(reason="invalid_discovery_info")
            return self.async_create_entry(
                title=self._household_name or DEFAULT_NAME,
                data={
                    CONF_URL: self._discovered_url,
                    CONF_TOKEN: self._discovered_token,
                },
            )

        self._set_confirm_only()
        return self.async_show_form(
            step_id="hassio_confirm",
            description_placeholders={
                "url": self._discovered_url or "",
                "name": self._household_name or DEFAULT_NAME,
            },
        )

    async def _async_validate(self, url: str, token: str) -> dict[str, Any]:
        """Validate credentials via GET /api/v1/household."""
        client = ChoreTrackerApiClient(
            url=url,
            token=token,
            session=async_get_clientsession(self.hass),
        )
        household = await client.async_get_household()
        if not isinstance(household, dict) or "id" not in household:
            msg = "Invalid household response"
            raise ChoreTrackerApiError(msg)
        return household

    @staticmethod
    @callback
    def async_get_options_flow(_config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow for generating a starter dashboard."""
        return ChoreTrackerOptionsFlow()


class ChoreTrackerOptionsFlow(OptionsFlow):
    """Optional starter dashboard generator (never runs on initial setup)."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Offer to generate the starter Lovelace dashboard."""
        if user_input is not None:
            coordinator = self.hass.data.get(DOMAIN, {}).get(self.config_entry.entry_id)
            if coordinator is None:
                return self.async_abort(reason="not_loaded")

            force = bool(user_input.get(ATTR_FORCE, False))
            result = await async_create_starter_dashboard(
                self.hass,
                coordinator,
                entry_id=self.config_entry.entry_id,
                force=force,
            )
            status = result.get(RESULT_STATUS)
            placeholders = {
                "url_path": str(result.get(RESULT_URL_PATH) or ""),
                "message": str(result.get(RESULT_MESSAGE) or ""),
            }
            if status == "created":
                return self.async_abort(
                    reason="dashboard_created",
                    description_placeholders=placeholders,
                )
            if status == "updated":
                return self.async_abort(
                    reason="dashboard_updated",
                    description_placeholders=placeholders,
                )
            if status == "skipped":
                return self.async_abort(
                    reason="dashboard_skipped",
                    description_placeholders=placeholders,
                )
            return self.async_abort(
                reason="dashboard_failed",
                description_placeholders=placeholders,
            )

        return self.async_show_form(
            step_id="init",
            data_schema=STEP_OPTIONS_SCHEMA,
        )
