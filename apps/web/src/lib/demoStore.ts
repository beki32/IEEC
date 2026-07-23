import {
  DEFAULT_FOLLOW_UP_CONFIG,
  FOLLOW_UP_ASSISTANT_PERMISSIONS,
  FOLLOW_UP_LEADER_PERMISSIONS,
  FOLLOW_UP_MINISTER_PERMISSIONS,
  HEAD_LEADER_PERMISSIONS,
  Permissions,
  normalizeEmail,
  normalizeName,
  normalizePhone,
  resolvePermissions,
  weekBounds,
  type AttendanceStatus,
  type AuditLog,
  type CalendarEvent,
  type ChatChannel,
  type ChatMembership,
  type ChatMessage,
  type FollowUpAssignment,
  type FollowUpReport,
  type NewcomerAttendance,
  type NewcomerBioEntry,
  type NewcomerJourney,
  type Organization,
  type Person,
  type PermissionOverride,
  type RoleAssignment,
  type RoleTemplate,
  type UserAccount,
} from '@ieec/shared';

const STORAGE_KEY = 'ieec-ya-connect-demo-v5';
export const DEMO_SEED_VERSION = 5;
const SEED_VERSION = DEMO_SEED_VERSION;

export interface DemoState {
  seedVersion: number;
  organization: Organization;
  people: Person[];
  userAccounts: UserAccount[];
  roleTemplates: RoleTemplate[];
  roleAssignments: RoleAssignment[];
  overrides: PermissionOverride[];
  journeys: NewcomerJourney[];
  assignments: FollowUpAssignment[];
  reports: FollowUpReport[];
  attendance: NewcomerAttendance[];
  bioEntries: NewcomerBioEntry[];
  calendarEvents: CalendarEvent[];
  chatChannels: ChatChannel[];
  chatMemberships: ChatMembership[];
  chatMessages: ChatMessage[];
  auditLogs: AuditLog[];
  sessionAuthUid: string | null;
}

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createSeed(): DemoState {
  const orgId = 'ieec_ya';
  const teamId = 'team_follow_up';
  const ministryId = 'ministry_ya';
  const ts = nowIso();

  const leaderPersonId = 'person_leader';
  const assistantPersonId = 'person_assistant';
  const ministerPersonId = 'person_minister';
  const newcomer1Id = 'person_newcomer_1';
  const newcomer2Id = 'person_newcomer_2';

  const roleLeader: RoleTemplate = {
    id: 'role_fu_leader',
    organizationId: orgId,
    name: 'Follow-Up Leader',
    description: 'Full Follow-Up management permissions',
    permissions: [...FOLLOW_UP_LEADER_PERMISSIONS, ...HEAD_LEADER_PERMISSIONS.filter((p) => !FOLLOW_UP_LEADER_PERMISSIONS.includes(p))],
    recordStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  };
  const roleAssistant: RoleTemplate = {
    id: 'role_fu_assistant',
    organizationId: orgId,
    name: 'Follow-Up Assistant Leader',
    description: 'No management permissions by default',
    permissions: [...FOLLOW_UP_ASSISTANT_PERMISSIONS],
    recordStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  };
  const roleMinister: RoleTemplate = {
    id: 'role_fu_minister',
    organizationId: orgId,
    name: 'Follow-Up Minister',
    description: 'Assigned-work operations',
    permissions: [...FOLLOW_UP_MINISTER_PERMISSIONS],
    recordStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  };

  const mkPerson = (
    pid: string,
    first: string,
    last: string,
    email: string,
    status: string,
    journeyId: string | null,
    hasAccount: boolean,
  ): Person => ({
    id: pid,
    organizationId: orgId,
    firstName: first,
    lastName: last,
    normalizedFirstName: normalizeName(first),
    normalizedLastName: normalizeName(last),
    sex: 'female',
    phone: { display: '202-555-0100', normalized: '2025550100' },
    email: { address: email, normalized: normalizeEmail(email), verified: true },
    contactPreference: { method: 'text', preferredTime: 'evening', customTimeNote: null },
    photoFileId: null,
    currentMinistryStatus: status,
    recordStatus: 'active',
    hasUserAccount: hasAccount,
    activeJourneyId: journeyId,
    createdAt: ts,
    createdBy: 'system',
    updatedAt: ts,
    updatedBy: 'system',
  });

  const journey1: NewcomerJourney = {
    id: 'journey_1',
    organizationId: orgId,
    personId: newcomer1Id,
    registrationDate: ts,
    registrationSource: 'public_web',
    journeyStatus: 'awaiting_assignment',
    membershipReadinessStatus: 'not_ready',
    previousJourneyId: null,
    isCurrentJourney: true,
    welcomeMessageStatus: 'sent',
    startedAt: ts,
    completedAt: null,
    closureReason: null,
    lastStatusReason: null,
    createdAt: ts,
    createdBy: 'system',
    updatedAt: ts,
    updatedBy: 'system',
  };

  const journey2: NewcomerJourney = {
    id: 'journey_2',
    organizationId: orgId,
    personId: newcomer2Id,
    registrationDate: ts,
    registrationSource: 'public_web',
    journeyStatus: 'active_follow_up',
    membershipReadinessStatus: 'not_ready',
    previousJourneyId: null,
    isCurrentJourney: true,
    welcomeMessageStatus: 'sent',
    startedAt: ts,
    completedAt: null,
    closureReason: null,
    lastStatusReason: null,
    createdAt: ts,
    createdBy: 'system',
    updatedAt: ts,
    updatedBy: 'system',
  };

  const assignment2: FollowUpAssignment = {
    id: 'assign_2',
    organizationId: orgId,
    journeyId: journey2.id,
    newcomerPersonId: newcomer2Id,
    assignedPersonId: ministerPersonId,
    assignmentType: 'primary',
    assignmentStatus: 'active',
    reportingRequired: true,
    startDate: ts,
    endDate: null,
    assignedByPersonId: leaderPersonId,
    createdAt: ts,
    updatedAt: ts,
  };

  // Next Saturday 18:30–21:30
  const nextSat = new Date();
  nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7 || 7));
  nextSat.setHours(18, 30, 0, 0);
  const nextSatEnd = new Date(nextSat);
  nextSatEnd.setHours(21, 30, 0, 0);

  const saturdayEvent: CalendarEvent = {
    id: 'cal_sat_program',
    organizationId: orgId,
    title: 'IEEC YA Saturday Program',
    description: 'Weekly YA program 6:30 PM–9:30 PM',
    organizingTeamId: teamId,
    eventScope: 'organization',
    eventPriority: 'organization_reserved',
    conflictPolicy: 'hard_block',
    startAt: nextSat.toISOString(),
    endAt: nextSatEnd.toISOString(),
    timezone: 'America/New_York',
    recurrence: { enabled: true, frequency: 'weekly', daysOfWeek: ['saturday'] },
    parentRecurringEventId: null,
    eventStatus: 'scheduled',
    createdByPersonId: leaderPersonId,
    createdAt: ts,
    updatedAt: ts,
  };

  const welcomeEventStart = new Date(nextSat);
  welcomeEventStart.setHours(17, 30, 0, 0);
  const welcomeEventEnd = new Date(nextSat);
  welcomeEventEnd.setHours(18, 15, 0, 0);
  const welcomeEvent: CalendarEvent = {
    id: 'cal_welcome_window',
    organizationId: orgId,
    title: 'Newcomer Welcome Window',
    description: 'Greeters available before program',
    organizingTeamId: teamId,
    eventScope: 'team',
    eventPriority: 'normal',
    conflictPolicy: 'warning',
    startAt: welcomeEventStart.toISOString(),
    endAt: welcomeEventEnd.toISOString(),
    timezone: 'America/New_York',
    recurrence: { enabled: false, frequency: 'none', daysOfWeek: [] },
    parentRecurringEventId: null,
    eventStatus: 'scheduled',
    createdByPersonId: leaderPersonId,
    createdAt: ts,
    updatedAt: ts,
  };

  const opsChannel: ChatChannel = {
    id: 'chat_fu_ops',
    organizationId: orgId,
    name: 'Follow-Up Ops',
    description: 'Team operational channel — membership is independent of team roles (ADR-004)',
    channelType: 'team_operational',
    relatedTeamId: teamId,
    channelStatus: 'active',
    createdByPersonId: leaderPersonId,
    createdAt: ts,
    updatedAt: ts,
  };

  const leadersOnlyChannel: ChatChannel = {
    id: 'chat_fu_leaders',
    organizationId: orgId,
    name: 'Follow-Up Leaders',
    description: 'Second channel on the same team — ministers are not auto-added',
    channelType: 'team_operational',
    relatedTeamId: teamId,
    channelStatus: 'active',
    createdByPersonId: leaderPersonId,
    createdAt: ts,
    updatedAt: ts,
  };

  const mkChatMember = (
    mid: string,
    channelId: string,
    personId: string,
    role: 'member' | 'moderator' = 'member',
  ): ChatMembership => ({
    id: mid,
    organizationId: orgId,
    channelId,
    personId,
    membershipRole: role,
    membershipStatus: 'active',
    addedByPersonId: leaderPersonId,
    createdAt: ts,
    updatedAt: ts,
    removedAt: null,
    removedByPersonId: null,
  });

  const seedMessages: ChatMessage[] = [
    {
      id: 'msg_welcome',
      organizationId: orgId,
      channelId: opsChannel.id,
      senderPersonId: leaderPersonId,
      body: 'Welcome to Follow-Up Ops. Chat membership ≠ team membership — guests here do not get queue access.',
      messageStatus: 'active',
      createdAt: ts,
      updatedAt: ts,
      deletedAt: null,
      deletedByPersonId: null,
    },
  ];

  const mkAccount = (uid: string, personId: string, email: string): UserAccount => ({
    id: uid,
    organizationId: orgId,
    personId,
    email,
    accountStatus: 'active',
    emailVerified: true,
    invitationStatus: 'accepted',
    invitedAt: ts,
    activatedAt: ts,
    lastLoginAt: ts,
    createdAt: ts,
    updatedAt: ts,
  });

  const mkAssignment = (
    aid: string,
    personId: string,
    roleId: string,
  ): RoleAssignment => ({
    id: aid,
    organizationId: orgId,
    personId,
    roleTemplateId: roleId,
    scopeType: 'team',
    ministryId,
    teamId,
    groupId: null,
    startAt: null,
    endAt: null,
    active: true,
    createdAt: ts,
    updatedAt: ts,
  });

  return {
    seedVersion: SEED_VERSION,
    organization: {
      id: orgId,
      name: 'IEEC YA',
      timezone: 'America/New_York',
      status: 'active',
    },
    people: [
      mkPerson(leaderPersonId, 'Sarah', 'Leader', 'leader@ieec.demo', 'minister', null, true),
      mkPerson(assistantPersonId, 'Abel', 'Assistant', 'assistant@ieec.demo', 'minister', null, true),
      mkPerson(ministerPersonId, 'Marta', 'Minister', 'minister@ieec.demo', 'minister', null, true),
      mkPerson(newcomer1Id, 'Daniel', 'Bekele', 'daniel@example.com', 'newcomer', journey1.id, false),
      mkPerson(newcomer2Id, 'Hanna', 'Tesfaye', 'hanna@example.com', 'newcomer', journey2.id, false),
    ],
    userAccounts: [
      mkAccount('uid_leader', leaderPersonId, 'leader@ieec.demo'),
      mkAccount('uid_assistant', assistantPersonId, 'assistant@ieec.demo'),
      mkAccount('uid_minister', ministerPersonId, 'minister@ieec.demo'),
    ],
    roleTemplates: [roleLeader, roleAssistant, roleMinister],
    roleAssignments: [
      mkAssignment('ra_leader', leaderPersonId, roleLeader.id),
      mkAssignment('ra_assistant', assistantPersonId, roleAssistant.id),
      mkAssignment('ra_minister', ministerPersonId, roleMinister.id),
    ],
    overrides: [],
    journeys: [journey1, journey2],
    assignments: [assignment2],
    reports: [],
    attendance: [],
    bioEntries: [],
    calendarEvents: [saturdayEvent, welcomeEvent],
    chatChannels: [opsChannel, leadersOnlyChannel],
    chatMemberships: [
      mkChatMember('cm_ops_leader', opsChannel.id, leaderPersonId, 'moderator'),
      mkChatMember('cm_ops_assistant', opsChannel.id, assistantPersonId),
      mkChatMember('cm_ops_minister', opsChannel.id, ministerPersonId),
      mkChatMember('cm_leaders_leader', leadersOnlyChannel.id, leaderPersonId, 'moderator'),
      mkChatMember('cm_leaders_assistant', leadersOnlyChannel.id, assistantPersonId),
    ],
    chatMessages: seedMessages,
    auditLogs: [],
    sessionAuthUid: null,
  };
}

function load(): DemoState {
  if (runtimeState) {
    return runtimeState;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed.seedVersion || parsed.seedVersion < SEED_VERSION) {
      const seed = createSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    const seed = createSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function save(state: DemoState) {
  if (runtimeState) {
    runtimeState = state;
    if (persistFirebase) {
      void import('./firebase').then(async ({ getFirestoreDb }) => {
        const db = getFirestoreDb();
        if (!db) return;
        const { persistDemoStateToFirestore } = await import('./firestoreSync');
        await persistDemoStateToFirestore(db, state);
      }).catch((err) => {
        console.warn('Firestore persist failed', err);
      });
    }
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** In-memory + optional Firestore write-through (Firebase / emulator mode). */
let runtimeState: DemoState | null = null;
let persistFirebase = false;

export function buildDemoSeed(): DemoState {
  return createSeed();
}

function audit(
  state: DemoState,
  action: string,
  entityType: string,
  entityId: string,
  actorPersonId: string | null,
  details?: { previousValue?: unknown; newValue?: unknown; reason?: string },
) {
  state.auditLogs.unshift({
    id: id('audit'),
    organizationId: state.organization.id,
    actorPersonId,
    actorAuthUid: state.sessionAuthUid,
    actorType: 'user',
    action,
    entityType,
    entityId,
    moduleKey: 'follow_up',
    previousValue: details?.previousValue ?? null,
    newValue: details?.newValue ?? null,
    reason: details?.reason ?? null,
    permissionKeys: null,
    correlationId: null,
    createdAt: nowIso(),
  });
}

export const demoStore = {
  reset() {
    runtimeState = null;
    persistFirebase = false;
    localStorage.removeItem('ieec-ya-connect-demo-v1');
    localStorage.removeItem('ieec-ya-connect-demo-v2');
    localStorage.removeItem('ieec-ya-connect-demo-v4');
    localStorage.removeItem(STORAGE_KEY);
    const seed = createSeed();
    save(seed);
    return seed;
  },

  /** Adopt Firestore-hydrated state for the signed-in Firebase session. */
  adoptFirebaseState(state: DemoState) {
    persistFirebase = true;
    runtimeState = state;
  },

  clearFirebaseRuntime() {
    runtimeState = null;
    persistFirebase = false;
  },

  isFirebaseRuntime() {
    return persistFirebase;
  },

  ensureLatestSeed() {
    // Migrates old demo keys and reseeds if needed
    if (runtimeState) return;
    const legacy =
      localStorage.getItem('ieec-ya-connect-demo-v1') ||
      localStorage.getItem('ieec-ya-connect-demo-v2') ||
      localStorage.getItem('ieec-ya-connect-demo-v4');
    if (legacy && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.removeItem('ieec-ya-connect-demo-v1');
      localStorage.removeItem('ieec-ya-connect-demo-v2');
      localStorage.removeItem('ieec-ya-connect-demo-v4');
    }
    load();
  },

  getState(): DemoState {
    return load();
  },

  login(email: string): { ok: true; authUid: string } | { ok: false; error: string } {
    const state = load();
    const account = state.userAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.accountStatus === 'active',
    );
    if (!account) return { ok: false, error: 'Unknown demo account. Use leader@ieec.demo, assistant@ieec.demo, or minister@ieec.demo' };
    state.sessionAuthUid = account.id;
    account.lastLoginAt = nowIso();
    save(state);
    return { ok: true, authUid: account.id };
  },

  logout() {
    const state = load();
    state.sessionAuthUid = null;
    save(state);
    if (persistFirebase) {
      this.clearFirebaseRuntime();
    }
  },

  getSession() {
    const state = load();
    if (!state.sessionAuthUid) return null;
    const account = state.userAccounts.find((a) => a.id === state.sessionAuthUid);
    if (!account) return null;
    const person = state.people.find((p) => p.id === account.personId);
    if (!person) return null;
    const resolved = resolvePermissions({
      personId: person.id,
      organizationId: state.organization.id,
      roleTemplates: state.roleTemplates,
      roleAssignments: state.roleAssignments,
      overrides: state.overrides,
    });
    return {
      account,
      person,
      organization: state.organization,
      permissions: resolved.permissions,
      config: DEFAULT_FOLLOW_UP_CONFIG,
    };
  },

  registerNewcomer(input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    sex: string;
    contactMethod: string;
  }) {
    const state = load();
    const nFirst = normalizeName(input.firstName);
    const nLast = normalizeName(input.lastName);
    const nEmail = normalizeEmail(input.email);
    const nPhone = normalizePhone(input.phone);

    const duplicates = state.people.filter(
      (p) =>
        p.organizationId === state.organization.id &&
        ((p.normalizedFirstName === nFirst && p.normalizedLastName === nLast) ||
          (nEmail && p.email.normalized === nEmail) ||
          (nPhone && p.phone.normalized === nPhone)),
    );

    const personId = id('person');
    const journeyId = id('journey');
    const ts = nowIso();
    const status = duplicates.length ? 'duplicate_review_required' : 'awaiting_assignment';

    const person: Person = {
      id: personId,
      organizationId: state.organization.id,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      normalizedFirstName: nFirst,
      normalizedLastName: nLast,
      sex: input.sex,
      phone: { display: input.phone, normalized: nPhone },
      email: { address: input.email, normalized: nEmail, verified: false },
      contactPreference: {
        method: input.contactMethod,
        preferredTime: null,
        customTimeNote: null,
      },
      photoFileId: null,
      currentMinistryStatus: 'newcomer',
      recordStatus: 'active',
      hasUserAccount: false,
      activeJourneyId: journeyId,
      createdAt: ts,
      createdBy: 'public',
      updatedAt: ts,
      updatedBy: 'public',
    };

    const journey: NewcomerJourney = {
      id: journeyId,
      organizationId: state.organization.id,
      personId,
      registrationDate: ts,
      registrationSource: 'public_web',
      journeyStatus: status,
      membershipReadinessStatus: 'not_ready',
      previousJourneyId: null,
      isCurrentJourney: true,
      welcomeMessageStatus: DEFAULT_FOLLOW_UP_CONFIG.welcomeMessageEnabled ? 'queued' : null,
      startedAt: ts,
      completedAt: null,
      closureReason: null,
    lastStatusReason: null,
      createdAt: ts,
      createdBy: 'public',
      updatedAt: ts,
      updatedBy: 'public',
    };

    state.people.push(person);
    state.journeys.push(journey);
    audit(state, 'registration.create', 'newcomerJourney', journeyId, null, {
      newValue: { personId, duplicateCandidates: duplicates.map((d) => d.id) },
    });
    save(state);
    return { person, journey, duplicateCandidateIds: duplicates.map((d) => d.id) };
  },

  resolveDuplicate(journeyId: string, action: 'create_new' | 'link_existing', existingPersonId?: string) {
    const state = load();
    const session = this.getSession();
    const journey = state.journeys.find((j) => j.id === journeyId);
    if (!journey) throw new Error('Journey not found');
    if (action === 'create_new') {
      journey.journeyStatus = 'awaiting_assignment';
    } else if (existingPersonId) {
      const person = state.people.find((p) => p.id === journey.personId);
      if (person) person.recordStatus = 'archived';
      journey.personId = existingPersonId;
      journey.journeyStatus = 'awaiting_assignment';
      const existing = state.people.find((p) => p.id === existingPersonId);
      if (existing) {
        existing.activeJourneyId = journey.id;
        existing.currentMinistryStatus = 'newcomer';
      }
    }
    journey.updatedAt = nowIso();
    audit(state, 'duplicate.resolve', 'newcomerJourney', journeyId, session?.person.id ?? null, {
      newValue: { action, existingPersonId },
    });
    save(state);
  },

  assignNewcomer(journeyId: string, assignedPersonId: string, type: 'primary' | 'secondary' = 'primary') {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const journey = state.journeys.find((j) => j.id === journeyId);
    if (!journey) throw new Error('Journey not found');

    const active = state.assignments.filter(
      (a) => a.journeyId === journeyId && a.assignmentStatus === 'active' && a.assignmentType === 'primary',
    );
    if (type === 'primary' && active.length) {
      // warn path — caller should confirm; we end previous
      for (const a of active) {
        a.assignmentStatus = 'ended';
        a.endDate = nowIso();
        a.updatedAt = nowIso();
      }
    }

    const assignment: FollowUpAssignment = {
      id: id('assign'),
      organizationId: state.organization.id,
      journeyId,
      newcomerPersonId: journey.personId,
      assignedPersonId,
      assignmentType: type,
      assignmentStatus: 'active',
      reportingRequired: type === 'primary',
      startDate: nowIso(),
      endDate: null,
      assignedByPersonId: session.person.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.assignments.push(assignment);
    journey.journeyStatus = 'assigned';
    journey.updatedAt = nowIso();
    audit(state, 'assignment.create', 'followUpAssignment', assignment.id, session.person.id);
    save(state);
    return assignment;
  },

  submitReport(input: {
    journeyId: string;
    assignmentId: string;
    contactMade: boolean;
    expectedToAttend: 'yes' | 'no' | 'maybe' | 'unknown';
    summary: string;
  }) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const journey = state.journeys.find((j) => j.id === input.journeyId);
    if (!journey) throw new Error('Journey not found');
    const { weekStart, weekEnd, dueAt } = weekBounds();
    const submittedAt = new Date();
    const late = submittedAt.getTime() > dueAt.getTime();
    const editableUntil = new Date(submittedAt);
    editableUntil.setDate(editableUntil.getDate() + DEFAULT_FOLLOW_UP_CONFIG.reportEditWindowDays);

    const report: FollowUpReport = {
      id: id('report'),
      organizationId: state.organization.id,
      journeyId: input.journeyId,
      newcomerPersonId: journey.personId,
      assignmentId: input.assignmentId,
      reportingWeekStart: weekStart.toISOString(),
      reportingWeekEnd: weekEnd.toISOString(),
      dueAt: dueAt.toISOString(),
      contactMade: input.contactMade,
      expectedToAttend: input.expectedToAttend,
      formDefinitionId: 'form_weekly_report',
      formVersion: 1,
      dynamicResponses: { summary: input.summary },
      reportStatus: late ? 'submitted_late' : 'submitted_on_time',
      submittedByPersonId: session.person.id,
      submittedAt: submittedAt.toISOString(),
      originalSubmittedAt: submittedAt.toISOString(),
      editableUntil: editableUntil.toISOString(),
      lockedAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.reports.push(report);
    if (journey.journeyStatus === 'assigned') journey.journeyStatus = 'active_follow_up';
    journey.updatedAt = nowIso();
    audit(state, 'report.submit', 'followUpReport', report.id, session.person.id);
    save(state);
    return report;
  },

  recordAttendance(input: {
    personId: string;
    journeyId: string;
    assignmentId: string | null;
    calendarEventId: string;
    status: AttendanceStatus;
  }) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const existing = state.attendance.find(
      (a) => a.personId === input.personId && a.calendarEventId === input.calendarEventId,
    );
    const event = state.calendarEvents.find((e) => e.id === input.calendarEventId);
    if (!event) throw new Error('Calendar event not found');

    if (existing) {
      const prev = existing.attendanceStatus;
      existing.attendanceStatus = input.status;
      existing.updatedAt = nowIso();
      existing.updatedByPersonId = session.person.id;
      audit(state, 'attendance.correct', 'newcomerAttendance', existing.id, session.person.id, {
        previousValue: prev,
        newValue: input.status,
      });
      save(state);
      return existing;
    }

    const row: NewcomerAttendance = {
      id: id('att'),
      organizationId: state.organization.id,
      personId: input.personId,
      journeyId: input.journeyId,
      assignmentId: input.assignmentId,
      calendarEventId: input.calendarEventId,
      programDate: event.startAt,
      attendanceStatus: input.status,
      recordedByPersonId: session.person.id,
      recordedAt: nowIso(),
      updatedAt: nowIso(),
      updatedByPersonId: session.person.id,
    };
    state.attendance.push(row);
    audit(state, 'attendance.record', 'newcomerAttendance', row.id, session.person.id);
    save(state);
    return row;
  },

  addBio(input: { personId: string; journeyId: string; content: string; categoryId?: string }) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const entry: NewcomerBioEntry = {
      id: id('bio'),
      organizationId: state.organization.id,
      personId: input.personId,
      journeyId: input.journeyId,
      categoryId: input.categoryId ?? 'general',
      content: input.content,
      sensitivityLevel: 'standard',
      visibilityPolicyId: 'team_follow_up',
      recordStatus: 'active',
      addedByPersonId: session.person.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      updatedByPersonId: session.person.id,
      deletedAt: null,
      deletedByPersonId: null,
    };
    state.bioEntries.push(entry);
    audit(state, 'bio.add', 'newcomerBioEntry', entry.id, session.person.id);
    save(state);
    return entry;
  },

  updateJourneyStatus(
    journeyId: string,
    status: string,
    reason?: string,
    action: 'inactive' | 'closed' | 'active_follow_up' | 'reopen' | string = status,
  ) {
    const state = load();
    const session = this.getSession();
    const journey = state.journeys.find((j) => j.id === journeyId);
    if (!journey) throw new Error('Journey not found');

    const trimmedReason = reason?.trim() ?? '';
    if (trimmedReason.length < 3) {
      throw new Error('A reason of at least 3 characters is required');
    }

    const prev = journey.journeyStatus;
    journey.journeyStatus = status;
    journey.updatedAt = nowIso();
    journey.updatedBy = session?.person.id ?? 'system';
    journey.lastStatusReason = trimmedReason;

    if (status === 'closed') {
      journey.completedAt = nowIso();
      journey.closureReason = trimmedReason;
      journey.isCurrentJourney = false;
    }

    if (status === 'inactive') {
      journey.isCurrentJourney = true;
    }

    if (status === 'active_follow_up') {
      journey.isCurrentJourney = true;
      journey.completedAt = null;
    }

    if (action === 'reopen') {
      journey.isCurrentJourney = true;
      journey.completedAt = null;
      journey.closureReason = null;
      for (const a of state.assignments.filter((x) => x.journeyId === journeyId && x.assignmentStatus === 'active')) {
        a.assignmentStatus = 'ended';
        a.endDate = nowIso();
        a.updatedAt = nowIso();
      }
    }

    audit(state, 'journey.transition', 'newcomerJourney', journeyId, session?.person.id ?? null, {
      previousValue: prev,
      newValue: status,
      reason: trimmedReason,
    });
    save(state);
  },

  submitMembershipRecommendation(journeyId: string, comments: string) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const journey = state.journeys.find((j) => j.id === journeyId);
    if (!journey) throw new Error('Journey not found');
    journey.journeyStatus = 'membership_approval_in_progress';
    journey.membershipReadinessStatus = 'recommended';
    journey.updatedAt = nowIso();
    audit(state, 'membership.recommend', 'newcomerJourney', journeyId, session.person.id, {
      newValue: { comments },
    });
    save(state);
  },

  approveMembership(journeyId: string) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const journey = state.journeys.find((j) => j.id === journeyId);
    if (!journey) throw new Error('Journey not found');
    const person = state.people.find((p) => p.id === journey.personId);
    if (!person) throw new Error('Person not found');

    const prevStatus = person.currentMinistryStatus;
    person.currentMinistryStatus = 'member';
    person.updatedAt = nowIso();
    person.updatedBy = session.person.id;
    journey.journeyStatus = 'transitioned_to_member';
    journey.completedAt = nowIso();
    journey.isCurrentJourney = false;
    journey.updatedAt = nowIso();

    for (const a of state.assignments.filter((x) => x.journeyId === journeyId && x.assignmentStatus === 'active')) {
      a.assignmentStatus = 'ended';
      a.endDate = nowIso();
    }

    audit(state, 'membership.approve', 'person', person.id, session.person.id, {
      previousValue: prevStatus,
      newValue: 'member',
    });
    save(state);
  },

  listTeamMembers() {
    const state = load();
    return state.people.filter((p) =>
      state.roleAssignments.some((ra) => ra.personId === p.id && ra.active),
    );
  },

  listCalendarEvents(includeCancelled = false) {
    const state = load();
    return state.calendarEvents
      .filter((e) => includeCancelled || e.eventStatus !== 'cancelled')
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  },

  findCalendarConflicts(input: {
    startAt: string;
    endAt: string;
    excludeEventId?: string;
  }) {
    const start = new Date(input.startAt).getTime();
    const end = new Date(input.endAt).getTime();
    return this.listCalendarEvents(false).filter((e) => {
      if (input.excludeEventId && e.id === input.excludeEventId) return false;
      const s = new Date(e.startAt).getTime();
      const en = new Date(e.endAt).getTime();
      return start < en && end > s;
    });
  },

  createCalendarEvent(input: {
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    eventScope?: string;
    eventPriority?: string;
    conflictPolicy?: 'hard_block' | 'warning' | 'informational';
    recurrenceWeeklySaturday?: boolean;
    forceOverride?: boolean;
  }) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    if (new Date(input.endAt) <= new Date(input.startAt)) {
      throw new Error('End time must be after start time');
    }

    const conflicts = this.findCalendarConflicts({
      startAt: input.startAt,
      endAt: input.endAt,
    });
    const hard = conflicts.filter((c) => c.conflictPolicy === 'hard_block' || c.eventPriority === 'organization_reserved');
    if (hard.length && !input.forceOverride) {
      throw new Error(
        `Hard conflict with: ${hard.map((h) => h.title).join(', ')}. Use conflict override permission to force.`,
      );
    }
    if (hard.length && input.forceOverride) {
      const resolved = resolvePermissions({
        personId: session.person.id,
        organizationId: state.organization.id,
        roleTemplates: state.roleTemplates,
        roleAssignments: state.roleAssignments,
        overrides: state.overrides,
      });
      if (!resolved.permissions.has(Permissions.calendarConflictOverride) && !resolved.permissions.has(Permissions.rolesManage)) {
        throw new Error('Missing calendar.conflict.override permission');
      }
    }

    const event: CalendarEvent = {
      id: id('cal'),
      organizationId: state.organization.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      organizingTeamId: 'team_follow_up',
      eventScope: input.eventScope ?? 'organization',
      eventPriority: input.eventPriority ?? 'normal',
      conflictPolicy: input.conflictPolicy ?? 'warning',
      startAt: new Date(input.startAt).toISOString(),
      endAt: new Date(input.endAt).toISOString(),
      timezone: state.organization.timezone,
      recurrence: input.recurrenceWeeklySaturday
        ? { enabled: true, frequency: 'weekly', daysOfWeek: ['saturday'] }
        : { enabled: false, frequency: 'none', daysOfWeek: [] },
      parentRecurringEventId: null,
      eventStatus: 'scheduled',
      createdByPersonId: session.person.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.calendarEvents.push(event);
    audit(state, 'calendar.create', 'calendarEvent', event.id, session.person.id, {
      newValue: { title: event.title, conflicts: conflicts.map((c) => c.id), forced: !!input.forceOverride },
      reason: input.forceOverride ? 'conflict override' : undefined,
    });
    save(state);
    return { event, warningConflicts: conflicts.filter((c) => c.conflictPolicy === 'warning') };
  },

  updateCalendarEvent(
    eventId: string,
    patch: Partial<Pick<CalendarEvent, 'title' | 'description' | 'startAt' | 'endAt' | 'eventStatus' | 'conflictPolicy' | 'eventPriority'>>,
    forceOverride = false,
  ) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const event = state.calendarEvents.find((e) => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const nextStart = patch.startAt ?? event.startAt;
    const nextEnd = patch.endAt ?? event.endAt;
    if (new Date(nextEnd) <= new Date(nextStart)) {
      throw new Error('End time must be after start time');
    }

    if (patch.startAt || patch.endAt) {
      const conflicts = this.findCalendarConflicts({
        startAt: nextStart,
        endAt: nextEnd,
        excludeEventId: eventId,
      });
      const hard = conflicts.filter((c) => c.conflictPolicy === 'hard_block' || c.eventPriority === 'organization_reserved');
      if (hard.length && !forceOverride) {
        throw new Error(`Hard conflict with: ${hard.map((h) => h.title).join(', ')}`);
      }
    }

    const prev = { ...event };
    Object.assign(event, patch, { updatedAt: nowIso() });
    audit(state, 'calendar.update', 'calendarEvent', eventId, session.person.id, {
      previousValue: prev,
      newValue: event,
      reason: forceOverride ? 'conflict override' : undefined,
    });
    save(state);
    return event;
  },

  cancelCalendarEvent(eventId: string, reason: string) {
    const trimmed = reason.trim();
    if (trimmed.length < 3) throw new Error('Cancel reason required');
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const event = state.calendarEvents.find((e) => e.id === eventId);
    if (!event) throw new Error('Event not found');
    const prev = event.eventStatus;
    event.eventStatus = 'cancelled';
    event.updatedAt = nowIso();
    audit(state, 'calendar.cancel', 'calendarEvent', eventId, session.person.id, {
      previousValue: prev,
      newValue: 'cancelled',
      reason: trimmed,
    });
    save(state);
    return event;
  },

  listMyChatChannels() {
    const state = load();
    const session = this.getSession();
    if (!session) return [];
    const myChannelIds = new Set(
      state.chatMemberships
        .filter((m) => m.personId === session.person.id && m.membershipStatus === 'active')
        .map((m) => m.channelId),
    );
    return state.chatChannels
      .filter((c) => c.channelStatus !== 'archived' && myChannelIds.has(c.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  listChatChannelsForManage() {
    const state = load();
    return state.chatChannels
      .filter((c) => c.channelStatus !== 'archived')
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  listChatMembers(channelId: string) {
    const state = load();
    return state.chatMemberships
      .filter((m) => m.channelId === channelId && m.membershipStatus === 'active')
      .map((m) => ({
        membership: m,
        person: state.people.find((p) => p.id === m.personId) ?? null,
      }));
  },

  listChatMessages(channelId: string, includeDeleted = false) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const member = state.chatMemberships.find(
      (m) => m.channelId === channelId && m.personId === session.person.id && m.membershipStatus === 'active',
    );
    if (!member) throw new Error('Not a member of this channel');
    return state.chatMessages
      .filter((m) => m.channelId === channelId && (includeDeleted || m.messageStatus !== 'deleted'))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  isChatMember(channelId: string, personId?: string) {
    const state = load();
    const session = this.getSession();
    const pid = personId ?? session?.person.id;
    if (!pid) return false;
    return state.chatMemberships.some(
      (m) => m.channelId === channelId && m.personId === pid && m.membershipStatus === 'active',
    );
  },

  createChatChannel(input: {
    name: string;
    description?: string;
    channelType?: string;
    relatedTeamId?: string | null;
    initialMemberPersonIds?: string[];
  }) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const resolved = resolvePermissions({
      personId: session.person.id,
      organizationId: state.organization.id,
      roleTemplates: state.roleTemplates,
      roleAssignments: state.roleAssignments,
      overrides: state.overrides,
    });
    if (!resolved.permissions.has(Permissions.chatCreate)) {
      throw new Error('Missing follow_up.chat.create permission');
    }
    const name = input.name.trim();
    if (name.length < 2) throw new Error('Channel name required');

    const channel: ChatChannel = {
      id: id('chat'),
      organizationId: state.organization.id,
      name,
      description: input.description?.trim() || null,
      channelType: input.channelType ?? 'team_operational',
      relatedTeamId: input.relatedTeamId ?? 'team_follow_up',
      channelStatus: 'active',
      createdByPersonId: session.person.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.chatChannels.push(channel);

    const memberIds = new Set([session.person.id, ...(input.initialMemberPersonIds ?? [])]);
    for (const personId of memberIds) {
      state.chatMemberships.push({
        id: id('cm'),
        organizationId: state.organization.id,
        channelId: channel.id,
        personId,
        membershipRole: personId === session.person.id ? 'moderator' : 'member',
        membershipStatus: 'active',
        addedByPersonId: session.person.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        removedAt: null,
        removedByPersonId: null,
      });
    }

    audit(state, 'chat.channel.create', 'chatChannel', channel.id, session.person.id, {
      newValue: { name: channel.name, members: [...memberIds] },
    });
    save(state);
    return channel;
  },

  addChatMember(channelId: string, personId: string) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const resolved = resolvePermissions({
      personId: session.person.id,
      organizationId: state.organization.id,
      roleTemplates: state.roleTemplates,
      roleAssignments: state.roleAssignments,
      overrides: state.overrides,
    });
    if (!resolved.permissions.has(Permissions.chatManageMembers)) {
      throw new Error('Missing follow_up.chat.manage_members permission');
    }
    const channel = state.chatChannels.find((c) => c.id === channelId);
    if (!channel || channel.channelStatus === 'archived') throw new Error('Channel not found');
    const person = state.people.find((p) => p.id === personId);
    if (!person) throw new Error('Person not found');

    const existing = state.chatMemberships.find((m) => m.channelId === channelId && m.personId === personId);
    if (existing?.membershipStatus === 'active') {
      throw new Error('Already a channel member');
    }
    if (existing) {
      existing.membershipStatus = 'active';
      existing.updatedAt = nowIso();
      existing.removedAt = null;
      existing.removedByPersonId = null;
      existing.addedByPersonId = session.person.id;
    } else {
      state.chatMemberships.push({
        id: id('cm'),
        organizationId: state.organization.id,
        channelId,
        personId,
        membershipRole: 'member',
        membershipStatus: 'active',
        addedByPersonId: session.person.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        removedAt: null,
        removedByPersonId: null,
      });
    }
    audit(state, 'chat.member.add', 'chatMembership', channelId, session.person.id, {
      newValue: { personId, note: 'Chat membership does not grant team permissions' },
    });
    save(state);
  },

  removeChatMember(channelId: string, personId: string) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const resolved = resolvePermissions({
      personId: session.person.id,
      organizationId: state.organization.id,
      roleTemplates: state.roleTemplates,
      roleAssignments: state.roleAssignments,
      overrides: state.overrides,
    });
    if (!resolved.permissions.has(Permissions.chatManageMembers)) {
      throw new Error('Missing follow_up.chat.manage_members permission');
    }
    const membership = state.chatMemberships.find(
      (m) => m.channelId === channelId && m.personId === personId && m.membershipStatus === 'active',
    );
    if (!membership) throw new Error('Membership not found');
    membership.membershipStatus = 'removed';
    membership.removedAt = nowIso();
    membership.removedByPersonId = session.person.id;
    membership.updatedAt = nowIso();
    audit(state, 'chat.member.remove', 'chatMembership', membership.id, session.person.id, {
      previousValue: { personId, channelId },
      reason: 'Removed from channel only — team membership unchanged',
    });
    save(state);
  },

  sendChatMessage(channelId: string, body: string) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const trimmed = body.trim();
    if (!trimmed) throw new Error('Message required');
    if (!this.isChatMember(channelId)) {
      throw new Error('Not a member of this channel');
    }
    const channel = state.chatChannels.find((c) => c.id === channelId && c.channelStatus === 'active');
    if (!channel) throw new Error('Channel not found');

    const message: ChatMessage = {
      id: id('msg'),
      organizationId: state.organization.id,
      channelId,
      senderPersonId: session.person.id,
      body: trimmed,
      messageStatus: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
      deletedByPersonId: null,
    };
    state.chatMessages.push(message);
    audit(state, 'chat.message.send', 'chatMessage', message.id, session.person.id, {
      newValue: { channelId },
    });
    save(state);
    return message;
  },

  softDeleteChatMessage(messageId: string) {
    const state = load();
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const message = state.chatMessages.find((m) => m.id === messageId);
    if (!message || message.messageStatus === 'deleted') throw new Error('Message not found');
    const resolved = resolvePermissions({
      personId: session.person.id,
      organizationId: state.organization.id,
      roleTemplates: state.roleTemplates,
      roleAssignments: state.roleAssignments,
      overrides: state.overrides,
    });
    const canModerate = resolved.permissions.has(Permissions.chatManageMembers);
    if (message.senderPersonId !== session.person.id && !canModerate) {
      throw new Error('Cannot delete this message');
    }
    message.messageStatus = 'deleted';
    message.deletedAt = nowIso();
    message.deletedByPersonId = session.person.id;
    message.updatedAt = nowIso();
    audit(state, 'chat.message.delete', 'chatMessage', messageId, session.person.id, {
      previousValue: { body: message.body },
      reason: 'soft delete',
    });
    save(state);
    return message;
  },
};
