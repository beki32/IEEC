/** Canonical Follow-Up + platform permission keys (plural resources). */

export const Permissions = {
  followUpView: 'follow_up.view',
  newcomersViewUnassigned: 'follow_up.newcomers.view_unassigned',
  newcomersViewAll: 'follow_up.newcomers.view_all',
  journeyCreate: 'follow_up.journey.create',
  journeyMarkInactive: 'follow_up.journey.mark_inactive',
  journeyClose: 'follow_up.journey.close',
  journeyReopen: 'follow_up.journey.reopen',
  duplicateReview: 'follow_up.duplicate.review',
  assignmentsCreate: 'follow_up.assignments.create',
  assignmentsReassign: 'follow_up.assignments.reassign',
  reportsSubmit: 'follow_up.reports.submit',
  reportsEditOwn: 'follow_up.reports.edit_own',
  reportsEditLocked: 'follow_up.reports.edit_locked',
  reportsReview: 'follow_up.reports.review',
  reportsViewAll: 'follow_up.reports.view_all',
  attendanceRecordAssigned: 'follow_up.attendance.record_assigned',
  attendanceViewAll: 'follow_up.attendance.view_all',
  attendanceCorrect: 'follow_up.attendance.correct',
  bioView: 'follow_up.bio.view',
  bioAdd: 'follow_up.bio.add',
  bioViewSensitive: 'follow_up.bio.view_sensitive',
  membershipReviewStart: 'follow_up.membership_review.start',
  membershipRecommendationsSubmit: 'membership.recommendations.submit',
  chatCreate: 'follow_up.chat.create',
  chatManageMembers: 'follow_up.chat.manage_members',
  welcomeScheduleView: 'follow_up.welcome_schedule.view',
  welcomeScheduleCreate: 'follow_up.welcome_schedule.create',
  welcomeScheduleAssign: 'follow_up.welcome_schedule.assign',
  welcomeScheduleUpdate: 'follow_up.welcome_schedule.update',
  welcomeScheduleCancel: 'follow_up.welcome_schedule.cancel',
  calendarEventCreate: 'calendar.event.create',
  calendarEventManage: 'calendar.event.manage',
  calendarConflictOverride: 'calendar.conflict.override',
  workflowOverride: 'workflow.override',
  rolesManage: 'admin.roles.manage',
  peopleManage: 'admin.people.manage',
  auditView: 'audit.view',
} as const;

export type PermissionKey = (typeof Permissions)[keyof typeof Permissions] | string;

export const FOLLOW_UP_LEADER_PERMISSIONS: PermissionKey[] = [
  Permissions.followUpView,
  Permissions.newcomersViewUnassigned,
  Permissions.newcomersViewAll,
  Permissions.duplicateReview,
  Permissions.assignmentsCreate,
  Permissions.assignmentsReassign,
  Permissions.reportsViewAll,
  Permissions.reportsReview,
  Permissions.reportsEditLocked,
  Permissions.attendanceViewAll,
  Permissions.attendanceCorrect,
  Permissions.bioView,
  Permissions.bioAdd,
  Permissions.membershipReviewStart,
  Permissions.chatCreate,
  Permissions.chatManageMembers,
  Permissions.welcomeScheduleView,
  Permissions.welcomeScheduleCreate,
  Permissions.welcomeScheduleAssign,
  Permissions.welcomeScheduleUpdate,
  Permissions.welcomeScheduleCancel,
  Permissions.calendarEventCreate,
  Permissions.calendarEventManage,
  Permissions.journeyCreate,
  Permissions.journeyMarkInactive,
  Permissions.journeyClose,
  Permissions.journeyReopen,
];

/** Assistant Leader: no management permissions by default. */
export const FOLLOW_UP_ASSISTANT_PERMISSIONS: PermissionKey[] = [
  Permissions.followUpView,
];

export const FOLLOW_UP_MINISTER_PERMISSIONS: PermissionKey[] = [
  Permissions.followUpView,
  Permissions.reportsSubmit,
  Permissions.reportsEditOwn,
  Permissions.attendanceRecordAssigned,
  Permissions.bioView,
  Permissions.bioAdd,
  Permissions.membershipRecommendationsSubmit,
];

export const HEAD_LEADER_PERMISSIONS: PermissionKey[] = [
  ...FOLLOW_UP_LEADER_PERMISSIONS,
  Permissions.rolesManage,
  Permissions.peopleManage,
  Permissions.auditView,
  Permissions.workflowOverride,
  Permissions.calendarConflictOverride,
];
