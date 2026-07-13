# Planning backlog

Ordered next work for the planning phase (no code).

## Immediate

1. Answer **ADR-RBAC-003** — should role assignments support start/end dates and active/inactive?
2. Treat remaining Follow-Up business decisions as **admin-configurable policies** (with documented defaults) — see `docs/modules/follow-up.md`
3. Attendance is already decided (Saturday program via calendar; separate from weekly report) — see Follow-Up §3.6A
4. Confirm starter role templates + full permission sets for Follow-Up Leader / Assistant / Minister (assignment grants all permissions on the template by default)
5. Draft **Step 3.2 — Follow-Up Workflows and State Transitions**
6. Draft **Follow-Up Firestore data model** (collections + fields only; no rules/app code)

## Then

7. Continue RBAC ADRs (after 003): overrides, scope evaluation, system vs ministry authority, etc.
8. Expand Architecture Handbook chapters (Organization, People, Authorization, Workflow, Forms, …)
9. Permission Catalog for Follow-Up Leader / Assistant / Minister
10. Freeze **Architecture Baseline v1.0** checklist before any implementation branch
