# IEEC YA Connect

React + Firebase platform for IEEC Young Adult ministry operations.

**Canonical design source:** [IEEC YA Connect Design](https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff)  
Details: [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md)

This branch establishes the **Platform Blueprint** foundation from that thread: reusable engines, scoped RBAC, and Follow-Up as the first business module.

## Stack

- React + TypeScript (Vite) in `web/`
- Firebase Auth + Cloud Firestore (`ieec-ya-connect`)
- Architecture docs in `docs/`

## Architecture at a glance

| Layer | Responsibility |
| --- | --- |
| **Engines** | Reusable platform services (Organization, People, RBAC, Workflow, Forms, Communication, Calendar, Reporting, Audit, Configuration) |
| **Modules** | Business features that orchestrate engines (Follow-Up first) |
| **ADRs** | Approved decisions that constrain implementation |

Approved from the canonical thread:

- Step 1 Problem Definition + Step 2 People & Access
- ADR-RBAC-001 / ADR-RBAC-002 (roles are scoped live templates)
- Follow-Up Step 3 requirements draft

Pending in-thread: ADR-RBAC-003 (time-bound assignments) and the 10 Follow-Up business decisions.

## Quick start

```bash
cd web
npm install
npm run dev
```

Configure Firebase by copying `web/.env.example` to `web/.env` (values for project `ieec-ya-connect` are prefilled).

## Bootstrap Head Leader

1. Create the Auth user in Firebase Console.
2. Seed `/users/{uid}` from `firestore_seed/initial_admin_profile.json`.
3. Deploy rules: `firebase deploy --only firestore:rules,firestore:indexes`.

## Docs

- [Source of truth](docs/SOURCE_OF_TRUTH.md)
- [Platform Blueprint](docs/architecture/00-platform-blueprint.md)
- [People & Access Model](docs/architecture/01-people-and-access.md)
- [RBAC Engine](docs/architecture/02-rbac-engine.md)
- [Follow-Up Module Requirements](docs/modules/follow-up.md)
- [ADR Index](docs/adr/README.md)
- [AI Development Guide](docs/architecture/90-ai-development-guide.md)

## Note on prior Flutter work

An earlier Flutter scaffold lives on `cursor/ieec-ya-connect-55ea` (PR #1). This branch follows the React + Firebase platform architecture from the latest design thread.
