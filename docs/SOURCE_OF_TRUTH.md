# Canonical design source

**Authoritative source for this planning branch:**  
https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff  
(*IEEC YA Connect Design* — latest updated design thread)

An earlier share (`6a54d9c0-…`) is **not** the source of truth. Prefer this document set whenever sources conflict.

## Phase rule

**Planning only.** Do not generate application code, Firebase rules, or runnable scaffolds until Architecture Baseline v1.0 is explicitly approved for implementation.

## Status captured from the canonical thread

| Area | Status |
| --- | --- |
| Step 1 — Problem Definition | Approved |
| Step 2 — People & Access Model | Approved |
| Step 3 — Follow-Up Team Requirements | Drafted (open business decisions remain) |
| ADR-RBAC-001 — Roles are templates | Approved |
| ADR-RBAC-002 — Role templates are live (Option A) | Approved |
| ADR-RBAC-003 — Time-bound role assignments | **Pending** (recommended Yes; not yet answered in-thread) |

## Living document chapters (from the design thread)

1. Vision & Requirements  
2. Organization Structure  
3. Access Control (RBAC)  
4. Database Design  
5. API Design  
6. UI/UX  
7. Workflows  
8. Notifications  
9. Reports  
10. Deployment  

## Next design steps (per thread)

1. Resolve the 10 Follow-Up business decisions listed in `docs/modules/follow-up.md`
2. Step 3.2 — Follow-Up Workflows and State Transitions
3. Firestore data model for Follow-Up (design docs only)
4. Continue RBAC decisions starting from ADR-RBAC-003
