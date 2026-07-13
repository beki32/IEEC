# Planning backlog

## Done (planning)

- Source map (link 1 Ch.1–2 / link 2 Follow-Up; PDF cutoff rule)
- Follow-Up requirements, workflows, Firestore model, permissions, config defaults
- AI coding handoff prompt (for a separate Cursor account)
- Architecture Handbook **v0.3** ingested as design authority (Ch. 1–3 + ADR-001…007)
- Handbook **Chapters 4–6 drafts** (People / AuthN / AuthZ)
- Handbook **Chapters 7–13 drafts** (Forms, Workflow, Calendar, Chat, Notifications/Tasks, Audit, Data & Engineering Standards)

## Next

1. **Human review** of Handbook v0.3 + Ch. 4–13 drafts + Follow-Up pack  
2. **Freeze Architecture Baseline v1.0** (or note remaining open policy items first)  
3. When frozen: paste `docs/AI_CODING_HANDOFF_PROMPT.md` into the **coding** Cursor account  

### Optional polish before freeze (not blockers for MVP coding)

- Normalize Follow-Up permission key singular/plural aliases into one canonical set  
- Close remaining soft policy items in `docs/modules/follow-up.md` “Open decisions” that are not already answered by config defaults  
- Confirm mobile framework at coding freeze (React Native/Expo vs Flutter) without changing web+mobile scope  
- Absorb Ch. 4–13 into a future PDF handbook revision  

## Not done by this planning agent

- Application code (web + mobile / Firebase implementation)
