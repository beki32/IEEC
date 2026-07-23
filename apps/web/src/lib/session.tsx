import { can, type PermissionKey, type Person, type Organization } from '@ieec/shared';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { demoStore, DEMO_SEED_VERSION } from './demoStore';
import { getFirebaseAuth, getFirestoreDb, isDemoMode } from './firebase';
import { hydrateDemoStateFromFirestore } from './firestoreSync';

interface SessionValue {
  person: Person | null;
  organization: Organization | null;
  permissions: Set<PermissionKey>;
  mode: 'demo' | 'firebase';
  refresh: () => void;
  login: (
    email: string,
    password?: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  has: (permission: PermissionKey) => boolean;
}

const SessionContext = createContext<SessionValue | null>(null);

async function hydrateFirebaseSession(authUid: string) {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  const accountSnap = await getDoc(doc(db, 'userAccounts', authUid));
  if (!accountSnap.exists()) {
    throw new Error('No userAccounts document for this Auth UID. Seed the emulator/project first.');
  }
  const account = accountSnap.data() as { organizationId: string; accountStatus?: string };
  if (account.accountStatus && account.accountStatus !== 'active') {
    throw new Error('Account is not active');
  }
  const state = await hydrateDemoStateFromFirestore(db, account.organizationId, DEMO_SEED_VERSION);
  state.sessionAuthUid = authUid;
  const ua = state.userAccounts.find((a) => a.id === authUid);
  if (ua) ua.lastLoginAt = new Date().toISOString();
  demoStore.adoptFirebaseState(state);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);
  const [authReady, setAuthReady] = useState(isDemoMode());
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (isDemoMode()) {
      setAuthReady(true);
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await hydrateFirebaseSession(user.uid);
        } else {
          demoStore.clearFirebaseRuntime();
        }
      } catch (err) {
        console.warn('Firebase session hydrate failed', err);
        demoStore.clearFirebaseRuntime();
      } finally {
        setAuthReady(true);
        refresh();
      }
    });
    return () => unsub();
  }, [refresh]);

  const value = useMemo(() => {
    void tick;
    const session = demoStore.getSession();
    const permissions = session?.permissions ?? new Set<PermissionKey>();
    return {
      person: session?.person ?? null,
      organization: session?.organization ?? null,
      permissions,
      mode: (isDemoMode() ? 'demo' : 'firebase') as 'demo' | 'firebase',
      refresh,
      login: async (email: string, password = 'demo-password') => {
        if (isDemoMode()) {
          const result = demoStore.login(email);
          refresh();
          return result.ok ? { ok: true as const } : { ok: false as const, error: result.error };
        }
        const auth = getFirebaseAuth();
        if (!auth) {
          return { ok: false as const, error: 'Firebase Auth is not configured' };
        }
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          await hydrateFirebaseSession(cred.user.uid);
          refresh();
          return { ok: true as const };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Sign-in failed';
          return { ok: false as const, error: message };
        }
      },
      logout: async () => {
        if (!isDemoMode()) {
          const auth = getFirebaseAuth();
          if (auth) await signOut(auth);
          demoStore.clearFirebaseRuntime();
        } else {
          demoStore.logout();
        }
        refresh();
      },
      has: (permission: PermissionKey) => can(permissions, permission),
    };
  }, [tick, refresh]);

  if (!authReady) {
    return <div className="main"><p className="muted">Loading session…</p></div>;
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession requires SessionProvider');
  return ctx;
}
