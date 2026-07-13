# Authorization Engine (RBAC)

**Canonical source:** https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff

## ADR-RBAC-001 — Roles are templates (Approved)

A role is a reusable template that groups permissions. It grants no authority until assigned within a specific scope.

- A person may have multiple roles
- The same role may be assigned multiple times in different scopes
- Permissions are always evaluated within the assignment scope
- Roles never bypass the permission engine

Example:

```text
Person: John
1. Follow-Up Leader @ IEEC → Young Adult → Follow-Up Team
2. Bible Study Leader @ IEEC → Young Adult → Bible Study Team
```

## ADR-RBAC-002 — Role templates are live (Approved — Option A)

Role templates are the single source of truth. Updating a template applies to all current and future assignments. Do not snapshot permissions onto assignments. Exceptions use individual permission overrides.

## ADR-RBAC-003 — Time-bound assignments (Pending)

Recommended Yes in the canonical thread; not yet confirmed. Evaluator supports optional start/end/active fields, but product policy remains pending.

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
- `follow_up.chat.manage`
- `follow_up.sensitive.view`
- `follow_up.membership.recommend`
- `follow_up.membership.approve`
