import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import type { DemoState } from './demoStore';

type Row = { id: string } & Record<string, unknown>;

async function loadOrgCollection(db: Firestore, name: string, organizationId: string): Promise<Row[]> {
  const snap = await getDocs(query(collection(db, name), where('organizationId', '==', organizationId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function hydrateDemoStateFromFirestore(
  db: Firestore,
  organizationId: string,
  seedVersion: number,
): Promise<DemoState> {
  const orgSnap = await getDoc(doc(db, 'organizations', organizationId));
  if (!orgSnap.exists()) {
    throw new Error(`Organization ${organizationId} not found in Firestore. Run the emulator seed script first.`);
  }
  const organization = orgSnap.data() as DemoState['organization'];

  const [
    ministries,
    teams,
    teamMemberships,
    people,
    userAccounts,
    roleTemplates,
    roleAssignments,
    overrides,
    journeys,
    assignments,
    reports,
    attendance,
    bioEntries,
    calendarEvents,
    chatChannels,
    chatMemberships,
    chatMessages,
    notifications,
    auditLogs,
  ] = await Promise.all([
    loadOrgCollection(db, 'ministries', organizationId),
    loadOrgCollection(db, 'teams', organizationId),
    loadOrgCollection(db, 'teamMemberships', organizationId),
    loadOrgCollection(db, 'people', organizationId),
    loadOrgCollection(db, 'userAccounts', organizationId),
    loadOrgCollection(db, 'roleTemplates', organizationId),
    loadOrgCollection(db, 'roleAssignments', organizationId),
    loadOrgCollection(db, 'permissionOverrides', organizationId),
    loadOrgCollection(db, 'newcomerJourneys', organizationId),
    loadOrgCollection(db, 'followUpAssignments', organizationId),
    loadOrgCollection(db, 'followUpReports', organizationId),
    loadOrgCollection(db, 'newcomerAttendance', organizationId),
    loadOrgCollection(db, 'newcomerBioEntries', organizationId),
    loadOrgCollection(db, 'calendarEvents', organizationId),
    loadOrgCollection(db, 'chatChannels', organizationId),
    loadOrgCollection(db, 'chatMemberships', organizationId),
    loadOrgCollection(db, 'chatMessages', organizationId),
    loadOrgCollection(db, 'notifications', organizationId),
    loadOrgCollection(db, 'auditLogs', organizationId),
  ]);

  return {
    seedVersion,
    organization: {
      id: organizationId,
      name: organization.name,
      timezone: organization.timezone,
      status: organization.status,
    },
    ministries: ministries as unknown as DemoState['ministries'],
    teams: teams as unknown as DemoState['teams'],
    teamMemberships: teamMemberships as unknown as DemoState['teamMemberships'],
    people: people as unknown as DemoState['people'],
    userAccounts: userAccounts as unknown as DemoState['userAccounts'],
    roleTemplates: roleTemplates as unknown as DemoState['roleTemplates'],
    roleAssignments: roleAssignments as unknown as DemoState['roleAssignments'],
    overrides: overrides as unknown as DemoState['overrides'],
    journeys: journeys as unknown as DemoState['journeys'],
    assignments: assignments as unknown as DemoState['assignments'],
    reports: reports as unknown as DemoState['reports'],
    attendance: attendance as unknown as DemoState['attendance'],
    bioEntries: bioEntries as unknown as DemoState['bioEntries'],
    calendarEvents: calendarEvents as unknown as DemoState['calendarEvents'],
    chatChannels: chatChannels as unknown as DemoState['chatChannels'],
    chatMemberships: chatMemberships as unknown as DemoState['chatMemberships'],
    chatMessages: chatMessages as unknown as DemoState['chatMessages'],
    notifications: notifications as unknown as DemoState['notifications'],
    announcements: [],
    sermons: [],
    prayerRequests: [],
    meetingNotes: [],
    teamTasks: [],
    auditLogs: auditLogs as unknown as DemoState['auditLogs'],
    sessionAuthUid: null,
  };
}

export async function persistDemoStateToFirestore(db: Firestore, state: DemoState) {
  const pending: Array<{ path: string; id: string; data: Record<string, unknown> }> = [];

  const writeRows = (collectionName: string, rows: Array<{ id: string }>) => {
    for (const row of rows) {
      const { id: rowId, ...rest } = row as Row;
      pending.push({
        path: collectionName,
        id: rowId,
        data: { ...rest, organizationId: state.organization.id },
      });
    }
  };

  writeRows('ministries', state.ministries);
  writeRows('teams', state.teams);
  writeRows('teamMemberships', state.teamMemberships);
  writeRows('people', state.people);
  writeRows('roleTemplates', state.roleTemplates);
  writeRows('roleAssignments', state.roleAssignments);
  writeRows('permissionOverrides', state.overrides);
  writeRows('newcomerJourneys', state.journeys);
  writeRows('followUpAssignments', state.assignments);
  writeRows('followUpReports', state.reports);
  writeRows('newcomerAttendance', state.attendance);
  writeRows('newcomerBioEntries', state.bioEntries);
  writeRows('calendarEvents', state.calendarEvents);
  writeRows('chatChannels', state.chatChannels);
  writeRows('chatMemberships', state.chatMemberships);
  writeRows('chatMessages', state.chatMessages);
  writeRows('notifications', state.notifications);
  writeRows('auditLogs', state.auditLogs);

  for (let i = 0; i < pending.length; i += 400) {
    const batch = writeBatch(db);
    for (const op of pending.slice(i, i + 400)) {
      batch.set(doc(db, op.path, op.id), op.data, { merge: true });
    }
    await batch.commit();
  }
}
