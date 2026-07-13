import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { collections, db } from '../../shared/lib/firebase';
import type {
  ContactMethod,
  ContactOutcome,
  EntryVisibility,
  FollowUpEntry,
  NewcomerJourney,
} from '../../shared/types/domain';
import { writeAuditLog } from '../../engines/audit/auditService';

function mapJourney(id: string, data: Record<string, unknown>): NewcomerJourney {
  return {
    id,
    organizationId: String(data.organizationId ?? ''),
    personId: String(data.personId ?? ''),
    status: (data.status as NewcomerJourney['status']) ?? 'newly_registered',
    firstFollowUpDueAt: (data.firstFollowUpDueAt as string | null) ?? null,
    createdAt: String(data.createdAt ?? ''),
    updatedAt: String(data.updatedAt ?? ''),
    isDeleted: Boolean(data.isDeleted),
  };
}

export async function listNewcomerJourneys(organizationId: string): Promise<NewcomerJourney[]> {
  const q = query(
    collection(db, collections.newcomerJourneys),
    where('organizationId', '==', organizationId),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => mapJourney(doc.id, doc.data()));
}

export async function listUnassignedJourneys(organizationId: string): Promise<NewcomerJourney[]> {
  const q = query(
    collection(db, collections.newcomerJourneys),
    where('organizationId', '==', organizationId),
    where('status', '==', 'awaiting_assignment'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => mapJourney(doc.id, doc.data()));
}

export async function createFollowUpEntry(input: {
  organizationId: string;
  journeyId: string;
  personId: string;
  assignedMinisterPersonId?: string;
  contactAt: string;
  contactMethod: ContactMethod;
  contactOutcome: ContactOutcome;
  summary: string;
  visibility?: EntryVisibility;
  createdByPersonId: string;
  actorUid: string;
}): Promise<string> {
  const payload = {
    organizationId: input.organizationId,
    journeyId: input.journeyId,
    personId: input.personId,
    assignedMinisterPersonId: input.assignedMinisterPersonId ?? null,
    contactAt: input.contactAt,
    contactMethod: input.contactMethod,
    contactOutcome: input.contactOutcome,
    summary: input.summary,
    visibility: input.visibility ?? 'general_follow_up_history',
    createdByPersonId: input.createdByPersonId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false,
  };

  const ref = await addDoc(collection(db, collections.followUpEntries), payload);
  await writeAuditLog({
    organizationId: input.organizationId,
    actorUid: input.actorUid,
    action: 'follow_up.entry.create',
    entityType: 'followUpEntries',
    entityId: ref.id,
    metadata: { journeyId: input.journeyId, personId: input.personId },
  });
  return ref.id;
}

export async function submitPublicRegistration(input: {
  organizationId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  preferredContactMethod?: string;
  prayerRequest?: string;
  consentToContact: boolean;
}) {
  await addDoc(collection(db, collections.publicRegistrations), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export type { FollowUpEntry };
