import { Permissions, type PermissionKey } from '@ieec/shared';

export type TeamModuleKey = 'follow_up' | 'bible_study' | 'media' | 'worship' | 'generic' | string;

export interface MenuItem {
  to: string;
  label: string;
  /** If set, require at least one of these permissions (union). */
  anyOf?: PermissionKey[];
  end?: boolean;
}

/** CMS module menus keyed by team.moduleKey — shared org tools stay outside this map. */
export const TEAM_MODULE_MENUS: Record<string, MenuItem[]> = {
  follow_up: [
    { to: '/app', label: 'Team home', end: true },
    { to: '/app/assigned', label: 'Assigned' },
    {
      to: '/app/queue',
      label: 'Queue',
      anyOf: [Permissions.newcomersViewUnassigned, Permissions.newcomersViewAll],
    },
    { to: '/app/notes-tasks', label: 'Notes & tasks' },
  ],
  bible_study: [
    { to: '/app', label: 'Team home', end: true },
    { to: '/app/modules/bible-study', label: 'Groups & classes' },
  ],
  media: [
    { to: '/app', label: 'Team home', end: true },
    { to: '/app/modules/media', label: 'Media desk' },
  ],
  worship: [
    { to: '/app', label: 'Team home', end: true },
    { to: '/app/modules/worship', label: 'Worship planning' },
  ],
  generic: [
    { to: '/app', label: 'Team home', end: true },
  ],
};

export const SHARED_MENUS: MenuItem[] = [
  { to: '/app/calendar', label: 'Calendar' },
  { to: '/app/chat', label: 'Chat' },
  { to: '/app/notifications', label: 'Notifications' },
];

export const ADMIN_MENUS: MenuItem[] = [
  { to: '/app/admin/roles', label: 'RBAC', anyOf: [Permissions.rolesManage] },
];
