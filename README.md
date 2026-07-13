# IEEC YA Connect — Planning

**Phase:** Architecture / planning only — **no application code in this agent/account.**

**Product:** Web app + Mobile app (both first-class) — **React** on web (Vite) and mobile (**Expo / React Native**). Not Flutter. Shared Firebase backend.

## Design authority

**Architecture Handbook v0.3** (Ch. 1–3 PDF) + **Ch. 4–13 drafts** → [`docs/handbook/`](docs/handbook/)

Supporting ChatGPT threads + Follow-Up module pack: [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md).

## Document map

| Doc | Purpose |
| --- | --- |
| [Handbook index](docs/handbook/README.md) | Platform design authority (Ch. 1–3 PDF + Ch. 4–13 drafts) |
| [Ch. 4 People & Account](docs/handbook/Chapter_04_People_and_Account_Model.md) | Person ≠ account, status, duplicates, invitations |
| [Ch. 5 Identity & Auth](docs/handbook/Chapter_05_Identity_and_Authentication.md) | Firebase Auth, invite/activation, multi-org context |
| [Ch. 6 Authorization](docs/handbook/Chapter_06_Authorization_and_Permission_Engine.md) | RBAC scopes, templates, overrides, resolution |
| [Ch. 7 Dynamic Forms](docs/handbook/Chapter_07_Dynamic_Forms_Engine.md) | Versioned configurable forms |
| [Ch. 8 Workflow](docs/handbook/Chapter_08_Workflow_Engine.md) | States, approvals, transitions |
| [Ch. 9 Calendar](docs/handbook/Chapter_09_Ministry_Calendar_Engine.md) | One org calendar, attendance linkage |
| [Ch. 10 Chat](docs/handbook/Chapter_10_Chat_and_Collaboration.md) | Chat ≠ team membership |
| [Ch. 11 Notifications & Tasks](docs/handbook/Chapter_11_Notifications_and_Tasks.md) | Notices vs actionable tasks |
| [Ch. 12 Audit](docs/handbook/Chapter_12_Audit_and_History.md) | Soft delete + append-only audit |
| [Ch. 13 Data & Engineering](docs/handbook/Chapter_13_Data_and_Engineering_Standards.md) | Firestore, security, AI coding rules |
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

1. Review Handbook v0.3 + Ch. 4–13 drafts + Follow-Up pack  
2. Freeze Architecture Baseline v1.0  
3. In your coding Cursor account, paste `docs/AI_CODING_HANDOFF_PROMPT.md`
