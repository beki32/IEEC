# Follow-Up Permission Catalog

**Source:** Link 2 — https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff  
**Status:** Planning draft  
**RBAC rules:** ADR-RBAC-001/002/003 — roles are scoped live templates; assignment grants **all** template permissions in scope; overrides for exceptions; optional start/end dates.

## Governing rules (approved in design)

1. **Permission-based UI and security** — dashboards/actions appear only with permission; Firestore rules enforce the same; hiding a button is not security.
2. **Follow-Up Leader** role template → **full Follow-Up management permissions by default** (can still remove individually via overrides).
3. **Follow-Up Assistant Leader** → **no management permissions by default**; grant individually via template customization or overrides.
4. Basic team access (own assignments, permitted chat) comes from **team membership / minister template**, not from the Assistant Leader title alone.
5. Scope example: Follow-Up Leader @ `IEEC → Young Adult → Follow-Up Team` does not grant Worship/Media leadership.

---

## Permission keys (Follow-Up + related)

### Newcomers / journeys

| Permission | Intent |
| --- | --- |
| `follow_up.view` | Base Follow-Up module access |
| `follow_up.newcomers.view_unassigned` | See unassigned queue |
| `follow_up.newcomers.view_all` | See all Follow-Up newcomers |
| `follow_up.journey.create` | Create journey |
| `follow_up.journey.mark_inactive` | Mark inactive |
| `follow_up.journey.close` | Close journey |
| `follow_up.journey.reopen` | Reopen journey |
| `follow_up.duplicate.review` | Resolve duplicate registrations |

### Assignments

| Permission | Intent |
| --- | --- |
| `follow_up.assignment.create` / `follow_up.assignments.create` | Assign newcomer |
| `follow_up.assignment.reassign` / `follow_up.assignments.reassign` | Reassign |
| `follow_up.assign` | Legacy/short form used in early notes — prefer `assignments.*` keys |

### Weekly reports

| Permission | Intent |
| --- | --- |
| `follow_up.report.submit` | Submit weekly report |
| `follow_up.report.edit_own` | Edit own report in window |
| `follow_up.report.edit_locked` / `follow_up.reports.edit_locked` | Edit/reopen locked reports |
| `follow_up.report.review` / `follow_up.reports.review` | Review / return / excuse |
| `follow_up.reports.view_all` | View all team reports |

### Attendance

| Permission | Intent |
| --- | --- |
| *(assigned work)* | Record attendance for own assigned newcomers (minister default) |
| `follow_up.attendance.view_all` | View all attendance |
| `follow_up.attendance.correct` | Correct attendance with history |

### Bio

| Permission | Intent |
| --- | --- |
| `follow_up.bio.view` | View bio entries |
| `follow_up.bio.add` | Add bio entries |
| `follow_up.bio.view_sensitive` | View sensitive bio |

### Membership

| Permission | Intent |
| --- | --- |
| `follow_up.membership_review.start` | Start readiness review |
| `membership.recommendation.submit` | Submit recommendation |
| *(workflow step)* | Approve/reject per configurable approval workflow |

### Chat / welcome / calendar (Follow-Up related)

| Permission | Intent |
| --- | --- |
| `follow_up.chat.create` | Create Follow-Up chat |
| `follow_up.chat.manage` / `follow_up.chat.manage_members` | Manage chat membership |
| `follow_up.welcome_schedule.view` | View welcome schedule |
| `follow_up.welcome_schedule.create` | Create schedule entry |
| `follow_up.welcome_schedule.assign` | Assign welcomer |
| `follow_up.welcome_schedule.update` | Update schedule |
| `follow_up.welcome_schedule.cancel` | Cancel schedule |
| `calendar.event.create` | Create calendar event |
| `calendar.event.manage` | Manage events |
| `calendar.conflict.override` | Override calendar conflict |

### Workflow override

| Permission | Intent |
| --- | --- |
| `workflow.override` | Authorized workflow override (audited) |

Normalize singular/plural key variants into one canonical set before implementation (prefer plural resource segments: `assignments`, `reports`).

---

## Default role templates

### Follow-Up Leader (default = full management set)

Includes by default (within Follow-Up team scope):

- `follow_up.view`
- `follow_up.newcomers.view_unassigned`
- `follow_up.newcomers.view_all`
- `follow_up.duplicate.review`
- `follow_up.assignments.create`
- `follow_up.assignments.reassign`
- `follow_up.reports.view_all`
- `follow_up.reports.review`
- `follow_up.reports.edit_locked`
- `follow_up.attendance.view_all`
- `follow_up.attendance.correct`
- `follow_up.bio.view`
- `follow_up.bio.add`
- `follow_up.membership_review.start`
- `follow_up.chat.create`
- `follow_up.chat.manage_members`
- `follow_up.welcome_schedule.*` (view/create/assign/update/cancel)
- `calendar.event.create` / `calendar.event.manage` (as granted in design list)

Individual permissions may still be removed via overrides.

### Follow-Up Assistant Leader

**No management permissions by default.**  
Any of the Leader management permissions must be added explicitly to the Assistant template or via overrides.

### Follow-Up Minister / Team Member

Default operational set for assigned work:

- View **assigned** newcomers (limited contact fields)
- `follow_up.report.submit`
- `follow_up.report.edit_own`
- Record attendance for assigned newcomers
- `follow_up.bio.add` / `follow_up.bio.view` (non-sensitive; sensitive needs extra permission)
- `membership.recommendation.submit`
- Receive assignment/reminder notifications
- Escalate concerns

Does **not** by default: view all newcomers, assign/reassign, correct others’ attendance, edit locked reports, manage chat, start membership review for the whole team.

---

## Resolution order (design note)

Approximate evaluation (to finalize with Authorization Engine chapter):

```text
System restrictions
  → Explicit individual denial
  → Explicit individual grant
  → Oversight permissions
  → Organizational-position permissions
  → Team-role permissions (live templates)
  → Basic membership permissions
  → Default deny
```

Backend (Security Rules / trusted functions) checks **resolved permissions**, not role title alone.
