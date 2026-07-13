# Follow-Up Module Requirements

**Status:** Requirements draft (Step 3)  
**Purpose:** First complete ministry module; establishes reusable patterns for other teams.

## 3.1 Purpose

Manage the relationship between IEEC YA and newcomers from registration until membership transition.

Goals: contact every newcomer, assign clear responsibility, record activity, surface needs, prevent forgotten people, support newcomer→member transition, give leadership visibility.

## Team structure

- **Team Leader** — view all, assign/reassign, manage membership requests, CRUD follow-up records, overdue review, recommend/approve status changes, reports, optional rule config, team announcements
- **Assistant Leader** — view all, assign/reassign, create/update records, overdue review, recommend transitions, limited notifications
- **Follow-Up Minister** — view assigned newcomers, limited contact info, add/update own entries, record needs/attendance/next steps, receive reminders, escalate

Sensitive deletes, cross-assignment access, and pastoral notes require separate permissions.

## Registration channels

Public web form, QR link, mobile app, internal form for authorized users. Public registration must not require an account. Form fields are configurable (required / optional / hidden / internal).

## Processing flow

1. Duplicate check (manual review, no auto-merge)
2. Create/update Person
3. Ministry status = Newcomer
4. Create newcomer journey
5. Notify Follow-Up leaders
6. Enter unassigned queue
7. Assign primary (optional secondary) minister
8. Notify assignee
9. Calculate first follow-up deadline
10. Audit all actions

## Core entities

`people`, `newcomerJourneys`, `followUpAssignments`, `followUpEntries`, `followUpTasks`, `membershipRecommendations`, `statusHistory`, `notifications`, `auditLogs`, `configurations`

Team membership and permissions stay in shared Organization / RBAC engines.

## Open decisions (from design session)

1. Final membership approver (configurable workflow preferred)
2. Multiple active ministers per newcomer?
3. History visibility for newly assigned ministers
4. Edit window for past follow-up entries
5. Minimum follow-up frequency
6. Ready-for-member criteria
7. Sensitive/pastoral field classification
8. Automatic welcome messages
9. Attendance tracking during follow-up
10. Multiple journeys if a person leaves and returns
