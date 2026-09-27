# HACS default-store submission (human)

Do **not** open this PR as a bot. After `v0.5.0` exists on
`luis-aparicio/chore-tracker-ha` and Validate CI is green without ignores,
a human owner/major contributor files the PR against
[hacs/default](https://github.com/hacs/default).

## Prerequisites checklist

- [ ] Integration installs via HACS **custom repository**
- [ ] `hassfest` and `hacs/action` pass on `main` with **no** `ignore:` keys
- [ ] GitHub Release **v0.5.0** exists (not a tag alone)
- [ ] Repo has a description, Issues enabled, and topics
- [ ] You are the owner or a major contributor of `chore-tracker-ha`

## Exact `integration` file change

In a personal fork of `hacs/default`, branch from `master`, edit
[`integration`](https://github.com/hacs/default/blob/master/integration)
and insert this line **alphabetically** between the existing neighbors:

```text
Before: "lufton/ha_telegram_client",
Add:    "luis-aparicio/chore-tracker-ha",
After:  "luis-garza/movistar_rft8115vw",
```

JSON fragment (keep surrounding commas valid):

```json
  "lufton/ha_telegram_client",
  "luis-aparicio/chore-tracker-ha",
  "luis-garza/movistar_rft8115vw",
```

## Suggested PR title

```text
Add luis-aparicio/chore-tracker-ha
```

## Suggested PR body

Copy into the `hacs/default` PR template and complete any checkboxes the
template requires:

```markdown
## What type of repository is this?

- [x] Integration

## Repository details

- Repository: https://github.com/luis-aparicio/chore-tracker-ha
- Owner / major contributor: yes (submitting as repository owner)

## Checklist

- [x] The repository is public and hosted on GitHub
- [x] The repository can be added as a HACS custom repository today
- [x] HACS Action and Hassfest pass on the default branch with no ignores
- [x] At least one GitHub Release exists (`v0.5.0`)
- [x] Brand assets: `custom_components/chore_tracker/brand/icon.png`
- [x] Entry added alphabetically to `integration`

## Notes

Chore Tracker connects Home Assistant to a self-hosted Chore Tracker server
(todo entities, calendar, services, bundled Lovelace cards). Install via
custom repository works today; this PR requests default-store inclusion.
```

## After merge (HACS side)

Default-store inclusion appears after the next HACS scheduled scan. Until then,
custom-repository install remains the supported path (see README).
