/**
 * Bootstrap a real Firebase project (or emulators) with org + staff accounts.
 *
 * SAFETY: refuses to run unless ALLOW_FIREBASE_BOOTSTRAP=YES
 *
 * Production:
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
 *   export FIREBASE_PROJECT_ID=ieec-ya-connect
 *   export ALLOW_FIREBASE_BOOTSTRAP=YES
 *   npm run seed:bootstrap
 *
 * Emulator (optional):
 *   export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
 *   export FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
 *   export BOOTSTRAP_ALLOW_EMULATOR=YES
 *   export ALLOW_FIREBASE_BOOTSTRAP=YES
 *   npm run seed:bootstrap
 */
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'ieec-ya-connect';
const PASSWORD = process.env.BOOTSTRAP_STAFF_PASSWORD || 'demo-password';
const ORG_ID = 'ieec_ya';
const TEAM_ID = 'team_follow_up';
const MINISTRY_ID = 'ministry_ya';

function assertSafeToRun() {
  if (process.env.ALLOW_FIREBASE_BOOTSTRAP !== 'YES') {
    throw new Error(
      'Refusing to bootstrap. Set ALLOW_FIREBASE_BOOTSTRAP=YES after reading docs/FIREBASE_SETUP.md',
    );
  }

  const usingEmulator = Boolean(
    process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST,
  );
  if (usingEmulator && process.env.BOOTSTRAP_ALLOW_EMULATOR !== 'YES') {
    throw new Error(
      'Emulator hosts are set. For emulator bootstrap set BOOTSTRAP_ALLOW_EMULATOR=YES (or unset emulator hosts for production).',
    );
  }
  if (!usingEmulator && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn(
      'Warning: GOOGLE_APPLICATION_CREDENTIALS is not set. Admin SDK will try application default credentials.',
    );
  }
}

async function ensureAuthUser(auth, { uid, email, displayName }) {
  try {
    const existing = await auth.getUser(uid);
    await auth.updateUser(uid, {
      email,
      password: PASSWORD,
      displayName,
      emailVerified: true,
      disabled: false,
    });
    return existing.uid;
  } catch (err) {
    if (err?.code !== 'auth/user-not-found') {
      // Maybe uid missing but email exists
      try {
        const byEmail = await auth.getUserByEmail(email);
        await auth.updateUser(byEmail.uid, {
          password: PASSWORD,
          displayName,
          emailVerified: true,
          disabled: false,
        });
        console.warn(`Auth user ${email} already existed as ${byEmail.uid}; expected uid ${uid}. Update userAccounts manually if needed.`);
        return byEmail.uid;
      } catch {
        // create below
      }
    }
  }

  const created = await auth.createUser({
    uid,
    email,
    password: PASSWORD,
    displayName,
    emailVerified: true,
  });
  return created.uid;
}

function nowIso() {
  return new Date().toISOString();
}

async function main() {
  assertSafeToRun();

  initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });

  const auth = getAuth();
  const db = getFirestore();
  const ts = nowIso();

  const leaderPersonId = 'person_leader';
  const assistantPersonId = 'person_assistant';
  const ministerPersonId = 'person_minister';
  const newcomer1Id = 'person_newcomer_1';
  const newcomer2Id = 'person_newcomer_2';

  const leaderUid = await ensureAuthUser(auth, {
    uid: 'uid_leader',
    email: 'leader@ieec.demo',
    displayName: 'Sarah Leader',
  });
  const assistantUid = await ensureAuthUser(auth, {
    uid: 'uid_assistant',
    email: 'assistant@ieec.demo',
    displayName: 'Abel Assistant',
  });
  const ministerUid = await ensureAuthUser(auth, {
    uid: 'uid_minister',
    email: 'minister@ieec.demo',
    displayName: 'Marta Minister',
  });

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
  const set = (col, id, data) =>
    batch.set(db.collection(col).doc(id), { ...data, organizationId: ORG_ID }, { merge: true });

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
    [leaderUid, leaderPersonId, 'leader@ieec.demo'],
    [assistantUid, assistantPersonId, 'assistant@ieec.demo'],
    [ministerUid, ministerPersonId, 'minister@ieec.demo'],
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

  set('ministries', MINISTRY_ID, {
    name: 'Young Adult',
    status: 'active',
    createdAt: ts,
    updatedAt: ts,
  });
  set('teams', TEAM_ID, {
    ministryId: MINISTRY_ID,
    name: 'Follow-Up',
    description: 'Newcomer shepherding',
    moduleKey: 'follow_up',
    teamStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  });
  set('teams', 'team_bible_study', {
    ministryId: MINISTRY_ID,
    name: 'Bible Study',
    description: 'Groups and classes',
    moduleKey: 'bible_study',
    teamStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  });
  set('teams', 'team_media', {
    ministryId: MINISTRY_ID,
    name: 'Media',
    description: 'Production and communications',
    moduleKey: 'media',
    teamStatus: 'active',
    createdAt: ts,
    updatedAt: ts,
  });

  const mkTm = (teamId, personId, titleLabel = null) => ({
    teamId,
    personId,
    membershipStatus: 'active',
    titleLabel,
    createdAt: ts,
    updatedAt: ts,
  });
  set('teamMemberships', 'tm_leader_fu', mkTm(TEAM_ID, leaderPersonId, 'Follow-Up Leader'));
  set('teamMemberships', 'tm_assistant_fu', mkTm(TEAM_ID, assistantPersonId, 'Assistant Leader'));
  set('teamMemberships', 'tm_minister_fu', mkTm(TEAM_ID, ministerPersonId, 'Minister'));

  await batch.commit();

  console.log('Bootstrapped Firebase project:', PROJECT_ID);
  console.log(`Staff password: ${PASSWORD}`);
  console.log('  leader@ieec.demo');
  console.log('  assistant@ieec.demo');
  console.log('  minister@ieec.demo');
  console.log('Next: set Vercel env VITE_USE_DEMO=false + Firebase web config, then redeploy.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
