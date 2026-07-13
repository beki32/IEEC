# ADR-002 — Federated Multi-Organization Tenancy

## Decision

IEEC YA Connect supports multiple independent organizations under an optional parent organization. Each organization owns and isolates its people, users, roles, permissions, ministry records, calendar, chat, and operational data. Parent organizations receive only explicitly configured oversight and aggregate access.

## Consequences

- No parent/platform role automatically grants sensitive local ministry data
- After sign-in, users select an organization context
- Permissions load only for the selected organization
