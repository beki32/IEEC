import { useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, collections, db } from '../../shared/lib/firebase';
import type { UserProfile } from '../../shared/types/domain';
import { hasPermission } from '../rbac/evaluatePermissions';
import { AuthContext } from './authContext';

async function loadProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, collections.users, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: String(data.email ?? ''),
    displayName: data.displayName ? String(data.displayName) : undefined,
    personId: data.personId ? String(data.personId) : undefined,
    activeOrganizationId: data.activeOrganizationId
      ? String(data.activeOrganizationId)
      : undefined,
    systemRole: (data.systemRole as UserProfile['systemRole']) ?? 'standard_user',
    effectivePermissions: Array.isArray(data.effectivePermissions)
      ? (data.effectivePermissions as string[])
      : [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (next) => {
      setLoading(true);
      setError(null);
      setUser(next);
      try {
        if (next) {
          const nextProfile = await loadProfile(next.uid);
          setProfile(nextProfile);
          if (!nextProfile) {
            setError(
              'Signed in, but no /users profile was found. Seed firestore_seed/initial_admin_profile.json for this UID.',
            );
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        setProfile(null);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  async function login(email: string, password: string) {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  }

  async function logout() {
    await signOut(auth);
  }

  function can(permission: string) {
    return hasPermission(profile?.effectivePermissions, permission, profile?.systemRole);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}
