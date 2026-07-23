/**
 * Seeds Auth + Firestore emulators with the same demo accounts/data as the web demo store.
 *
 * Prerequisites:
 *   npx firebase-tools emulators:start --only auth,firestore --project ieec-ya-connect
 *   (or: npm run emulators)
 *
 * Usage:
 *   npm run seed:emulator
 */
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'ieec-ya-connect';
const PASSWORD = 'demo-password';
const ORG_ID = 'ieec_ya';
const TEAM_ID = 'team_follow_up';
const MINISTRY_ID = 'ministry_ya';

initializeApp({ projectId: PROJECT_ID });
const auth = getAuth();
const db = getFirestore();

function nowIso() {
  return new Date().toISOString();
}

async function upsertAuthUser(uid, email, displayName) {
  try {
    await auth.deleteUser(uid);
  } catch {
    // ignore missing
  }
  await auth.createUser({
    uid,
    email,
    password: PASSWORD,
    displayName,
    emailVerified: true,
  });
}

async function main() {
  const ts = nowIso();
  const leaderPersonId = 'person_leader';
  const assistantPersonId = 'person_assistant';
  const ministerPersonId = 'person_minister';
  const newcomer1Id = 'person_newcomer_1';
  const newcomer2Id = 'person_newcomer_2';

  await upsertAuthUser('uid_leader', 'leader@ieec.demo', 'Sarah Leader');
  await upsertAuthUser('uid_assistant', 'assistant@ieec.demo', 'Abel Assistant');
  await upsertAuthUser('uid_minister', 'minister@ieec.demo', 'Marta Minister');

  const nextSat = new Date();
  nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7 || 7));
  nextSat.setHours(18, 30, 0, 0);
  const nextSatEnd = new Date(nextSat);
  nextSatEnd.setHours(21, 30, 0, 0);
  const welcomeStart = new Date(nextSat);
  welcomeStart.setHours(17, 30, 0, 0);
  const welcomeEnd = new Date(nextSat);
  welcomeEnd.setHours(18, 15, 0, 0);

  const leaderPerms = [
    'follow_up.view',
    'follow_up.newcomers.view_unassigned',
    'follow_up.newcomers.view_all',
    'follow_up.duplicate.review',
    'follow_up.assignments.create',
    'follow_up.assignments.reassign',
    'follow_up.reports.view_all',
    'follow_up.reports.review',
    'follow_up.reports.edit_locked',
    'follow_up.attendance.view_all',
    'follow_up.attendance.correct',
    'follow_up.bio.view',
    'follow_up.bio.add',
    'follow_up.membership_review.start',
    'follow_up.chat.create',
    'follow_up.chat.manage_members',
    'follow_up.welcome_schedule.view',
    'follow_up.welcome_schedule.create',
    'follow_up.welcome_schedule.assign',
    'follow_up.welcome_schedule.update',
    'follow_up.welcome_schedule.cancel',
    'calendar.event.create',
    'calendar.event.manage',
    'follow_up.journey.create',
    'follow_up.journey.mark_inactive',
    'follow_up.journey.close',
    'follow_up.journey.reopen',
    'admin.roles.manage',
    'admin.people.manage',
    'audit.view',
    'workflow.override',
    'calendar.conflict.override',
  ];

  const batch = db.batch();
  const set = (col, id, data) => batch.set(db.collection(col).doc(id), { ...data, organizationId: ORG_ID });

  set('organizations', ORG_ID, {
    name: 'IEEC YA',
    timezone: 'America/New_York',
    status: 'active',
  });

  const mkPerson = (id, first, last, email, status, journeyId, hasAccount) => ({
    firstName: first,
    lastName: last,
    normalizedFirstName: first.toLowerCase(),
    normalizedLastName: last.toLowerCase(),
    sex: 'female',
    phone: { display: '202-555-0100', normalized: '2025550100' },
    email: { address: email, normalized: email.toLowerCase(), verified: true },
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

  set('people', leaderPersonId, mkPerson(leaderPersonId, 'Sarah', 'Leader', 'leader@ieec.demo', 'minister', null, true));
  set('people', assistantPersonId, mkPerson(assistantPersonId, 'Abel', 'Assistant', 'assistant@ieec.demo', 'minister', null, true));
  set('people', ministerPersonId, mkPerson(ministerPersonId, 'Marta', 'Minister', 'minister@ieec.demo', 'minister', null, true));
  set('people', newcomer1Id, mkPerson(newcomer1Id, 'Daniel', 'Bekele', 'daniel@example.com', 'newcomer', 'journey_1', false));
  set('people', newcomer2Id, mkPerson(newcomer2Id, 'Hanna', 'Tesfaye', 'hanna@example.com', 'newcomer', 'journey_2', false));

  for (const [uid, personId, email] of [
    ['uid_leader', leaderPersonId, 'leader@ieec.demo'],
    ['uid_assistant', assistantPersonId, 'assistant@ieec.demo'],
    ['uid_minister', ministerPersonId, 'minister@ieec.demo'],
  ]) {
    set('userAccounts', uid, {
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
  }

  set('roleTemplates', 'role_fu_leader', {
    name: 'Follow-Up Leader',
    description: 'Full Follow-Up management permissions',
    permissions: leaderPerms,
    recordStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  });
  set('roleTemplates', 'role_fu_assistant', {
    name: 'Follow-Up Assistant',
    description: 'No management by default',
    permissions: ['follow_up.view'],
    recordStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  });
  set('roleTemplates', 'role_fu_minister', {
    name: 'Follow-Up Minister',
    description: 'Assigned newcomer work',
    permissions: [
      'follow_up.view',
      'follow_up.reports.submit',
      'follow_up.reports.edit_own',
      'follow_up.attendance.record_assigned',
      'follow_up.bio.view',
      'follow_up.bio.add',
      'membership.recommendations.submit',
    ],
    recordStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  });

  const mkRa = (personId, roleId) => ({
    personId,
    roleTemplateId: roleId,
    scopeType: 'team',
    ministryId: MINISTRY_ID,
    teamId: TEAM_ID,
    groupId: null,
    startAt: null,
    endAt: null,
    active: true,
    createdAt: ts,
    updatedAt: ts,
  });
  set('roleAssignments', 'ra_leader', mkRa(leaderPersonId, 'role_fu_leader'));
  set('roleAssignments', 'ra_assistant', mkRa(assistantPersonId, 'role_fu_assistant'));
  set('roleAssignments', 'ra_minister', mkRa(ministerPersonId, 'role_fu_minister'));

  set('newcomerJourneys', 'journey_1', {
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
  });
  set('newcomerJourneys', 'journey_2', {
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
  });

  set('followUpAssignments', 'assign_2', {
    journeyId: 'journey_2',
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
  });

  set('calendarEvents', 'cal_sat_program', {
    title: 'IEEC YA Saturday Program',
    description: 'Weekly YA program 6:30 PM–9:30 PM',
    organizingTeamId: TEAM_ID,
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
  });
  set('calendarEvents', 'cal_welcome_window', {
    title: 'Newcomer Welcome Window',
    description: 'Greeters available before program',
    organizingTeamId: TEAM_ID,
    eventScope: 'team',
    eventPriority: 'normal',
    conflictPolicy: 'warning',
    startAt: welcomeStart.toISOString(),
    endAt: welcomeEnd.toISOString(),
    timezone: 'America/New_York',
    recurrence: { enabled: false, frequency: 'none', daysOfWeek: [] },
    parentRecurringEventId: null,
    eventStatus: 'scheduled',
    createdByPersonId: leaderPersonId,
    createdAt: ts,
    updatedAt: ts,
  });

  set('chatChannels', 'chat_fu_ops', {
    name: 'Follow-Up Ops',
    description: 'Team operational channel — membership ≠ team roles (ADR-004)',
    channelType: 'team_operational',
    relatedTeamId: TEAM_ID,
    channelStatus: 'active',
    createdByPersonId: leaderPersonId,
    createdAt: ts,
    updatedAt: ts,
  });
  set('chatChannels', 'chat_fu_leaders', {
    name: 'Follow-Up Leaders',
    description: 'Second channel on the same team',
    channelType: 'team_operational',
    relatedTeamId: TEAM_ID,
    channelStatus: 'active',
    createdByPersonId: leaderPersonId,
    createdAt: ts,
    updatedAt: ts,
  });

  const mkCm = (channelId, personId, role = 'member') => ({
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
  set('chatMemberships', 'cm_ops_leader', mkCm('chat_fu_ops', leaderPersonId, 'moderator'));
  set('chatMemberships', 'cm_ops_assistant', mkCm('chat_fu_ops', assistantPersonId));
  set('chatMemberships', 'cm_ops_minister', mkCm('chat_fu_ops', ministerPersonId));
  set('chatMemberships', 'cm_leaders_leader', mkCm('chat_fu_leaders', leaderPersonId, 'moderator'));
  set('chatMemberships', 'cm_leaders_assistant', mkCm('chat_fu_leaders', assistantPersonId));

  set('chatMessages', 'msg_welcome', {
    channelId: 'chat_fu_ops',
    senderPersonId: leaderPersonId,
    body: 'Welcome to Follow-Up Ops. Chat membership ≠ team membership.',
    messageStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
    deletedAt: null,
    deletedByPersonId: null,
  });

  await batch.commit();
  console.log('Seeded Auth + Firestore emulators for project', PROJECT_ID);
  console.log('Accounts (password: demo-password):');
  console.log('  leader@ieec.demo');
  console.log('  assistant@ieec.demo');
  console.log('  minister@ieec.demo');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
