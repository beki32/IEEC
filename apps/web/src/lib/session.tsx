import { can, type PermissionKey, type Person, type Organization } from '@ieec/shared';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { demoStore } from './demoStore';

interface SessionValue {
  person: Person | null;
  organization: Organization | null;
  permissions: Set<PermissionKey>;
  refresh: () => void;
  login: (email: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  has: (permission: PermissionKey) => boolean;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const value = useMemo(() => {
    void tick;
    const session = demoStore.getSession();
    const permissions = session?.permissions ?? new Set<PermissionKey>();
    return {
      person: session?.person ?? null,
      organization: session?.organization ?? null,
      permissions,
      refresh,
      login: (email: string) => {
        const result = demoStore.login(email);
        refresh();
        return result.ok ? { ok: true as const } : { ok: false as const, error: result.error };
      },
      logout: () => {
        demoStore.logout();
        refresh();
      },
      has: (permission: PermissionKey) => can(permissions, permission),
    };
  }, [tick, refresh]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession requires SessionProvider');
  return ctx;
}
