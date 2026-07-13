# IEEC YA Connect — Planning

**Phase:** Architecture / planning only — **no application code yet.**

## Design spans two ChatGPT shares

| Phase | Where |
| --- | --- |
| **Chapters 1–2** (vision, problem, people & access) | [Link 1](https://chatgpt.com/share/6a54d9c0-23d4-83ea-b8d6-6e3675729fbd) — use only content **before** `Give me over all content from step 1 and step 2 in pdf` |
| **Chapter 3+** (Follow-Up and later design) | [Link 2](https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff) — continuation of link 1 |

Details: [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md)

## Goal of this branch

Capture and organize the platform blueprint, ADRs, and Follow-Up requirements so implementation can start later without redesigning core decisions.

## Document map

| Doc | Purpose |
| --- | --- |
| [Source of truth](docs/SOURCE_OF_TRUTH.md) | Two-link source map + cutoff rule |
| [Chapter 1 — Vision & problem](docs/architecture/chapter-01-vision-and-problem.md) | From link 1 |
| [Chapter 2 — People & access](docs/architecture/chapter-02-people-and-access.md) | From link 1 |
| [Chapter 3 — Follow-Up](docs/architecture/chapter-03-follow-up.md) | From link 2 |
| [Platform blueprint](docs/architecture/00-platform-blueprint.md) | Engines, modules, milestones |
| [People & access (detail)](docs/architecture/01-people-and-access.md) | Step 2 model |
| [RBAC engine](docs/architecture/02-rbac-engine.md) | ADR-RBAC-001/002 (+ pending 003) |
| [Follow-Up requirements](docs/modules/follow-up.md) | Step 3 module requirements |
| [Follow-Up workflows & states](docs/modules/follow-up-workflows-and-state-transitions.md) | From link 2 Step 3.2 / 3.3.2 |
| [ADR index](docs/adr/README.md) | Decision register |
| [Planning backlog](docs/PLANNING_BACKLOG.md) | Next planning tasks |
| [AI development guide](docs/architecture/90-ai-development-guide.md) | Rules for future coding sessions |

## Current status

- ✅ Chapters 1–2 (link 1, pre-cutoff)  
- 📝 Chapter 3 Follow-Up requirements (link 2; attendance resolved; other policies admin-configurable)  
- ✅ ADR-RBAC-001, ADR-RBAC-002, ADR-RBAC-003  

## Out of scope for now

No React/Flutter app, Firebase rules deployment, or feature implementation until planning is explicitly marked complete.
