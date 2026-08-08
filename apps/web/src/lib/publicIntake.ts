import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { normalizeEmail } from '@ieec/shared';
import { demoStore } from './demoStore';
import { getFirestoreDb, isDemoMode } from './firebase';
import { DEFAULT_ORG_ID } from './orgConstants';
import type { ChurchAnnouncement, PrayerRequest, SermonOrDevotional } from './publicContent';

const MAX_INLINE_PHOTO_CHARS = 180_000;

export async function submitPublicRegistration(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: string;
  contactMethod: string;
  photoUrl?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const db = getFirestoreDb();
  if (!db) {
    return { ok: false, message: 'Registration is not connected to Firebase yet.' };
  }

  const photoUrl =
    input.photoUrl && input.photoUrl.length <= MAX_INLINE_PHOTO_CHARS ? input.photoUrl : null;

  try {
    const ref = await addDoc(collection(db, 'publicRegistrations'), {
      organizationId: DEFAULT_ORG_ID,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim(),
      emailNormalized: normalizeEmail(input.email),
      phone: input.phone.trim(),
      sex: input.sex,
      contactMethod: input.contactMethod,
      photoUrl,
      status: 'pending',
      source: 'public_web',
      createdAt: new Date().toISOString(),
    });
    return { ok: true, id: ref.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return { ok: false, message };
  }
}

export async function submitPublicPrayerRequest(input: {
  name: string;
  email: string | null;
  request: string;
  isPrivate: boolean;
}): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const db = getFirestoreDb();
  if (!db) {
    return { ok: false, message: 'Prayer form is not connected to Firebase yet.' };
  }

  try {
    const ref = await addDoc(collection(db, 'prayerRequests'), {
      organizationId: DEFAULT_ORG_ID,
      name: input.name.trim(),
      email: input.email?.trim() || null,
      request: input.request.trim(),
      isPrivate: input.isPrivate,
      status: 'received',
      createdAt: new Date().toISOString(),
    });
    return { ok: true, id: ref.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not submit prayer request';
    return { ok: false, message };
  }
}

export async function loadPublishedPublicContent(): Promise<{
  announcements: ChurchAnnouncement[];
  sermons: SermonOrDevotional[];
  events: Array<{
    id: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
  }>;
}> {
  const db = getFirestoreDb();
  if (!db || isDemoMode()) {
    return {
      announcements: demoStore.listAnnouncements(),
      sermons: demoStore.listSermons(),
      events: demoStore.listUpcomingPublicEvents(5).map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        startAt: e.startAt,
        endAt: e.endAt,
      })),
    };
  }

  const [annSnap, sermonSnap, eventSnap] = await Promise.all([
    getDocs(query(collection(db, 'announcements'), where('organizationId', '==', DEFAULT_ORG_ID))),
    getDocs(query(collection(db, 'sermons'), where('organizationId', '==', DEFAULT_ORG_ID))),
    getDocs(query(collection(db, 'calendarEvents'), where('organizationId', '==', DEFAULT_ORG_ID))),
  ]);

  const announcements = annSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<ChurchAnnouncement, 'id'>) }))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.publishedAt.localeCompare(a.publishedAt);
    });

  const sermons = sermonSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<SermonOrDevotional, 'id'>) }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const now = Date.now();
  const events = eventSnap.docs
    .map((d) => {
      const data = d.data() as {
        title?: string;
        description?: string;
        startAt?: string;
        endAt?: string;
        eventStatus?: string;
      };
      return {
        id: d.id,
        title: data.title || 'Event',
        description: data.description || '',
        startAt: data.startAt || '',
        endAt: data.endAt || '',
        eventStatus: data.eventStatus,
      };
    })
    .filter((e) => e.startAt && new Date(e.startAt).getTime() >= now && e.eventStatus !== 'cancelled')
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 5)
    .map(({ eventStatus: _status, ...rest }) => rest);

  return { announcements, sermons, events };
}

/** Pull pending public registrations into people/journeys for the signed-in staff session. */
export async function ingestPendingPublicRegistrations(): Promise<number> {
  const db = getFirestoreDb();
  if (!db || !demoStore.isFirebaseRuntime()) return 0;

  const orgId = demoStore.getState().organization.id;
  const snap = await getDocs(
    query(collection(db, 'publicRegistrations'), where('organizationId', '==', orgId)),
  );

  let processed = 0;
  for (const row of snap.docs) {
    const data = row.data() as {
      status?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      sex?: string;
      contactMethod?: string;
      photoUrl?: string | null;
    };
    if (data.status && data.status !== 'pending') continue;

    const result = demoStore.registerNewcomer({
      firstName: data.firstName || 'Friend',
      lastName: data.lastName || 'Newcomer',
      email: data.email || `${row.id}@unknown.ieec`,
      phone: data.phone || '0000000000',
      sex: data.sex || 'unspecified',
      contactMethod: data.contactMethod || 'text',
      photoUrl: data.photoUrl ?? null,
    });

    try {
      await updateDoc(doc(db, 'publicRegistrations', row.id), {
        status: result.ok ? 'processed' : result.error === 'already_registered' ? 'duplicate' : 'failed',
        processedAt: new Date().toISOString(),
        personId: result.ok ? result.person.id : null,
        processError: result.ok ? null : result.message,
      });
      processed += 1;
    } catch (err) {
      console.warn('Failed to mark public registration processed', row.id, err);
    }
  }

  return processed;
}

export type { PrayerRequest };
