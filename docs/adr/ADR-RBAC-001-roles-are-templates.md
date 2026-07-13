# ADR-RBAC-001 — Roles Are Templates

## Decision

A role is a reusable permission template. It has no authority until assigned within a scope. A person may hold the same role in multiple scopes.

## Consequences

- Avoid duplicate role definitions per ministry
- Permission evaluation is always scope-aware
