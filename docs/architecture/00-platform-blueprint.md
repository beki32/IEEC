# IEEC YA Connect Platform Blueprint

**Status:** Draft v0.2  
**Canonical source:** [IEEC YA Connect Design](https://chatgpt.com/share/6a54dabb-eca4-83ea-b88e-fdae1dd5d0ff)  
See also [`../SOURCE_OF_TRUTH.md`](../SOURCE_OF_TRUTH.md).

## Vision (Step 1 — Approved)

Centralized ministry management platform that manages people and ministry operations, shepherding people from newcomer to ministry leadership, with a long-term denomination-wide path.

## People & Access (Step 2 — Approved)

Separated concepts:

- **Ministry Status:** Newcomer, Member, Minister
- **System Roles:** Super Admin, System Admin, Support Admin
- **Organizational Positions:** Head Leader, Core Team
- **Team Roles:** Team Leader, Assistant Leader, Minister
- **Oversight Assignments:** Independent of team membership; can oversee selected teams
- **Permission Model:** Roles provide defaults; individual overrides add/remove; dynamic; default deny; audit all permission changes
- **Volunteer:** Temporary assignment; not a ministry status; optional time-based assignment

Architecture principles:

- People are the center of the system
- Everything is configurable
- Everything has history
- Soft delete by default
- Optional lifecycle/time control
- Separate technical authority from ministry authority
- Separate oversight from team membership
- Roles are templates
- Individual permission overrides
- Least-privilege security

## Core principle

Every feature is either an **Engine** (reusable platform capability) or a **Module** (business functionality). Modules must reuse engines instead of duplicating infrastructure.

## Ten core engines

1. **Organization** — platform, parent orgs, organizations, ministries, teams, groups  
2. **People** — person profiles, user accounts, ministry status, relationships  
3. **Authorization (RBAC)** — roles, permissions, overrides, scopes, policy evaluation  
4. **Workflow** — approvals, assignments, state transitions  
5. **Dynamic Form** — configurable registration and operational forms  
6. **Communication** — chat, announcements, push/email/SMS (future channels)  
7. **Calendar** — events, recurrence, conflicts, attendance linkage  
8. **Reporting** — shared dashboards and report generation  
9. **Audit** — immutable history of sensitive actions  
10. **Configuration** — statuses, dropdowns, workflows, notification policies  

## Modules (first wave)

Follow-Up (first complete module), Members, Ministers, Bible Study, G5, Worship, Media, Usher, Finance, Events, Chat, Reports, Settings.

## Technical architecture

- React + TypeScript web app
- Firebase Authentication
- Cloud Firestore
- Cloud Functions (planned for invites, workflow automation)
- Firebase Storage (planned)
- Security Rules enforcing scoped RBAC

## Organization hierarchy

```text
Platform
└── Parent Organization (optional oversight)
    └── Organization (church / branch)
        ├── Ministries (Young Adult, Youth, …)
        ├── Teams (Follow-Up, Media, …)
        ├── Groups (G5, Bible Study subgroups)
        ├── People / Users
        ├── Calendar / Chat / Reports
        └── Permissions
```

## Milestone roadmap

1. Architecture baseline + ADRs  
2. Core platform engines (Auth, People, RBAC, Audit, Config)  
3. Follow-Up module  
4. Remaining ministry modules  
