# IEEC YA Connect

React + Firebase platform for IEEC Young Adult ministry operations.

This branch establishes the **Platform Blueprint** foundation: reusable engines, scoped RBAC, and the Follow-Up module as the first business module.

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

Key approved decisions:

- Engines vs Modules separation
- Multi-organization tenancy with optional parent oversight
- Person ≠ User Account
- Roles are scoped permission templates (live updates + overrides)
- Follow-Up is the first complete ministry module

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

- [Platform Blueprint](docs/architecture/00-platform-blueprint.md)
- [People & Access Model](docs/architecture/01-people-and-access.md)
- [RBAC Engine](docs/architecture/02-rbac-engine.md)
- [Follow-Up Module Requirements](docs/modules/follow-up.md)
- [ADR Index](docs/adr/README.md)
- [AI Development Guide](docs/architecture/90-ai-development-guide.md)

## Note on prior Flutter work

An earlier Flutter scaffold lives on `cursor/ieec-ya-connect-55ea` (PR #1). This branch pivots to the React + Firebase platform architecture from the system design sessions.
