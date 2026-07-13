export type SystemRole = 'super_admin' | 'system_admin' | 'support_admin' | 'standard_user';

export type MinistryStatus = 'newcomer' | 'member' | 'minister';

export type PermissionScope =
  | 'platform'
  | 'parent_organization'
  | 'organization'
  | 'ministry'
  | 'team'
  | 'group'
  | 'specific_record';

export type FollowUpPermission =
  | 'people.view'
  | 'people.manage'
  | 'rbac.roles.manage'
  | 'rbac.assignments.manage'
  | 'rbac.overrides.manage'
  | 'follow_up.view'
  | 'follow_up.assign'
  | 'follow_up.entry.create'
  | 'follow_up.entry.update_own'
  | 'follow_up.report.review'
  | 'follow_up.sensitive.view'
  | 'follow_up.membership.recommend'
  | 'follow_up.membership.approve'
  | 'audit.view';

export type Permission = FollowUpPermission | (string & {});

export interface Organization {
  id: string;
  name: string;
  parentOrganizationId?: string | null;
  type: 'platform' | 'parent_organization' | 'organization';
  isActive: boolean;
}

export interface Person {
  id: string;
  organizationId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  ministryStatus: MinistryStatus;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  personId?: string;
  activeOrganizationId?: string;
  systemRole: SystemRole;
  /** Cached effective permissions for the active organization (ADR-RBAC live templates + overrides). */
  effectivePermissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleTemplate {
  id: string;
  organizationId: string;
  key: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isDeleted?: boolean;
}

export interface RoleAssignment {
  id: string;
  organizationId: string;
  personId: string;
  roleId: string;
  scopeType: PermissionScope;
  scopeId: string;
  startAt?: string | null;
  endAt?: string | null;
  isActive: boolean;
}

export interface PermissionOverride {
  id: string;
  organizationId: string;
  personId: string;
  permission: Permission;
  effect: 'grant' | 'deny';
  scopeType: PermissionScope;
  scopeId: string;
  reason?: string;
  isActive: boolean;
}

export type NewcomerJourneyStatus =
  | 'newly_registered'
  | 'awaiting_assignment'
  | 'assigned'
  | 'contact_initiated'
  | 'actively_participating'
  | 'inconsistent_participation'
  | 'unable_to_contact'
  | 'temporarily_inactive'
  | 'ready_for_membership_review'
  | 'transitioned_to_member'
  | 'declined_continued_follow_up'
  | 'moved_to_another_ministry'
  | 'archived';

export interface NewcomerJourney {
  id: string;
  organizationId: string;
  personId: string;
  status: NewcomerJourneyStatus;
  firstFollowUpDueAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export type AssignmentStatus =
  | 'pending'
  | 'active'
  | 'temporarily_paused'
  | 'reassigned'
  | 'completed'
  | 'cancelled';

export interface FollowUpAssignment {
  id: string;
  organizationId: string;
  journeyId: string;
  personId: string;
  assignedMinisterPersonId: string;
  secondaryMinisterPersonId?: string | null;
  supervisingLeaderPersonId?: string | null;
  status: AssignmentStatus;
  reason?: string;
  startedAt: string;
  endedAt?: string | null;
}

export type ContactMethod =
  | 'phone_call'
  | 'text_message'
  | 'whatsapp'
  | 'email'
  | 'in_person'
  | 'video_call'
  | 'social_media'
  | 'other';

export type ContactOutcome =
  | 'reached'
  | 'no_answer'
  | 'left_message'
  | 'wrong_contact_information'
  | 'asked_to_be_contacted_later'
  | 'not_interested'
  | 'attended_ministry_program'
  | 'needs_pastoral_attention'
  | 'follow_up_completed'
  | 'other';

export type EntryVisibility =
  | 'assigned_minister_only'
  | 'follow_up_leadership'
  | 'selected_ministry_leaders'
  | 'pastoral_or_head_leader'
  | 'general_follow_up_history';

export interface FollowUpEntry {
  id: string;
  organizationId: string;
  journeyId: string;
  personId: string;
  assignedMinisterPersonId?: string;
  contactAt: string;
  contactMethod: ContactMethod;
  contactOutcome: ContactOutcome;
  summary: string;
  prayerRequest?: string;
  identifiedNeed?: string;
  nextAction?: string;
  nextFollowUpAt?: string | null;
  escalationRequired?: boolean;
  visibility: EntryVisibility;
  createdByPersonId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface AuditLog {
  id?: string;
  organizationId: string;
  actorUid: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
