# Canonical design sources

## Design authority (highest)

**Architecture Handbook v0.3** (July 13, 2026)

- PDF: `docs/handbook/IEEC_YA_Connect_Architecture_Handbook_v0.3.pdf`
- Searchable extract: `docs/handbook/Architecture_Handbook_v0.3.md`

If a module spec conflicts with the handbook, **the handbook wins** unless an approved ADR changes the standard.

Handbook TOC status:

| Chapter | Status in v0.3 |
| --- | --- |
| 1 Purpose, Scope, Design Authority | Present |
| 2 Core Design Principles & Engines | Present |
| 3 Organization and Tenant Model | Present |
| 4–13 (People, AuthN, AuthZ, Forms, Workflow, Calendar, Chat, Notifications, Audit, Data standards) | Planned |

## ChatGPT design threads (module detail)

| Phase | Authority |
| --- | --- |
| Chapters / Steps 1–2 foundation narrative | [Link 1](https://chatgpt.com/share/6a54d9c0-23d4-83ea-b8d6-6e3675729fbd) — **only before** `Give me over all content from step 1 and step 2 in pdf` |
| Follow-Up Step 3+ detail | [Link 2](https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff) |

Repo Follow-Up docs under `docs/modules/` capture link 2 detail for coding handoff.

## Phase rule

**Planning only in this branch/agent.** No application code here.  
Coding uses `docs/AI_CODING_HANDOFF_PROMPT.md` in a **separate Cursor account** after baseline freeze.

## Approved ADR catalog (Handbook)

ADR-001 Person record · ADR-002 Roles as templates · ADR-003 One org calendar · ADR-004 Chat ≠ team membership · ADR-005 Dynamic forms · ADR-006 Soft delete + audit · ADR-007 Federated multi-org  

RBAC clarifications: ADR-RBAC-001/002/003 (scoped live templates, full default grant, time bounds).

## Next planning steps

1. Human review Handbook v0.3 + Follow-Up pack  
2. Continue handbook chapters 4–6 (People, AuthN, AuthZ) when ready — or freeze v0.3 + Follow-Up pack as enough for first coding milestone  
3. Paste `docs/AI_CODING_HANDOFF_PROMPT.md` into the coding Cursor account after freeze
