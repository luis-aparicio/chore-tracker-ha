# Changelog

All notable changes to this integration are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Checking off an item on a member's `todo` list now credits that member
  (`completedForMemberId`) instead of the API token's owner. The household
  list keeps the token-owner default. Points and effort follow the credited
  member, and a check-off for a member who requires approval now lands in
  `pending_approval` until an admin approves it.

### Added

- `member_id` state attribute on per-member `todo` entities so Lovelace cards
  (kiosk) can attribute completions to the selected member
- `chore_tracker/kiosk_items` WebSocket command: a member's assigned chores plus
  "up for grabs" chores they are eligible for, for the kiosk card. Todo entities
  and sensors are unchanged.

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
