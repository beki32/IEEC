import type { PermissionOverride, RoleAssignment, RoleTemplate } from '../types/models';
import type { PermissionKey } from '../permissions/catalog';

export interface PermissionResolutionInput {
  personId: string;
  organizationId: string;
  now?: Date;
  roleTemplates: RoleTemplate[];
  roleAssignments: RoleAssignment[];
  overrides: PermissionOverride[];
  membershipPermissions?: PermissionKey[];
}

export interface PermissionResolutionResult {
  permissions: Set<PermissionKey>;
  denied: Set<PermissionKey>;
  sources: Array<{ permission: PermissionKey; source: string }>;
}

function isEffective(
  startAt: string | null,
  endAt: string | null,
  active: boolean,
  now: Date,
): boolean {
  if (!active) return false;
  if (startAt && new Date(startAt) > now) return false;
  if (endAt && new Date(endAt) < now) return false;
  return true;
}

export function resolvePermissions(input: PermissionResolutionInput): PermissionResolutionResult {
  const now = input.now ?? new Date();
  const granted = new Set<PermissionKey>();
  const denied = new Set<PermissionKey>();
  const sources: Array<{ permission: PermissionKey; source: string }> = [];
  const templatesById = new Map(input.roleTemplates.map((t) => [t.id, t]));

  for (const assignment of input.roleAssignments) {
    if (assignment.personId !== input.personId) continue;
    if (assignment.organizationId !== input.organizationId) continue;
    if (!isEffective(assignment.startAt, assignment.endAt, assignment.active, now)) continue;
    const template = templatesById.get(assignment.roleTemplateId);
    if (!template || template.recordStatus === 'archived') continue;
    for (const permission of template.permissions) {
      granted.add(permission);
      sources.push({ permission, source: `role:${template.name}@${assignment.scopeType}` });
    }
  }

  for (const permission of input.membershipPermissions ?? []) {
    granted.add(permission);
    sources.push({ permission, source: 'membership' });
  }

  for (const override of input.overrides) {
    if (override.personId !== input.personId) continue;
    if (override.organizationId !== input.organizationId) continue;
    if (!isEffective(override.startAt, override.endAt, override.active, now)) continue;
    if (override.effect === 'deny') {
      denied.add(override.permission);
      sources.push({ permission: override.permission, source: 'override:deny' });
    } else {
      granted.add(override.permission);
      sources.push({ permission: override.permission, source: 'override:grant' });
    }
  }

  for (const permission of denied) granted.delete(permission);
  return { permissions: granted, denied, sources };
}

export function can(
  resolved: PermissionResolutionResult | Set<PermissionKey>,
  permission: PermissionKey,
): boolean {
  const set = resolved instanceof Set ? resolved : resolved.permissions;
  return set.has(permission);
}
