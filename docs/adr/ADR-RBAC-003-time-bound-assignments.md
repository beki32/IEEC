# ADR-RBAC-003 — Time-Bound Role Assignments

## Decision (recommended)

Every role assignment supports optional start date, end date, and active/inactive status so temporary leadership and volunteer roles expire automatically.

## Consequences

- Acting leaders and event coordinators do not require manual cleanup
- Authorization checks must respect effective dating
