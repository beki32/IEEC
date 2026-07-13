# Canonical design sources

IEEC YA Connect design spans **two ChatGPT shares** as one continuous project.

## Source map

| Phase | Content | Share |
| --- | --- | --- |
| **Chapters / Steps 1–2** (first phase) | Vision, problem definition, org structure, ministry journey, design principles, people & access, RBAC foundations | [Link 1](https://chatgpt.com/share/6a54d9c0-23d4-83ea-b8d6-6e3675729fbd) |
| **Chapter / Step 3+** (continuation) | Follow-Up requirements, RBAC ADRs refinement, platform engines, later design | [Link 2](https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff) |

Link 2 **continues** the project started in link 1. It does not replace chapters 1–2.

## Link 1 cutoff rule

In link 1, **do not use** any information that appears **after** this user message:

> Give me over all content from step 1 and step 2 in pdf

That post-cutoff material (PDF packaging / regenerated dumps / later noise) is out of scope.

Use link 1 **before that message** for chapters 1–2 detail.

## How to resolve conflicts

1. Chapters 1–2 → prefer **link 1 (pre-cutoff)**
2. Chapter 3+ (Follow-Up, later ADRs, engines) → prefer **link 2**
3. If link 2 restates Step 1–2 as context, treat that as a **handoff summary**, not a replacement of link 1 chapters 1–2

## Phase rule

**Planning only.** No application code until Architecture Baseline v1.0 is explicitly approved for implementation.

## Status

| Area | Source | Status |
| --- | --- | --- |
| Step 1 — Problem Definition / Foundation | Link 1 (pre-cutoff) | Approved |
| Step 2 — People & Access | Link 1 (pre-cutoff) | Approved |
| Step 3 — Follow-Up Team Requirements | Link 2 | Drafted (policies mostly admin-configurable; attendance resolved) |
| ADR-RBAC-001 / default grant | Link 2 + planning clarification | Approved |
| ADR-RBAC-002 live templates | Link 2 | Approved |
| ADR-RBAC-003 time-bound assignments | Link 2 | Pending |

## Living document chapters

1. Vision & Requirements *(link 1)*  
2. Organization Structure / People & Access *(link 1)*  
3. Access Control (RBAC) *(started link 1, continued link 2)*  
4. Database Design  
5. API Design  
6. UI/UX  
7. Workflows  
8. Notifications  
9. Reports  
10. Deployment  

Follow-Up module detail lives under Step 3 in link 2 → `docs/modules/follow-up.md`.
