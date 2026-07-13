import type {
  Permission,
  PermissionOverride,
  RoleAssignment,
  RoleTemplate,
} from '../../shared/types/domain';

function isAssignmentEffective(assignment: RoleAssignment, now = new Date()): boolean {
  if (!assignment.isActive) return false;
  if (assignment.startAt && new Date(assignment.startAt) > now) return false;
  if (assignment.endAt && new Date(assignment.endAt) < now) return false;
  return true;
}

/**
 * ADR-RBAC-001/002/003: live role templates + time-bound assignments + overrides.
 * Deny overrides always win.
 */
export function evaluatePermissions(input: {
  roleTemplates: RoleTemplate[];
  assignments: RoleAssignment[];
  overrides: PermissionOverride[];
  now?: Date;
}): Permission[] {
  const { roleTemplates, assignments, overrides, now = new Date() } = input;
  const rolesById = new Map(roleTemplates.map((role) => [role.id, role]));
  const granted = new Set<Permission>();

  for (const assignment of assignments) {
    if (!isAssignmentEffective(assignment, now)) continue;
    const role = rolesById.get(assignment.roleId);
    if (!role || role.isDeleted) continue;
    for (const permission of role.permissions) {
      granted.add(permission);
    }
  }

  for (const override of overrides) {
    if (!override.isActive) continue;
    if (override.effect === 'grant') granted.add(override.permission);
  }

  for (const override of overrides) {
    if (!override.isActive) continue;
    if (override.effect === 'deny') granted.delete(override.permission);
  }

  return [...granted].sort();
}

export function hasPermission(
  effectivePermissions: Permission[] | undefined,
  permission: Permission,
  systemRole?: string,
): boolean {
  if (systemRole === 'super_admin' || systemRole === 'system_admin') return true;
  return Boolean(effectivePermissions?.includes(permission));
}
