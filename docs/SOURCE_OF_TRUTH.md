# Canonical design sources

## Design authority (highest)

**Architecture Handbook v0.4** (July 13, 2026) — Chapters 1–13

- PDF: `docs/handbook/IEEC_YA_Connect_Architecture_Handbook_v0.4.pdf`
- Searchable: `docs/handbook/Architecture_Handbook_v0.4.md`

Prior signed foundation (Ch. 1–3 only): Handbook **v0.3** PDF/extract under `docs/handbook/`.

If a module spec conflicts with the handbook, **the handbook wins** unless an approved ADR changes the standard.

Handbook TOC status: **all Chapters 1–13 present in v0.4**.

## ChatGPT design threads (module detail)

| Phase | Authority |
| --- | --- |
| Chapters / Steps 1–2 foundation narrative | [Link 1](https://chatgpt.com/share/6a54d9c0-23d4-83ea-b8d6-6e3675729fbd) — **only before** `Give me over all content from step 1 and step 2 in pdf` |
| Follow-Up Step 3+ detail | [Link 2](https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff) |

Repo Follow-Up docs under `docs/modules/` capture link 2 detail for coding handoff.

## Phase rule

**Planning is frozen as Architecture Baseline v1.0 for coding.**  
This planning agent still does not write application code.  
**Coding:** paste `docs/AI_CODING_HANDOFF_PROMPT.md` into a **separate Cursor coding account**.

## Product clients (settled)

IEEC YA Connect is a **web + mobile** system (both first-class).

| Client | UI framework | Notes |
| --- | --- | --- |
| **Web** | **React** + TypeScript + Vite | Browser app (React DOM) |
| **Mobile** | **React Native** via **Expo** + TypeScript | iOS/Android native UI — **not** a WebView wrapper of the web app |
| **Shared** | Firebase + domain contracts/types | Same Auth, Firestore, permissions, workflows — do not fork business rules |
| **Not used** | Flutter | Out of scope |

Mobile binaries: EAS Build → `.apk` / `.aab` / `.ipa`. See Ch. 13 §13.8.1.

## Approved ADR catalog (Handbook)

ADR-001 Person record · ADR-002 Roles as templates · ADR-003 One org calendar · ADR-004 Chat ≠ team membership · ADR-005 Dynamic forms · ADR-006 Soft delete + audit · ADR-007 Federated multi-org  

RBAC clarifications: ADR-RBAC-001/002/003 (scoped live templates, full default grant, time bounds).

## Coding handoff

1. Use `docs/AI_CODING_HANDOFF_PROMPT.md` (status: **READY**)  
2. New Cursor coding agent / different account  
3. Agent must propose Phase A plan and wait for approval before implementing
