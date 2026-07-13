# IEEC YA Connect — Planning

**Phase:** Architecture / planning only — **no application code in this agent/account.**

## Design authority

**Architecture Handbook v0.3** (Ch. 1–3 PDF) + **Ch. 4–6 drafts** → [`docs/handbook/`](docs/handbook/)

Supporting ChatGPT threads + Follow-Up module pack: [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md).

## Document map

| Doc | Purpose |
| --- | --- |
| [Handbook index](docs/handbook/README.md) | Platform design authority (Ch. 1–3 PDF + Ch. 4–6 drafts) |
| [Ch. 4 People & Account](docs/handbook/Chapter_04_People_and_Account_Model.md) | Person ≠ account, status, duplicates, invitations |
| [Ch. 5 Identity & Auth](docs/handbook/Chapter_05_Identity_and_Authentication.md) | Firebase Auth, invite/activation, multi-org context |
| [Ch. 6 Authorization](docs/handbook/Chapter_06_Authorization_and_Permission_Engine.md) | RBAC scopes, templates, overrides, resolution |
| [Source of truth](docs/SOURCE_OF_TRUTH.md) | Authority order + cutoff rules |
| [ADR index](docs/adr/README.md) | ADR-001…007 + RBAC clarifications |
| [Follow-Up requirements](docs/modules/follow-up.md) | Module requirements |
| [Follow-Up workflows](docs/modules/follow-up-workflows-and-state-transitions.md) | State transitions |
| [Follow-Up Firestore model](docs/modules/follow-up-firestore-data-model.md) | Collections |
| [Follow-Up permissions](docs/modules/follow-up-permission-catalog.md) | Role defaults |
| [Follow-Up config defaults](docs/modules/follow-up-config-defaults.md) | Admin defaults |
| [AI coding handoff prompt](docs/AI_CODING_HANDOFF_PROMPT.md) | Paste into **other** Cursor account to code |
| [Planning backlog](docs/PLANNING_BACKLOG.md) | What’s next |

## Next step

1. Review Handbook v0.3 + Ch. 4–6 drafts + Follow-Up pack  
2. Freeze baseline **or** continue handbook Ch. 7+ first  
3. In your coding Cursor account, paste `docs/AI_CODING_HANDOFF_PROMPT.md`
