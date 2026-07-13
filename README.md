# IEEC YA Connect — Planning

**Phase:** Architecture / planning only — **no application code yet.**

**Canonical design source:**  
https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff

See [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md).  
Do **not** use content from the earlier share after: `Give me over all content from step 1 and step 2 in pdf`.

## Goal of this branch

Capture and organize the platform blueprint, ADRs, and Follow-Up requirements so implementation can start later without redesigning core decisions.

## Document map

| Doc | Purpose |
| --- | --- |
| [Source of truth](docs/SOURCE_OF_TRUTH.md) | Canonical share link + approval status |
| [Platform blueprint](docs/architecture/00-platform-blueprint.md) | Engines, modules, milestones |
| [People & access](docs/architecture/01-people-and-access.md) | Step 2 model |
| [RBAC engine](docs/architecture/02-rbac-engine.md) | ADR-RBAC-001/002 (+ pending 003) |
| [Follow-Up requirements](docs/modules/follow-up.md) | Step 3 module requirements |
| [ADR index](docs/adr/README.md) | Decision register |
| [AI development guide](docs/architecture/90-ai-development-guide.md) | Rules for future coding sessions |

## Current status (from canonical thread)

- ✅ Step 1 — Problem Definition  
- ✅ Step 2 — People & Access Model  
- 📝 Step 3 — Follow-Up Team Requirements (draft; open decisions remain)  
- ✅ ADR-RBAC-001, ADR-RBAC-002  
- ⏳ ADR-RBAC-003 (pending answer)  

## Next planning steps

1. Resolve the 10 Follow-Up business decisions  
2. Step 3.2 — Follow-Up workflows and state transitions  
3. Firestore data model (still planning, not implementation)  
4. Freeze Architecture Baseline v1.0 before any coding  

## Out of scope for now

No React app, Flutter app, Firebase rules deployment, or feature implementation on this branch until planning is explicitly marked complete.
