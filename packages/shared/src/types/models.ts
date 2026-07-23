export type MinistryStatus = 'newcomer' | 'member' | 'minister' | string;
export type RecordStatus = 'active' | 'inactive' | 'archived' | string;
export type AccountStatus = 'invited' | 'pending_activation' | 'active' | 'disabled' | 'revoked' | string;
export type AttendanceStatus = 'attended' | 'did_not_attend' | 'unknown';

export type ScopeType =
  | 'platform'
  | 'parent_organization'
  | 'organization'
  | 'ministry'
  | 'team'
  | 'group'
  | 'specific_record';

export interface Organization {
  id: string;
  name: string;
  timezone: string;
  status: 'draft' | 'active' | 'suspended' | 'archived';
}

export interface Person {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  normalizedFirstName: string;
  normalizedLastName: string;
  sex: string;
  phone: { display: string; normalized: string };
  email: { address: string; normalized: string; verified: boolean };
  contactPreference: {
    method: 'call' | 'text' | string;
    preferredTime: string | null;
    customTimeNote: string | null;
  };
  photoFileId: string | null;
  currentMinistryStatus: MinistryStatus;
  recordStatus: RecordStatus;
  hasUserAccount: boolean;
  activeJourneyId: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UserAccount {
  id: string; // authUid
  organizationId: string;
  personId: string;
  email: string;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  invitationStatus: string;
  invitedAt: string | null;
  activatedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  permissions: string[];
  recordStatus: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RoleAssignment {
  id: string;
  organizationId: string;
  personId: string;
  roleTemplateId: string;
  scopeType: ScopeType;
  ministryId: string | null;
  teamId: string | null;
  groupId: string | null;
  startAt: string | null;
  endAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionOverride {
  id: string;
  organizationId: string;
  personId: string;
  permission: string;
  effect: 'grant' | 'deny';
  scopeType: ScopeType;
  ministryId: string | null;
  teamId: string | null;
  reason: string;
  startAt: string | null;
  endAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface NewcomerJourney {
  id: string;
  organizationId: string;
  personId: string;
  registrationDate: string;
  registrationSource: string;
  journeyStatus: string;
  membershipReadinessStatus: string;
  previousJourneyId: string | null;
  isCurrentJourney: boolean;
  welcomeMessageStatus: string | null;
  startedAt: string;
  completedAt: string | null;
  closureReason: string | null;
  /** Last required reason for inactive/close (and similar gated transitions) */
  lastStatusReason?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface FollowUpAssignment {
  id: string;
  organizationId: string;
  journeyId: string;
  newcomerPersonId: string;
  assignedPersonId: string;
  assignmentType: 'primary' | 'secondary' | 'supporting' | 'temporary';
  assignmentStatus: 'pending' | 'active' | 'paused' | 'reassignment_requested' | 'ended' | 'cancelled';
  reportingRequired: boolean;
  startDate: string;
  endDate: string | null;
  assignedByPersonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpReport {
  id: string;
  organizationId: string;
  journeyId: string;
  newcomerPersonId: string;
  assignmentId: string;
  reportingWeekStart: string;
  reportingWeekEnd: string;
  dueAt: string;
  contactMade: boolean;
  expectedToAttend: 'yes' | 'no' | 'maybe' | 'unknown';
  formDefinitionId: string;
  formVersion: number;
  dynamicResponses: Record<string, unknown>;
  reportStatus: string;
  submittedByPersonId: string | null;
  submittedAt: string | null;
  originalSubmittedAt: string | null;
  editableUntil: string | null;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewcomerAttendance {
  id: string;
  organizationId: string;
  personId: string;
  journeyId: string;
  assignmentId: string | null;
  calendarEventId: string;
  programDate: string;
  attendanceStatus: AttendanceStatus;
  recordedByPersonId: string;
  recordedAt: string;
  updatedAt: string;
  updatedByPersonId: string;
}

export interface NewcomerBioEntry {
  id: string;
  organizationId: string;
  personId: string;
  journeyId: string;
  categoryId: string;
  content: string;
  sensitivityLevel: 'standard' | string;
  visibilityPolicyId: string;
  recordStatus: RecordStatus;
  addedByPersonId: string;
  createdAt: string;
  updatedAt: string;
  updatedByPersonId: string;
  deletedAt: string | null;
  deletedByPersonId: string | null;
}

export interface CalendarEvent {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  organizingTeamId: string | null;
  eventScope: string;
  eventPriority: string;
  conflictPolicy: string;
  startAt: string;
  endAt: string;
  timezone: string;
  recurrence: {
    enabled: boolean;
    frequency: string;
    daysOfWeek: string[];
  };
  parentRecurringEventId: string | null;
  eventStatus: string;
  createdByPersonId: string;
  createdAt: string;
  updatedAt: string;
}

/** Chat membership is independent of team membership (ADR-004). */
export interface ChatChannel {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  channelType: 'team_operational' | 'case' | 'cross_team' | 'parent_coordination' | string;
  relatedTeamId: string | null;
  channelStatus: 'active' | 'archived' | string;
  createdByPersonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMembership {
  id: string;
  organizationId: string;
  channelId: string;
  personId: string;
  membershipRole: 'member' | 'moderator' | string;
  membershipStatus: 'active' | 'removed' | string;
  addedByPersonId: string;
  createdAt: string;
  updatedAt: string;
  removedAt: string | null;
  removedByPersonId: string | null;
}

export interface ChatMessage {
  id: string;
  organizationId: string;
  channelId: string;
  senderPersonId: string;
  body: string;
  messageStatus: 'active' | 'deleted' | string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedByPersonId: string | null;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  actorPersonId: string | null;
  actorAuthUid: string | null;
  actorType: 'user' | 'system' | 'automation';
  action: string;
  entityType: string;
  entityId: string;
  moduleKey: string | null;
  previousValue: unknown | null;
  newValue: unknown | null;
  reason: string | null;
  permissionKeys: string[] | null;
  correlationId: string | null;
  createdAt: string;
}

export interface FollowUpConfig {
  reportDueDay: string;
  reportLateFrom: string;
  timezone: string;
  reportEditWindowDays: number;
  firstContactDeadlineHours: number;
  welcomeMessageEnabled: boolean;
  primaryReportsOnly: boolean;
  attendanceEnabled: boolean;
}

export const DEFAULT_FOLLOW_UP_CONFIG: FollowUpConfig = {
  reportDueDay: 'Friday',
  reportLateFrom: 'Saturday',
  timezone: 'America/New_York',
  reportEditWindowDays: 7,
  firstContactDeadlineHours: 48,
  welcomeMessageEnabled: true,
  primaryReportsOnly: true,
  attendanceEnabled: true,
};
