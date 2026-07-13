# Authorization Engine (RBAC)

## ADR-RBAC-001 — Roles are templates

A role is a reusable template that groups permissions. It grants no authority until assigned within a specific scope.

- A person may have multiple roles
- The same role may be assigned multiple times in different scopes
- Permissions are always evaluated within the assignment scope

Example:

```text
Person: John
1. Follow-Up Leader @ IEEC → Young Adult → Follow-Up Team
2. Bible Study Leader @ IEEC → Young Adult → Bible Study Team
```

## ADR-RBAC-002 — Role templates are live

Role templates are the single source of truth. Updating a template applies to all current and future assignments. Exceptions use permission overrides, not frozen copies.

## ADR-RBAC-003 — Time-bound assignments (recommended)

Role assignments support optional start/end dates and active/inactive status for temporary leadership and volunteer coverage.

## Evaluation algorithm

1. Resolve active role assignments for `(personId, organizationId)` within the requested scope chain.
2. Union permissions from assigned role templates.
3. Apply grant overrides, then deny overrides.
4. Default deny if the permission is still absent.
5. Write an audit event for permission-mutating operations.

## Follow-Up permission examples

- `follow_up.view`
- `follow_up.assign`
- `follow_up.entry.create`
- `follow_up.entry.update_own`
- `follow_up.report.review`
- `follow_up.sensitive.view`
- `follow_up.membership.recommend`
- `follow_up.membership.approve`
