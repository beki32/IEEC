# ADR-001 — Platform Engines vs Modules

## Decision

IEEC YA Connect is composed of reusable **Platform Engines** and business **Modules**. Modules must reuse engines rather than implement duplicate infrastructure.

## Consequences

- Shared auth, people, RBAC, workflow, forms, calendar, communication, reporting, audit, and configuration
- Follow-Up and later ministry modules orchestrate engines instead of owning parallel stacks
