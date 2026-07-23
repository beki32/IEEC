import {
  DEFAULT_FOLLOW_UP_CONFIG,
  FOLLOW_UP_LEADER_PERMISSIONS,
  FOLLOW_UP_MINISTER_PERMISSIONS,
  HEAD_LEADER_PERMISSIONS,
  normalizeEmail,
  normalizeName,
  normalizePhone,
  resolvePermissions,
  weekBounds,
  type AttendanceStatus,
  type FollowUpAssignment,
  type FollowUpReport,
  type NewcomerAttendance,
  type NewcomerBioEntry,
  type NewcomerJourney,
  type Person,
  type RoleAssignment,
  type RoleTemplate,
  type UserAccount,
} from '@ieec/shared';

type State = {
  people: Person[];
  userAccounts: UserAccount[];
  roleTemplates: RoleTemplate[];
  roleAssignments: RoleAssignment[];
  journeys: NewcomerJourney[];
  assignments: FollowUpAssignment[];
  reports: FollowUpReport[];
  attendance: NewcomerAttendance[];
  bioEntries: NewcomerBioEntry[];
  calendarEventId: string;
  calendarTitle: string;
  sessionAuthUid: string | null;
  organizationId: string;
};

function nowIso() {
  return new Date().toISOString();
}

function seed(): State {
  const orgId = 'ieec_ya';
  const ts = nowIso();
  const leaderPersonId = 'person_leader';
  const ministerPersonId = 'person_minister';
  const newcomer2Id = 'person_newcomer_2';
  const journey2 = 'journey_2';

  const roleLeader: RoleTemplate = {
    id: 'role_fu_leader',
    organizationId: orgId,
    name: 'Follow-Up Leader',
    description: 'Full management',
    permissions: [...FOLLOW_UP_LEADER_PERMISSIONS, ...HEAD_LEADER_PERMISSIONS],
    recordStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  };
  const roleMinister: RoleTemplate = {
    id: 'role_fu_minister',
    organizationId: orgId,
    name: 'Follow-Up Minister',
    description: 'Assigned work',
    permissions: [...FOLLOW_UP_MINISTER_PERMISSIONS],
    recordStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  };

  const mkPerson = (id: string, first: string, last: string, email: string, status: string, jid: string | null, hasAcc: boolean): Person => ({
    id,
    organizationId: orgId,
    firstName: first,
    lastName: last,
    normalizedFirstName: normalizeName(first),
    normalizedLastName: normalizeName(last),
    sex: 'female',
    phone: { display: '202-555-0100', normalized: '2025550100' },
    email: { address: email, normalized: normalizeEmail(email), verified: true },
    contactPreference: { method: 'text', preferredTime: null, customTimeNote: null },
    photoFileId: null,
    currentMinistryStatus: status,
    recordStatus: 'active',
    hasUserAccount: hasAcc,
    activeJourneyId: jid,
    createdAt: ts,
    createdBy: 'system',
    updatedAt: ts,
    updatedBy: 'system',
  });

  return {
    organizationId: orgId,
    people: [
      mkPerson(leaderPersonId, 'Sarah', 'Leader', 'leader@ieec.demo', 'minister', null, true),
      mkPerson(ministerPersonId, 'Marta', 'Minister', 'minister@ieec.demo', 'minister', null, true),
      mkPerson(newcomer2Id, 'Hanna', 'Tesfaye', 'hanna@example.com', 'newcomer', journey2, false),
    ],
    userAccounts: [
      {
        id: 'uid_minister',
        organizationId: orgId,
        personId: ministerPersonId,
        email: 'minister@ieec.demo',
        accountStatus: 'active',
        emailVerified: true,
        invitationStatus: 'accepted',
        invitedAt: ts,
        activatedAt: ts,
        lastLoginAt: ts,
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: 'uid_leader',
        organizationId: orgId,
        personId: leaderPersonId,
        email: 'leader@ieec.demo',
        accountStatus: 'active',
        emailVerified: true,
        invitationStatus: 'accepted',
        invitedAt: ts,
        activatedAt: ts,
        lastLoginAt: ts,
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    roleTemplates: [roleLeader, roleMinister],
    roleAssignments: [
      {
        id: 'ra_m',
        organizationId: orgId,
        personId: ministerPersonId,
        roleTemplateId: roleMinister.id,
        scopeType: 'team',
        ministryId: 'ministry_ya',
        teamId: 'team_follow_up',
        groupId: null,
        startAt: null,
        endAt: null,
        active: true,
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: 'ra_l',
        organizationId: orgId,
        personId: leaderPersonId,
        roleTemplateId: roleLeader.id,
        scopeType: 'team',
        ministryId: 'ministry_ya',
        teamId: 'team_follow_up',
        groupId: null,
        startAt: null,
        endAt: null,
        active: true,
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    journeys: [
      {
        id: journey2,
        organizationId: orgId,
        personId: newcomer2Id,
        registrationDate: ts,
        registrationSource: 'mobile',
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
      },
    ],
    assignments: [
      {
        id: 'assign_2',
        organizationId: orgId,
        journeyId: journey2,
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
      },
    ],
    reports: [],
    attendance: [],
    bioEntries: [],
    calendarEventId: 'cal_sat_program',
    calendarTitle: 'IEEC YA Saturday Program',
    sessionAuthUid: null,
  };
}

let state = seed();

export const mobileStore = {
  reset() {
    state = seed();
  },
  login(email: string) {
    const account = state.userAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account) return { ok: false as const, error: 'Use minister@ieec.demo or leader@ieec.demo' };
    state.sessionAuthUid = account.id;
    return { ok: true as const };
  },
  logout() {
    state.sessionAuthUid = null;
  },
  getSession() {
    if (!state.sessionAuthUid) return null;
    const account = state.userAccounts.find((a) => a.id === state.sessionAuthUid)!;
    const person = state.people.find((p) => p.id === account.personId)!;
    const resolved = resolvePermissions({
      personId: person.id,
      organizationId: state.organizationId,
      roleTemplates: state.roleTemplates,
      roleAssignments: state.roleAssignments,
      overrides: [],
    });
    return { account, person, permissions: resolved.permissions, config: DEFAULT_FOLLOW_UP_CONFIG };
  },
  myAssignments() {
    const session = this.getSession();
    if (!session) return [];
    return state.assignments
      .filter((a) => a.assignedPersonId === session.person.id && a.assignmentStatus === 'active')
      .map((a) => ({
        assignment: a,
        person: state.people.find((p) => p.id === a.newcomerPersonId)!,
        journey: state.journeys.find((j) => j.id === a.journeyId)!,
      }));
  },
  submitReport(assignmentId: string, journeyId: string, newcomerPersonId: string, summary: string) {
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const { weekStart, weekEnd, dueAt } = weekBounds();
    const submittedAt = new Date();
    const report: FollowUpReport = {
      id: `report_${Date.now()}`,
      organizationId: state.organizationId,
      journeyId,
      newcomerPersonId,
      assignmentId,
      reportingWeekStart: weekStart.toISOString(),
      reportingWeekEnd: weekEnd.toISOString(),
      dueAt: dueAt.toISOString(),
      contactMade: true,
      expectedToAttend: 'yes',
      formDefinitionId: 'form_weekly_report',
      formVersion: 1,
      dynamicResponses: { summary },
      reportStatus: submittedAt > dueAt ? 'submitted_late' : 'submitted_on_time',
      submittedByPersonId: session.person.id,
      submittedAt: submittedAt.toISOString(),
      originalSubmittedAt: submittedAt.toISOString(),
      editableUntil: null,
      lockedAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.reports.push(report);
    return report;
  },
  recordAttendance(personId: string, journeyId: string, assignmentId: string, status: AttendanceStatus) {
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const existing = state.attendance.find(
      (a) => a.personId === personId && a.calendarEventId === state.calendarEventId,
    );
    if (existing) {
      existing.attendanceStatus = status;
      existing.updatedAt = nowIso();
      existing.updatedByPersonId = session.person.id;
      return existing;
    }
    const row: NewcomerAttendance = {
      id: `att_${Date.now()}`,
      organizationId: state.organizationId,
      personId,
      journeyId,
      assignmentId,
      calendarEventId: state.calendarEventId,
      programDate: nowIso(),
      attendanceStatus: status,
      recordedByPersonId: session.person.id,
      recordedAt: nowIso(),
      updatedAt: nowIso(),
      updatedByPersonId: session.person.id,
    };
    state.attendance.push(row);
    return row;
  },
  addBio(personId: string, journeyId: string, content: string) {
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const entry: NewcomerBioEntry = {
      id: `bio_${Date.now()}`,
      organizationId: state.organizationId,
      personId,
      journeyId,
      categoryId: 'general',
      content,
      sensitivityLevel: 'standard',
      visibilityPolicyId: 'team',
      recordStatus: 'active',
      addedByPersonId: session.person.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      updatedByPersonId: session.person.id,
      deletedAt: null,
      deletedByPersonId: null,
    };
    state.bioEntries.push(entry);
    return entry;
  },
  register(input: { firstName: string; lastName: string; email: string; phone: string }) {
    const ts = nowIso();
    const personId = `person_${Date.now()}`;
    const journeyId = `journey_${Date.now()}`;
    const person: Person = {
      id: personId,
      organizationId: state.organizationId,
      firstName: input.firstName,
      lastName: input.lastName,
      normalizedFirstName: normalizeName(input.firstName),
      normalizedLastName: normalizeName(input.lastName),
      sex: 'unspecified',
      phone: { display: input.phone, normalized: normalizePhone(input.phone) },
      email: { address: input.email, normalized: normalizeEmail(input.email), verified: false },
      contactPreference: { method: 'text', preferredTime: null, customTimeNote: null },
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
    state.people.push(person);
    state.journeys.push({
      id: journeyId,
      organizationId: state.organizationId,
      personId,
      registrationDate: ts,
      registrationSource: 'mobile_app',
      journeyStatus: 'awaiting_assignment',
      membershipReadinessStatus: 'not_ready',
      previousJourneyId: null,
      isCurrentJourney: true,
      welcomeMessageStatus: 'queued',
      startedAt: ts,
      completedAt: null,
      closureReason: null,
      lastStatusReason: null,
      createdAt: ts,
      createdBy: 'public',
      updatedAt: ts,
      updatedBy: 'public',
    });
    return { personId, journeyId };
  },
};
