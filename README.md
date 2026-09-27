# Chore Tracker Home Assistant integration

Custom integration (`chore_tracker`) that connects Home Assistant to a
[Chore Tracker](https://github.com/luis-aparicio/chore-tracker) server.

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

## Entities

After setup, the integration creates one household device and these entities:

| Entity | Role |
|---|---|
| `todo.<member>_chores` | One list per household member. Items are that member’s actionable occurrences (`pending` / `snoozed`). |
| `todo.household_chores` | All actionable occurrences for the household (assigned and open). |
| `calendar.chores` | Read-only calendar of upcoming occurrences (`uid` = occurrence id). |

### To-do behaviour

- **Complete** an item in HA’s to-do UI (or via `todo.update_item`) →
  `POST /api/v1/occurrences/:id/complete`.
- **Create** an item → `POST /api/v1/chores` as a one-off chore:
  - Member list → fixed assignment to that member
  - Household list → open assignment
- **Delete** and **uncomplete** are not supported (raise an error). Skip / snooze /
  undo stay on the Chore Tracker UI or later HA services.

Assist can use Home Assistant’s built-in to-do intents against these lists.

`requires_approval` chores still appear and can be completed when the config entry
uses an admin API token (as Supervisor discovery does).

### Calendar behaviour

- `calendar.chores` is read-only (no create / update / delete).
- Events use the occurrence due time (all-day when the server stores a date-only due).
- Queries outside the coordinator’s default due window fetch that range from the API.

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
