# ADR-003 — One Organization-Owned Person Record

## Decision

Every individual has one permanent Person record **per organization**. Modules reference that Person; they do not create parallel person stores.

## Consequences

- Person and User Account remain separate
- Newcomers can be registered without login accounts
- Cross-organization profiles are not auto-merged
