# ADR-RBAC-003 — Time-Bound Role Assignments

## Status

**Pending** — recommended in the canonical design thread, but not yet answered by the product owner.

Canonical source: https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff

## Proposed decision

Every role assignment should support:

- Start Date (optional)
- End Date (optional)
- Active/Inactive status

So temporary Acting Team Leader, Conference Coordinator, and Event Volunteer Leader assignments can expire automatically.

## Implementation note

The RBAC evaluator already supports optional `startAt` / `endAt` / `isActive` so the code path is ready if this ADR is approved. Do not treat time-bounding as final product policy until the decision is recorded as Approved.
