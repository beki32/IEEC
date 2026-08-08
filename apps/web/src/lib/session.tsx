import { can, type PermissionKey, type Person, type Organization, type Team } from '@ieec/shared';
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
  myTeams: Team[];
  activeTeam: Team | null;
  unreadCount: number;
  mode: 'demo' | 'firebase';
  refresh: () => void;
  setActiveTeam: (teamId: string) => void;
  login: (
    email: string,
    password?: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  has: (permission: PermissionKey) => boolean;
}

const SessionContext = createContext<SessionValue | null>(null);

function formatFirebaseLoginError(err: unknown): string {
  const code =
    err && typeof err === 'object' && 'code' in err ? String((err as { code?: string }).code) : '';
  const message = err instanceof Error ? err.message : 'Sign-in failed';

  // Keep detailed hydrate guidance if we already produced it.
  if (/Cannot read userAccounts|loading org data failed|Publish firebase\/firestore\.rules/i.test(message)) {
    return message;
  }

  if (code === 'permission-denied' || /missing or insufficient permissions/i.test(message)) {
    return 'Firestore blocked this login. From your laptop run: export GOOGLE_APPLICATION_CREDENTIALS="$HOME/Downloads/key.json" && npm run firebase:deploy';
  }
  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Email or password is incorrect. If this is a new project, run seed:bootstrap first.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized in Firebase Auth. Add ieec-web.vercel.app under Authentication → Settings → Authorized domains.';
  }
  if (/No userAccounts document/i.test(message)) {
    return 'Signed in to Auth, but no staff profile exists in Firestore. Run npm run seed:bootstrap.';
  }
  return message;
}

async function hydrateFirebaseSession(authUid: string) {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');

  let accountSnap;
  try {
    accountSnap = await getDoc(doc(db, 'userAccounts', authUid));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Cannot read userAccounts/${authUid}. Publish firebase/firestore.rules in Firebase Console, then retry. (${message})`,
    );
  }

  if (!accountSnap.exists()) {
    throw new Error('No userAccounts document for this Auth UID. Run npm run seed:bootstrap.');
  }
  const account = accountSnap.data() as { organizationId: string; accountStatus?: string };
  if (account.accountStatus && account.accountStatus !== 'active') {
    throw new Error('Account is not active');
  }
  if (!account.organizationId) {
    throw new Error('userAccounts doc is missing organizationId. Re-run npm run seed:bootstrap.');
  }

  try {
    const state = await hydrateDemoStateFromFirestore(db, account.organizationId, DEMO_SEED_VERSION);
    state.sessionAuthUid = authUid;
    const ua = state.userAccounts.find((a) => a.id === authUid);
    if (ua) ua.lastLoginAt = new Date().toISOString();
    demoStore.adoptFirebaseState(state);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Signed in, but loading org data failed. Re-publish firestore.rules from GitHub main, wait a few seconds, retry. (${message})`,
    );
  }
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
      myTeams: session?.myTeams ?? [],
      activeTeam: session?.activeTeam ?? null,
      unreadCount: demoStore.getSession() ? demoStore.unreadNotificationCount() : 0,
      mode: (isDemoMode() ? 'demo' : 'firebase') as 'demo' | 'firebase',
      refresh,
      setActiveTeam: (teamId: string) => {
        demoStore.setActiveTeamId(teamId);
        refresh();
      },
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
          return { ok: false as const, error: formatFirebaseLoginError(err) };
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
