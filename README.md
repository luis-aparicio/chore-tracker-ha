# Chore Tracker Home Assistant integration

Custom integration (`chore_tracker`) that connects Home Assistant to a
[Chore Tracker](https://github.com/luis-aparicio/chore-tracker) server.

## Install

**Primary path today:** HACS custom repository (default-store inclusion is
pending a human PR to [`hacs/default`](https://github.com/hacs/default); see
[`docs/hacs-default-submission.md`](docs/hacs-default-submission.md)).

1. HACS → Integrations → Custom repositories.
2. Add `https://github.com/luis-aparicio/chore-tracker-ha` as category **Integration**.
3. Download **Chore Tracker**, then restart Home Assistant Core if prompted.
4. Settings → Devices & services → Add integration → **Chore Tracker**.

Releases are published as GitHub Releases (`v*`, starting at **v0.5.0**). HACS
installs from those releases.

## Lovelace cards

The integration serves a bundled ESM module from
`/chore_tracker/chore-tracker-cards.js` and, in **storage-mode** Lovelace,
auto-registers it as a dashboard resource. You do not need to add the resource
by hand after installing or updating via HACS.

If your Lovelace dashboards use **YAML mode**, auto-registration is skipped —
add a module resource yourself:

```yaml
url: /chore_tracker/chore-tracker-cards.js
type: module
```

Card source lives in the monorepo (`packages/ha-cards`); releases copy the built
bundle into this repo’s `www/` folder. Card types:

| Type | Role |
|---|---|
| `chore-tracker-member-list-card` | Checklist from a `todo.*_chores` entity; tap to complete, long-press for skip / snooze / assign |
| `chore-tracker-freshness-card` | Tody-style freshness bars (group by room or chore); tap row to complete. Uses `chore_tracker/freshness` WebSocket data |
| `chore-tracker-kiosk-card` | Wall-tablet member chip switcher + large-button complete list (auto-discovers member todos; no PIN; from the cards release that reads `member_id`, completions are credited to the selected member) |
| `chore-tracker-leaderboard-card` | Period shell (week / month / all-time); rankings wait on household stats (#29) |
| `chore-tracker-stub-card` | Pipeline smoke card (optional on dashboards) |

Example configs:

```yaml
type: custom:chore-tracker-freshness-card
title: Freshness
group_by: room   # room | chore
horizon_days: 7
```

```yaml
type: custom:chore-tracker-kiosk-card
title: Kiosk
```

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
| `sensor.<member>_due_today` | Count of that member’s actionable chores due on the household-local calendar day (`state_class: measurement`). |
| `sensor.<member>_overdue` | Count of that member’s actionable overdue chores (`state_class: measurement`). |
| `binary_sensor.household_overdue` | On when any actionable occurrence (any assignee or open) is overdue. |

Points, streak, and weekly effort sensors are deferred until the server stats API (#29).

### To-do behaviour

- **Complete** an item in HA’s to-do UI (or via `todo.update_item`) →
  `POST /api/v1/occurrences/:id/complete`.
- **Create** an item → `POST /api/v1/chores` as a one-off chore:
  - Member list → fixed assignment to that member
  - Household list → open assignment
- **Delete** and **uncomplete** are not supported (raise an error).

Assist can use Home Assistant’s built-in to-do intents against these lists.

`requires_approval` chores still appear and can be completed when the config entry
uses an admin API token (as Supervisor discovery does).

### Calendar behaviour

- `calendar.chores` is read-only (no create / update / delete).
- Events use the occurrence due time (all-day when the server stores a date-only due).
- Queries outside the coordinator’s default due window fetch that range from the API.

## Services

| Service | API |
|---|---|
| `chore_tracker.complete` | `POST /api/v1/occurrences/:id/complete` |
| `chore_tracker.skip` | `POST /api/v1/occurrences/:id/skip` |
| `chore_tracker.snooze` | `POST /api/v1/occurrences/:id/snooze` (`snooze_until`) |
| `chore_tracker.assign` | `POST /api/v1/occurrences/:id/reassign` (`assignee_id`) |
| `chore_tracker.create_starter_dashboard` | Creates an optional storage-mode Lovelace dashboard (see below) |

Occurrence services require `occurrence_id`. Optional `config_entry_id` when more than one
entry is loaded. After a successful call the coordinator refreshes.

## Starter dashboard (optional)

The integration never auto-creates a Lovelace dashboard on setup. When you want a
ChoreOps-style layout:

1. Developer tools → Actions → `chore_tracker.create_starter_dashboard`, or
2. Settings → Devices & services → Chore Tracker → Configure → generate step.

That creates a **storage-mode** dashboard (sidebar path `chore-tracker`, or
`chore-tracker-<entry>` when multiple entries are loaded) with:

- **Managing** — freshness, leaderboard shell, household member-list, kiosk
- **Doing** — one view per household member with that member’s todo list card

If the path already exists, the service skips unless `force: true` (force overwrites
the layout and drops manual edits on that dashboard). YAML-mode dashboards at the
same path are left alone with a warning.

## Events

| Event | When |
|---|---|
| `chore_tracker_completed` | After a successful complete (API response) and/or when the WebSocket reports a `completed` domain event (deduped by event id) |
| `chore_tracker_overdue` | An actionable occurrence newly becomes overdue (edge-detect on coordinator data; not fired for items already overdue at startup) |

Payloads include occurrence / chore ids and related fields for automations.

## WebSocket commands

| Type | Role |
|---|---|
| `chore_tracker/freshness` | Returns `{ rows, config_entry_id }` for freshness cards. Each row: `occurrenceId`, `choreId`, `title`, `roomId`, `roomName`, `dueAt`, `lastCompletedAt`, optional `freshnessPct` (0–100 **fresh**, from the future #33 decay engine; cards invert to dirtiness for Tody bars). Optional `config_entry_id` when more than one entry is loaded. |

The coordinator snapshot also includes `rooms` alongside household, members, and occurrences.

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
