# Canonical design source

**Authoritative source for this planning branch:**  
https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff  
(*IEEC YA Connect Design* — latest updated design thread)

## First share exclusion rule

Earlier share: https://chatgpt.com/share/6a54d9c0-23d4-83ea-b8d6-6e3675729fbd

**Do not use any information from that first share that appears after this user message:**

> Give me over all content from step 1 and step 2 in pdf

That post-cutoff content (PDF dump, regenerated Step 1/2 packaging, later Step 3 expansions, Firebase React RBAC guide material, etc.) is out of scope for planning and implementation.

If Step 1 / Step 2 material is needed, use the versions carried into the **canonical second share** (and this `docs/` set), not the first-share post-cutoff regeneration.

When sources conflict, the second share + this repo’s planning docs win.

## Phase rule

**Planning only.** Do not generate application code, Firebase rules, or runnable scaffolds until Architecture Baseline v1.0 is explicitly approved for implementation.

## Status captured from the canonical thread

| Area | Status |
| --- | --- |
| Step 1 — Problem Definition | Approved |
| Step 2 — People & Access Model | Approved |
| Step 3 — Follow-Up Team Requirements | Drafted (remaining policies are admin-configurable; attendance resolved) |
| ADR-RBAC-001 — Roles are templates | Approved |
| ADR-RBAC-001 default grant — assigned role gives all template permissions (in scope) | Approved (planning clarification) |
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

1. Set defaults for remaining Follow-Up admin-configurable policies (`docs/modules/follow-up.md`)
2. Step 3.2 — Follow-Up Workflows and State Transitions
3. Firestore data model for Follow-Up (design docs only)
4. Continue RBAC decisions starting from ADR-RBAC-003
