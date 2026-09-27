# Chore Tracker Home Assistant integration

Custom integration (`chore_tracker`) that connects Home Assistant to a
[Chore Tracker](https://github.com/luis-aparicio/chore-tracker) server.

This scaffold (#21) ships config flow, API client, WebSocket-backed coordinator,
and diagnostics. Entity platforms (todo / sensor / calendar) come later.

## Install (HACS custom repository)

1. HACS → Integrations → Custom repositories.
2. Add `https://github.com/luis-aparicio/chore-tracker-ha` as category **Integration**.
3. Download **Chore Tracker**, then restart Home Assistant Core if prompted.
4. Settings → Devices & services → Add integration → **Chore Tracker**.

## Manual setup

1. In Chore Tracker, mint an API token (Settings → API tokens). It looks like `ct_…`.
2. In the config flow, enter:
   - **Server URL** — on Home Assistant OS with the Chore Tracker app, use the
     internal hostname and port, e.g. `http://816670ef-chore-tracker:8080`
     (not the Supervisor ingress path).
   - **API token** — the `ct_…` secret.
3. The integration validates with `GET /api/v1/household` and stores `{ url, token }`.

An invalid token fails the flow with an auth error and does not create an entry.

## Supervisor discovery

When the Chore Tracker **app** is running under Supervisor, it posts a discovery
payload (`service: chore_tracker`, config keys `host`, `port`, `token`). Home
Assistant can open a confirm-only flow (`hassio` → `hassio_confirm`). If an entry
for that household already exists, URL/token are updated and the entry reloads.

Live discovery only re-fires when the app announces again; manual URL + token
always works.

## Development

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements_common.txt -r requirements_test.txt -r requirements_lint.txt
pytest
ruff check custom_components tests
```

## Related

- Server / app monorepo: https://github.com/luis-aparicio/chore-tracker
- HA app packaging: https://github.com/luis-aparicio/chore-tracker-ha-apps
- Docs: https://github.com/luis-aparicio/chore-tracker/blob/main/docs/ha-app.md
