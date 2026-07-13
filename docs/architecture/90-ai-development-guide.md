# AI Development Guide

## Before writing code

1. Read `docs/architecture/00-platform-blueprint.md`
2. Check relevant ADRs in `docs/adr/`
3. Classify the change as **Engine** or **Module**
4. Prefer extending engines over adding module-local infrastructure

## Project layout

```text
web/src/
  engines/     # platform capabilities
  modules/     # business features
  shared/      # UI primitives, types, firebase helpers
  pages/       # route-level screens
  app/         # providers, router, shell
docs/          # blueprint, ADRs, module specs
firestore.rules
firestore_seed/
```

## Coding rules

- TypeScript strict; no `any` unless justified at boundary
- Firestore access goes through engine/module services, not ad-hoc in components
- Authorization checks use the RBAC engine helpers
- Soft-delete by default (`deletedAt` / `isDeleted`)
- Every permission-mutating or status-changing write should emit an audit event
- Default deny in UI and security rules

## Follow-Up first

Implement Follow-Up by composing People + RBAC + Audit (+ Workflow/Forms later). Do not invent a parallel people or permission model inside the module.
