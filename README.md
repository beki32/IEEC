# IEEC YA Connect — Planning

**Phase:** Architecture Baseline **v1.0 frozen** for coding.  
This agent/account stays planning-only (no app code here).

**Product:**  
- **Web:** React (DOM) + TypeScript + Vite  
- **Mobile:** React Native (Expo) + TypeScript — separate native UI, same Firebase backend  
- **Not** Flutter; **not** WebView-only mobile

## Start coding

1. Open a **separate Cursor coding account**  
2. Paste [`docs/AI_CODING_HANDOFF_PROMPT.md`](docs/AI_CODING_HANDOFF_PROMPT.md)  
3. Approve the agent’s Phase A plan, then implement  

## Design authority

**Architecture Handbook v0.3** (Ch. 1–3 PDF) + **Ch. 4–13 drafts** → [`docs/handbook/`](docs/handbook/)

Authority order: [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md).

## Document map

| Doc | Purpose |
| --- | --- |
| [**AI coding command prompt**](docs/AI_CODING_HANDOFF_PROMPT.md) | Paste into coding Cursor account ([PDF](docs/AI_CODING_HANDOFF_PROMPT.pdf)) |
| [Handbook index](docs/handbook/README.md) | Ch. 1–3 PDF + Ch. 4–13 drafts |
| [Source of truth](docs/SOURCE_OF_TRUTH.md) | Authority order + cutoff rules |
| [ADR index](docs/adr/README.md) | ADR-001…007 + RBAC clarifications |
| [Follow-Up requirements](docs/modules/follow-up.md) | Module requirements |
| [Follow-Up workflows](docs/modules/follow-up-workflows-and-state-transitions.md) | State transitions |
| [Follow-Up Firestore model](docs/modules/follow-up-firestore-data-model.md) | Collections |
| [Follow-Up permissions](docs/modules/follow-up-permission-catalog.md) | Canonical role defaults |
| [Follow-Up config defaults](docs/modules/follow-up-config-defaults.md) | Admin defaults |
| [Planning backlog](docs/PLANNING_BACKLOG.md) | Status |
