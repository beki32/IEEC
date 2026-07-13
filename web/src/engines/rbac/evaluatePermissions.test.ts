import { evaluatePermissions, hasPermission } from './evaluatePermissions';
import type { PermissionOverride, RoleAssignment, RoleTemplate } from '../../shared/types/domain';

const roles: RoleTemplate[] = [
  {
    id: 'role_follow_up_leader',
    organizationId: 'org_ieec_ya',
    key: 'follow_up_leader',
    name: 'Follow-Up Leader',
    permissions: ['follow_up.view', 'follow_up.assign', 'follow_up.report.review'],
  },
];

const assignments: RoleAssignment[] = [
  {
    id: 'asg1',
    organizationId: 'org_ieec_ya',
    personId: 'person_1',
    roleId: 'role_follow_up_leader',
    scopeType: 'team',
    scopeId: 'team_follow_up',
    isActive: true,
  },
];

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const base = evaluatePermissions({ roleTemplates: roles, assignments, overrides: [] });
assert(base.includes('follow_up.view'), 'role permissions should apply');
assert(base.includes('follow_up.assign'), 'role permissions should apply');

const withGrant: PermissionOverride[] = [
  {
    id: 'ov1',
    organizationId: 'org_ieec_ya',
    personId: 'person_1',
    permission: 'follow_up.sensitive.view',
    effect: 'grant',
    scopeType: 'team',
    scopeId: 'team_follow_up',
    isActive: true,
  },
];
const granted = evaluatePermissions({
  roleTemplates: roles,
  assignments,
  overrides: withGrant,
});
assert(granted.includes('follow_up.sensitive.view'), 'grant override should add permission');

const withDeny: PermissionOverride[] = [
  ...withGrant,
  {
    id: 'ov2',
    organizationId: 'org_ieec_ya',
    personId: 'person_1',
    permission: 'follow_up.assign',
    effect: 'deny',
    scopeType: 'team',
    scopeId: 'team_follow_up',
    isActive: true,
  },
];
const denied = evaluatePermissions({
  roleTemplates: roles,
  assignments,
  overrides: withDeny,
});
assert(!denied.includes('follow_up.assign'), 'deny override should win');

const expiredAssignments: RoleAssignment[] = [
  {
    ...assignments[0],
    endAt: '2020-01-01T00:00:00.000Z',
  },
];
const expired = evaluatePermissions({
  roleTemplates: roles,
  assignments: expiredAssignments,
  overrides: [],
});
assert(expired.length === 0, 'expired assignments should not grant permissions');

assert(hasPermission(denied, 'follow_up.view'), 'hasPermission should see remaining grants');
assert(hasPermission([], 'follow_up.view', 'super_admin'), 'system admins bypass checks');

console.log('evaluatePermissions tests passed');
