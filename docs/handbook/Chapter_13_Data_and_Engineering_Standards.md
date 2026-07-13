# Chapter 13 — Data and Engineering Standards

**Status:** Draft handbook chapter (planning authority until PDF revision)  
**Depends on:** Chapters 1–12  
**Stack:** React + TypeScript + Vite + Firebase (Auth, Firestore; Functions/Storage as needed)  

---

## 13.1 Purpose

This chapter sets engineering standards so modules stay consistent, secure, and maintainable. AI coding assistants and human developers must follow these rules unless an ADR changes them.

## 13.2 Engines vs modules

| Kind | Responsibility | Location (suggested) |
| --- | --- | --- |
| **Engine** | Reusable platform capability | `engines/*` |
| **Module** | Business ministry functionality | `modules/follow-up`, etc. |

Modules **must** reuse People, AuthZ, Forms, Workflow, Calendar, Chat, Notifications/Tasks, Audit, and Configuration engines. Duplicating person stores, calendars, chats, workflows, or form systems is non-compliant (Chapter 2 completion criteria).

## 13.3 Firestore data standards

1. **Organization scope** — every org-owned operational doc includes `organizationId`.  
2. **Authoritative scope** — never trust UI path alone; Security Rules verify scope from records.  
3. **Top-level collections** preferred for operational entities with `organizationId` (Follow-Up model).  
4. **Person is lean** — journeys, reports, attendance, bio, messages live in separate collections.  
5. **No huge growing arrays** inside hot documents for messages/reports/attendance.  
6. **Soft delete by default** (ADR-006).  
7. **Timestamps** — `createdAt` / `updatedAt`; actor ids on mutating fields where relevant.  
8. **Normalized contact fields** for search/duplicate detection.  
9. **Idempotent unique keys** where required (e.g. attendance `personId + calendarEventId`).  
10. **Indexes planned** with queries; document composite indexes in planning/README as they are added.

## 13.4 Identity and security standards

```text
Auth UID → userAccounts → Person → effective permissions → allow/deny
```

- Default deny; explicit deny wins (Chapter 6).  
- UI hide ≠ security.  
- Enforcement layers (Chapter 2): React UI → application/service validation → Firestore Security Rules → Cloud Functions/trusted backend → automated allow/deny tests.  
- Public write surfaces are allowlisted and minimal.  
- Secrets never committed; use env/emulator configs.

## 13.5 Permission key standards

- Namespaced keys: `domain.resource.action`  
- Prefer plural resources: `follow_up.assignments.create`, `follow_up.reports.review`  
- Normalize legacy singular/plural aliases **before** coding freezes the catalog  
- Evaluate resolved permissions, not role title strings  

## 13.6 Configuration standards

- Deadlines, labels, approval templates, reminder offsets, welcome toggles are configuration.  
- Configuration must not disable security guardrails or invent illegal Member transitions.  
- Every deadline has a timezone.  
- Seed org defaults from `docs/modules/follow-up-config-defaults.md` for Follow-Up.

## 13.7 API / function standards

- Privileged multi-doc transactions (Member approval, merge Person, invite activation) prefer Cloud Functions / callable trusted paths.  
- Functions re-check permissions and write audit.  
- Client may do direct Firestore access only where rules fully encode the policy.

## 13.8 Frontend standards

- TypeScript strict.  
- Permission-gated routes and actions.  
- Engines expose hooks/services; modules compose them.  
- Accessible forms; mobile-usable layouts for minister weekly ops.  
- Do not redesign architecture in UI convenience refactors.

## 13.9 Testing standards

Minimum before calling a slice done:

- Unit tests for permission resolution and workflow guards where logic is pure.  
- Rules tests (emulator) for allow and deny paths on Follow-Up collections.  
- Smoke tests for public registration and authenticated report/attendance happy paths.  

## 13.10 AI / human implementation protocol

1. Read `docs/SOURCE_OF_TRUTH.md` and handbook chapters.  
2. Read ADRs; do not reopen approved decisions.  
3. Classify change as Engine vs Module.  
4. Follow `docs/AI_CODING_HANDOFF_PROMPT.md` for coding sessions.  
5. If docs are silent, **ask the human** — do not invent product policy.  
6. Planning agents do not ship application code; coding agents do not rewrite handbook policy.

## 13.11 Definition of architecture-compliant module

A module is compliant only when it:

- Reuses shared engines  
- Declares permission catalog + default role mappings  
- Protects sensitive data  
- Preserves history / soft delete  
- Writes required audit events  
- Avoids duplicate person/calendar/chat/workflow/form infrastructure  
- Stays organization-scoped under ADR-007  

## 13.12 MVP coding freeze note

For the first Follow-Up coding milestone, Chapters 1–13 drafts + Follow-Up module pack + ADRs are sufficient to implement Phase A (platform foundation) and Phase B (Follow-Up MVP) in the handoff prompt. Parent-org product depth, SMS/WhatsApp, and other ministry modules remain out of scope until specified.

## 13.13 Chapter completion criteria

- Engine/module boundary and Firestore standards are explicit.
- Security enforcement layers are mandatory.
- Permission naming and config guardrails documented.
- Testing and AI implementation protocol defined.
- Compliance checklist exists for future modules.

---

**Handbook draft set status:** Chapters 1–3 (PDF v0.3) + Chapters 4–13 (repo drafts) form the planning baseline for human freeze before coding.
