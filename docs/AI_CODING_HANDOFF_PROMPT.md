# AI Implementation Prompt — IEEC YA Connect (Follow-Up first)

**Copy everything below the line into a new Cursor coding agent when Architecture Baseline v1.0 is frozen.**

**Do not use this prompt until planning is marked complete** in `docs/PLANNING_BACKLOG.md` / `docs/SOURCE_OF_TRUTH.md`.

---

## Your role

You are implementing **IEEC YA Connect**, a React + Firebase ministry platform.  
You must follow the planning docs in this repository. **Do not redesign** the architecture, roles, workflows, or data model unless a doc explicitly says something is still open.

This coding session is on a **different machine/account** from the planning agent. Treat `docs/` as the source of truth.

---

## Source map (mandatory)

### Highest authority

`docs/handbook/IEEC_YA_Connect_Architecture_Handbook_v0.3.pdf`  
(searchable: `docs/handbook/Architecture_Handbook_v0.3.md`)

If a module doc conflicts with the handbook, **follow the handbook** unless an approved ADR says otherwise.

### ChatGPT threads (supporting detail)

| Phase | Authority |
| --- | --- |
| Steps 1–2 narrative | https://chatgpt.com/share/6a54d9c0-23d4-83ea-b8d6-6e3675729fbd — only BEFORE `Give me over all content from step 1 and step 2 in pdf` |
| Follow-Up Step 3+ | https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff |

### Repo docs to read first

1. `docs/SOURCE_OF_TRUTH.md`
2. `docs/handbook/README.md` + Handbook v0.3 extract + **Ch. 4–13 drafts**
3. `docs/handbook/Chapter_04_People_and_Account_Model.md`
4. `docs/handbook/Chapter_05_Identity_and_Authentication.md`
5. `docs/handbook/Chapter_06_Authorization_and_Permission_Engine.md`
6. `docs/handbook/Chapter_07_Dynamic_Forms_Engine.md`
7. `docs/handbook/Chapter_08_Workflow_Engine.md`
8. `docs/handbook/Chapter_09_Ministry_Calendar_Engine.md`
9. `docs/handbook/Chapter_10_Chat_and_Collaboration.md`
10. `docs/handbook/Chapter_11_Notifications_and_Tasks.md`
11. `docs/handbook/Chapter_12_Audit_and_History.md`
12. `docs/handbook/Chapter_13_Data_and_Engineering_Standards.md`
13. `docs/adr/README.md` (ADR-001…007 + ADR-RBAC-001…003)
14. `docs/architecture/00-platform-blueprint.md`
15. `docs/architecture/90-ai-development-guide.md`
16. `docs/modules/follow-up.md`
17. `docs/modules/follow-up-workflows-and-state-transitions.md`
18. `docs/modules/follow-up-firestore-data-model.md`
19. `docs/modules/follow-up-permission-catalog.md`
20. `docs/modules/follow-up-config-defaults.md`

---

## Product summary

Build a **people-centered** Young Adult ministry platform for IEEC YA.

- Shepherd people: Newcomer → Member → Minister/leadership
- **Engines vs Modules**: shared platform engines; Follow-Up is the first business module
- **Clients:** **Web + Mobile** (both first-class; mobile is not “later”)
- **Web stack:** React + TypeScript + Vite
- **Mobile stack:** **React Native (Expo) + TypeScript** — **not Flutter**
- **Mobile binaries:** EAS Build → Android `.apk`/`.aab` and iOS `.ipa`
- **Backend:** Firebase Auth, Firestore; Functions/Storage as needed
- Multi-org capable later; start with one organization (`ieec_ya` / project `ieec-ya-connect` if configs exist)

### Access model (must implement)

- Ministry status ≠ system role ≠ org position ≠ team role ≠ oversight ≠ volunteer
- **Person ≠ User Account**
- Roles are **scoped permission templates** (ADR-RBAC-001)
- Role templates are **live** (ADR-RBAC-002) — changing a template updates all assignments
- Assigning a role grants **all permissions on that template within scope** by default
- Exceptions via **permission overrides** (grant/deny)
- Role assignments support optional **start/end dates** and active/inactive (ADR-RBAC-003)
- Default deny; audit permission and status changes
- UI is permission-based; **Security Rules must enforce the same permissions** (hiding buttons is not security)

### Follow-Up Leader / Assistant / Minister defaults

- **Follow-Up Leader**: full Follow-Up management permissions by default (can remove via overrides)
- **Follow-Up Assistant Leader**: **no** management permissions by default (add explicitly)
- **Follow-Up Minister**: assigned-newcomer operations (weekly report, attendance, bio, recommend membership) — not team-wide management

See `docs/modules/follow-up-permission-catalog.md`.

---

## MVP scope (implement in this order)

### Phase A — Platform foundation

1. Vite React TypeScript app
2. Firebase Auth email/password
3. Firestore wiring for org + people + userAccounts + RBAC collections
4. Auth session → load Person + resolve effective permissions for active organization/scope
5. Admin ability to manage role templates, assign roles (with scope + dates), and overrides
6. Audit log writes for permission/status-changing actions

### Phase B — Follow-Up module

1. Public newcomer registration (no account required)
2. Duplicate review (no auto-merge)
3. Newcomer journey + unassigned queue
4. Assignment (primary/secondary; warn if already assigned; keep history)
5. First-contact task + weekly contact responsibility
6. Weekly report (predefined/dynamic form; Friday due / Sat+ late; 7-day edit window default)
7. **Attendance separate from report**: Saturday program via ministry calendar; statuses `attended` | `did_not_attend` | `unknown`; unique `personId + calendarEventId`
8. Newcomer profile dashboard: history, add report, add attendance, add bio
9. Leader dashboards driven by permissions
10. Membership recommendation + configurable approval path (at least Minister → Leader → Core Team as configurable template)
11. Journey pause / unable_to_contact / inactive / close / reopen per workflow doc

Follow exact workflows in `docs/modules/follow-up-workflows-and-state-transitions.md`.  
Follow exact collections/fields in `docs/modules/follow-up-firestore-data-model.md`.

---

## Non-negotiable Follow-Up rules

- Weekly **report** and **attendance** are different records
- One organization calendar; Saturday **6:30 PM–9:30 PM** program
- Attendance: assigned Follow-Up member selects status for that Saturday event only
- Attendance is a readiness factor, **never the only factor** for Member
- Do not auto-promote to Member by time alone
- Soft delete / history for reports, bio, corrections
- Public registration must not expose internal/admin fields

---

## Configuration (Admin, not hardcoded forever)

Implement as organization/Follow-Up settings with these **defaults from the design**:

| Setting | Default |
| --- | --- |
| Weekly report due | Friday (timezone configurable); Sat+ = late |
| Report edit window | 7 days |
| First contact deadline | 48 hours (configurable) |
| Auto welcome message | On |
| Primary reporter | Primary assignee only (secondary may add notes) |
| Membership approval chain | Configurable workflow template |
| Attendance tracking | On (Saturday calendar model) |

---

## Explicitly out of scope for first coding milestone

- Full denomination / parent-org product
- SMS/WhatsApp providers
- Other ministry modules (Bible Study, G5, Worship, etc.) beyond hooks/placeholders
- Redesigning RBAC or Follow-Up process “improvements” not in the docs

**In scope (not deferred):** Web app **and** Mobile app. Ministers must be able to do core Follow-Up ops (assigned newcomers, weekly report, Saturday attendance, bio) on mobile; admin/config may be web-primary but must not be web-only forever.

### Mobile binaries (how APK / IPA are made)

- **Stack:** Expo (React Native) + EAS Build — **React only; not Flutter**  
  - `eas build --platform android` → `.apk` (testing) and/or `.aab` (Play Store)  
  - `eas build --platform ios` → `.ipa` (TestFlight / App Store)  
- Requires Apple Developer Program + Google Play Console + signing setup  
- See handbook `docs/handbook/Chapter_13_Data_and_Engineering_Standards.md` §13.8.1  

---

## Engineering standards

- TypeScript strict on web and mobile (Expo / React Native)
- Clear folder split: `engines/` (shared) vs `modules/follow-up/` (business); shared contracts usable by web + mobile
- No business rules only in one client — mirror in Firestore rules / trusted backend
- Prefer extending engines over duplicating logic inside Follow-Up
- Seed starter role templates + Head Leader / Super Admin bootstrap documented in README
- Commit in small logical steps; keep secrets out of git if new; reuse existing Firebase project config if already in repo history/branches

### Firebase project

If present in repo history/other branches: project id `ieec-ya-connect`.  
Confirm with the human before overwriting production data.

---

## Definition of done (first shippable slice)

- [ ] User can sign in and get permission-resolved session (**web and mobile**)
- [ ] Admin can manage roles/assignments/overrides (web-primary OK for v1 admin screens)
- [ ] Public registration creates Person + journey (with duplicate review path) — web and/or mobile intake
- [ ] Leader/assistant (with permission) can assign newcomers
- [ ] Minister can submit weekly report and Saturday attendance separately **on mobile and web**
- [ ] Newcomer profile shows history / report / attendance / bio entry points on both clients
- [ ] Security rules block unauthorized reads/writes for every client
- [ ] Audit entries exist for assignment, status, permission, and membership actions
- [ ] README explains setup, seed, and how to run web + mobile locally

---

## How to start

1. Read all docs listed above end-to-end  
2. Propose a short implementation plan matching Phase A → B (no architecture redesign)  
3. Wait for human approval of that plan  
4. Implement Phase A, then Phase B  
5. Do not invent new workflows or collections that contradict the docs  

If something is missing from the docs, **ask the human** — do not silently invent product policy.
