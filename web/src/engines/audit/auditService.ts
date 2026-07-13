import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { collections, db } from '../../shared/lib/firebase';

export async function writeAuditLog(input: {
  organizationId: string;
  actorUid: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await addDoc(collection(db, collections.auditLogs), {
    ...input,
    createdAt: serverTimestamp(),
  });
}
