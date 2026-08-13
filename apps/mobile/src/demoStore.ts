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

export type TeamNote = {
  id: string;
  title: string;
  body: string;
  authorPersonId: string;
  relatedPersonId: string | null;
  createdAt: string;
};

export type TeamTask = {
  id: string;
  title: string;
  done: boolean;
  assigneePersonId: string | null;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type ChatMessage = {
  id: string;
  contactPersonId: string;
  fromPersonId: string;
  text: string;
  createdAt: string;
};

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
  notes: TeamNote[];
  tasks: TeamTask[];
  notifications: AppNotification[];
  messages: ChatMessage[];
  calendarEventId: string;
  calendarTitle: string;
  sessionAuthUid: string | null;
  organizationId: string;
};

type Listener = () => void;
const listeners = new Set<Listener>();

function nowIso() {
  return new Date().toISOString();
}

function emit() {
  listeners.forEach((l) => l());
}

function mkPerson(
  orgId: string,
  id: string,
  first: string,
  last: string,
  email: string,
  status: string,
  jid: string | null,
  hasAcc: boolean,
  sex: Person['sex'] = 'unspecified',
  phone = '202-555-0100',
): Person {
  const ts = nowIso();
  return {
    id,
    organizationId: orgId,
    firstName: first,
    lastName: last,
    normalizedFirstName: normalizeName(first),
    normalizedLastName: normalizeName(last),
    sex,
    phone: { display: phone, normalized: normalizePhone(phone) },
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
  };
}

function seed(): State {
  const orgId = 'ieec_ya';
  const ts = nowIso();
  const leaderPersonId = 'person_leader';
  const ministerPersonId = 'person_minister';
  const assistantPersonId = 'person_assistant';
  const newcomer1Id = 'person_newcomer_1';
  const newcomer2Id = 'person_newcomer_2';
  const newcomer3Id = 'person_newcomer_3';
  const journey1 = 'journey_1';
  const journey2 = 'journey_2';
  const journey3 = 'journey_3';

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
  const roleAssistant: RoleTemplate = {
    id: 'role_fu_assistant',
    organizationId: orgId,
    name: 'Assistant',
    description: 'Support',
    permissions: [...FOLLOW_UP_MINISTER_PERMISSIONS],
    recordStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  };

  return {
    organizationId: orgId,
    people: [
      mkPerson(orgId, leaderPersonId, 'Ruth', 'Desta', 'leader@ieec.demo', 'minister', null, true, 'female'),
      mkPerson(orgId, ministerPersonId, 'Marcus', 'Yohannes', 'minister@ieec.demo', 'minister', null, true, 'male'),
      mkPerson(orgId, assistantPersonId, 'Michael', 'Tadesse', 'assistant@ieec.demo', 'minister', null, true, 'male'),
      mkPerson(orgId, newcomer1Id, 'Samuel', 'Bekele', 'samuel@example.com', 'newcomer', journey1, false, 'male', '202-555-0142'),
      mkPerson(orgId, newcomer2Id, 'Hanna', 'Tesfaye', 'hanna@example.com', 'newcomer', journey2, false, 'female', '202-555-0188'),
      mkPerson(orgId, newcomer3Id, 'Amanuel', 'Bekele', 'amanuel@example.com', 'newcomer', journey3, false, 'male', '202-555-0199'),
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
      {
        id: 'uid_assistant',
        organizationId: orgId,
        personId: assistantPersonId,
        email: 'assistant@ieec.demo',
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
    roleTemplates: [roleLeader, roleMinister, roleAssistant],
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
      {
        id: 'ra_a',
        organizationId: orgId,
        personId: assistantPersonId,
        roleTemplateId: roleAssistant.id,
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
        id: journey1,
        organizationId: orgId,
        personId: newcomer1Id,
        registrationDate: ts,
        registrationSource: 'mobile',
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
        createdBy: 'system',
        updatedAt: ts,
        updatedBy: 'system',
      },
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
      {
        id: journey3,
        organizationId: orgId,
        personId: newcomer3Id,
        registrationDate: ts,
        registrationSource: 'web',
        journeyStatus: 'assigned',
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
      {
        id: 'assign_3',
        organizationId: orgId,
        journeyId: journey3,
        newcomerPersonId: newcomer3Id,
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
    notes: [
      {
        id: 'note_1',
        title: 'Friday Night Fellowship Check-In',
        body: 'Hanna felt welcomed and wants to join a small group next month.',
        authorPersonId: leaderPersonId,
        relatedPersonId: newcomer2Id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    tasks: [
      { id: 'task_1', title: 'Text Samuel a welcome message', done: false, assigneePersonId: ministerPersonId, createdAt: ts },
      { id: 'task_2', title: 'Confirm Hanna for Saturday program', done: true, assigneePersonId: ministerPersonId, createdAt: ts },
      { id: 'task_3', title: 'Prepare weekly report summary', done: false, assigneePersonId: leaderPersonId, createdAt: ts },
    ],
    notifications: [
      {
        id: 'notif_1',
        title: 'New registration',
        body: 'Samuel Bekele is awaiting assignment.',
        createdAt: ts,
        read: false,
      },
      {
        id: 'notif_2',
        title: 'Assignment',
        body: 'Hanna Tesfaye was assigned to Marcus Yohannes.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
    ],
    messages: [
      {
        id: 'msg_1',
        contactPersonId: newcomer2Id,
        fromPersonId: ministerPersonId,
        text: 'Hi Hanna — welcome to IEEC YA! Looking forward to connecting this week.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg_2',
        contactPersonId: newcomer2Id,
        fromPersonId: newcomer2Id,
        text: 'Thank you! Excited to visit again on Friday.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    calendarEventId: 'cal_sat_program',
    calendarTitle: 'IEEC YA Saturday Program',
    sessionAuthUid: null,
  };
}

let state = seed();

export const mobileStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  reset() {
    state = seed();
    emit();
  },
  getState() {
    return state;
  },
  login(email: string) {
    const account = state.userAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      return { ok: false as const, error: 'Use leader@, assistant@, or minister@ieec.demo' };
    }
    state.sessionAuthUid = account.id;
    emit();
    return { ok: true as const };
  },
  logout() {
    state.sessionAuthUid = null;
    emit();
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
    const role = state.roleTemplates.find((t) =>
      state.roleAssignments.some((ra) => ra.personId === person.id && ra.active && ra.roleTemplateId === t.id),
    );
    return {
      account,
      person,
      permissions: resolved.permissions,
      config: DEFAULT_FOLLOW_UP_CONFIG,
      roleName: role?.name ?? 'Team member',
    };
  },
  queueRows(filter: 'all' | 'unassigned' | 'assigned' = 'all') {
    return state.journeys
      .filter((j) => j.isCurrentJourney)
      .map((j) => {
        const person = state.people.find((p) => p.id === j.personId)!;
        const assignment = state.assignments.find((a) => a.journeyId === j.id && a.assignmentStatus === 'active');
        const assignee = assignment
          ? state.people.find((p) => p.id === assignment.assignedPersonId) ?? null
          : null;
        return { journey: j, person, assignment: assignment ?? null, assignee };
      })
      .filter((r) => r.person.currentMinistryStatus === 'newcomer')
      .filter((r) => {
        if (filter === 'unassigned') return !r.assignment;
        if (filter === 'assigned') return !!r.assignment;
        return true;
      })
      .sort((a, b) => a.person.lastName.localeCompare(b.person.lastName));
  },
  unassignedCount() {
    return this.queueRows('unassigned').length;
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
  assignableStaff() {
    const assignableRoleIds = new Set(['role_fu_minister', 'role_fu_leader', 'role_fu_assistant']);
    return state.people
      .filter(
        (p) =>
          p.recordStatus === 'active' &&
          state.roleAssignments.some(
            (ra) => ra.personId === p.id && ra.active && assignableRoleIds.has(ra.roleTemplateId),
          ),
      )
      .map((p) => {
        const role = state.roleTemplates.find((t) =>
          state.roleAssignments.some(
            (ra) => ra.personId === p.id && ra.active && ra.roleTemplateId === t.id && assignableRoleIds.has(t.id),
          ),
        );
        const activeCount = state.assignments.filter(
          (a) => a.assignedPersonId === p.id && a.assignmentStatus === 'active',
        ).length;
        return { person: p, roleName: role?.name ?? 'Team member', activeCount };
      })
      .sort((a, b) => a.person.firstName.localeCompare(b.person.firstName));
  },
  assignNewcomer(journeyId: string, assignedPersonId: string) {
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const journey = state.journeys.find((j) => j.id === journeyId);
    if (!journey) throw new Error('Journey not found');
    const active = state.assignments.filter(
      (a) => a.journeyId === journeyId && a.assignmentStatus === 'active' && a.assignmentType === 'primary',
    );
    for (const a of active) {
      a.assignmentStatus = 'ended';
      a.endDate = nowIso();
      a.updatedAt = nowIso();
    }
    const assignment: FollowUpAssignment = {
      id: `assign_${Date.now()}`,
      organizationId: state.organizationId,
      journeyId,
      newcomerPersonId: journey.personId,
      assignedPersonId,
      assignmentType: 'primary',
      assignmentStatus: 'active',
      reportingRequired: true,
      startDate: nowIso(),
      endDate: null,
      assignedByPersonId: session.person.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.assignments.push(assignment);
    journey.journeyStatus = 'assigned';
    journey.updatedAt = nowIso();
    journey.updatedBy = session.person.id;
    const person = state.people.find((p) => p.id === journey.personId)!;
    const assignee = state.people.find((p) => p.id === assignedPersonId)!;
    state.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Assignment confirmed',
      body: `${person.firstName} ${person.lastName} was assigned to ${assignee.firstName} ${assignee.lastName}.`,
      createdAt: nowIso(),
      read: false,
    });
    emit();
    return assignment;
  },
  getPersonBundle(personId: string) {
    const person = state.people.find((p) => p.id === personId);
    if (!person) return null;
    const journey = state.journeys.find((j) => j.personId === personId && j.isCurrentJourney) ?? null;
    const assignment = journey
      ? state.assignments.find((a) => a.journeyId === journey.id && a.assignmentStatus === 'active') ?? null
      : null;
    const assignee = assignment
      ? state.people.find((p) => p.id === assignment.assignedPersonId) ?? null
      : null;
    return { person, journey, assignment, assignee };
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
    const journey = state.journeys.find((j) => j.id === journeyId);
    if (journey && journey.journeyStatus === 'assigned') {
      journey.journeyStatus = 'active_follow_up';
      journey.updatedAt = nowIso();
    }
    emit();
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
      emit();
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
    emit();
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
    emit();
    return entry;
  },
  notes() {
    return [...state.notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  tasks() {
    return [...state.tasks];
  },
  toggleTask(taskId: string) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    task.done = !task.done;
    emit();
  },
  addNote(input: { title: string; body: string; relatedPersonId?: string | null }) {
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const note: TeamNote = {
      id: `note_${Date.now()}`,
      title: input.title,
      body: input.body,
      authorPersonId: session.person.id,
      relatedPersonId: input.relatedPersonId ?? null,
      createdAt: nowIso(),
    };
    state.notes.unshift(note);
    emit();
    return note;
  },
  notifications() {
    return [...state.notifications];
  },
  messagesFor(contactPersonId: string) {
    return state.messages
      .filter((m) => m.contactPersonId === contactPersonId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  sendMessage(contactPersonId: string, text: string) {
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      contactPersonId,
      fromPersonId: session.person.id,
      text,
      createdAt: nowIso(),
    };
    state.messages.push(msg);
    emit();
    return msg;
  },
  updateProfile(input: { firstName: string; lastName: string; phone: string }) {
    const session = this.getSession();
    if (!session) throw new Error('Not signed in');
    session.person.firstName = input.firstName.trim();
    session.person.lastName = input.lastName.trim();
    session.person.normalizedFirstName = normalizeName(input.firstName);
    session.person.normalizedLastName = normalizeName(input.lastName);
    session.person.phone = {
      display: input.phone,
      normalized: normalizePhone(input.phone),
    };
    session.person.updatedAt = nowIso();
    emit();
  },
  register(input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    sex?: Person['sex'];
    contactMethod?: 'text' | 'call' | 'email';
  }) {
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
      sex: input.sex ?? 'unspecified',
      phone: { display: input.phone, normalized: normalizePhone(input.phone) },
      email: { address: input.email, normalized: normalizeEmail(input.email), verified: false },
      contactPreference: {
        method: input.contactMethod ?? 'text',
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
    state.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'New registration',
      body: `${person.firstName} ${person.lastName} joined the queue.`,
      createdAt: ts,
      read: false,
    });
    emit();
    return { personId, journeyId };
  },
  personName(personId: string) {
    const p = state.people.find((x) => x.id === personId);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  },
};
