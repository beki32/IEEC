# Planning backlog

Ordered next work for the planning phase (no code).

## Immediate

1. Answer **ADR-RBAC-003** — should role assignments support start/end dates and active/inactive?
2. Treat the **10 Follow-Up business decisions** as **admin-configurable policies** (with documented defaults) — see `docs/modules/follow-up.md`
3. Confirm starter role templates + full permission sets for Follow-Up Leader / Assistant / Minister (assignment grants all permissions on the template by default)
3. Draft **Step 3.2 — Follow-Up Workflows and State Transitions**
4. Draft **Follow-Up Firestore data model** (collections + fields only; no rules/app code)

## Then

5. Continue RBAC ADRs (after 003): overrides, scope evaluation, system vs ministry authority, etc.
6. Expand Architecture Handbook chapters (Organization, People, Authorization, Workflow, Forms, …)
7. Permission Catalog for Follow-Up Leader / Assistant / Minister
8. Freeze **Architecture Baseline v1.0** checklist before any implementation branch
