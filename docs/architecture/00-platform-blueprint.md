# IEEC YA Connect Platform Blueprint

**Status:** Draft v0.1  
**Sources:** ChatGPT system design shares (Master Blueprint + Follow-Up / RBAC design)

## Vision

Centralized ministry management platform that shepherds people from newcomer to ministry leadership, with a long-term path to denomination-wide use.

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

Follow-Up (first complete module), Members, Ministers, Bible Study, G5, Worship, Media, Finance, Events, Chat, Reports, Settings.

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
