# Changelog

All notable changes to this integration are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-10-01

### Added

- Kiosk card rebuilt to match the web app kiosk: member picker with avatars,
  every household chore due today plus decay chores with freshness bars, due
  labels, points, Claim, one-tap Done credited to the picked member, 30 second
  Undo, and an idle return to the picker (bundled cards)
- `chore_tracker/kiosk_list` WebSocket command backing the kiosk card
- `chore_tracker.undo` service (`POST /api/v1/occurrences/:id/undo`)

### Fixed

- Completing a chore from a card sometimes looked like it needed a second tap:
  the post-action refresh was debounced behind the server's own WebSocket push,
  so cards read stale data for up to 10 seconds. Actions now refresh
  immediately.
- Chores more than 7 days overdue (including the stalest decay chores) never
  reached Home Assistant because the snapshot sent a 7-day lower bound. The
  snapshot now only bounds the lookahead; the server already limits the list
  to open chores.

## [0.6.0] - 2026-10-01

### Changed

- Checking off an item on a member's `todo` list now credits that member
  (`completedForMemberId`) instead of the API token's owner. The household
  list keeps the token-owner default. Points and effort follow the credited
  member, and a check-off for a member who requires approval now lands in
  `pending_approval` until an admin approves it.

### Added

- Lovelace kiosk card shows each member's assigned chores plus "Up for grabs"
  chores they are eligible for, credited to the selected member; freshness
  card gains `read_only` for shared kiosk views (bundled cards)
- `member_id` state attribute on per-member `todo` entities so Lovelace cards
  (kiosk) can attribute completions to the selected member
- `chore_tracker/kiosk_items` WebSocket command: a member's assigned chores plus
  "up for grabs" chores they are eligible for, for the kiosk card. Todo entities
  and sensors are unchanged.
- Top-level `member_id` on `chore_tracker_completed` events: the member credited
  with the completion (`attributedMemberId`, then `completedForMemberId`, then
  `actorId` for older servers). `actor_id` is unchanged.

## [0.5.0] - 2026-09-27

First public HACS release of the Chore Tracker custom integration.

### Added

- Config flow with manual URL + API token, Supervisor discovery confirm, and
  reconfigure
- DataUpdateCoordinator with REST polling and WebSocket push
- Per-member and household `todo` entities, `calendar.chores`, due/overdue
  sensors, and household overdue binary sensor
- Services: `complete`, `skip`, `snooze`, `assign`, `create_starter_dashboard`
- Domain events: `chore_tracker_completed`, `chore_tracker_overdue`
- Bundled Lovelace cards (member list, freshness, kiosk, leaderboard shell,
  stub) with storage-mode auto-registration
- Optional starter dashboard generator
- Local brand assets under `custom_components/chore_tracker/brand/`
- HACS / hassfest validation workflows and tag-driven GitHub Releases
