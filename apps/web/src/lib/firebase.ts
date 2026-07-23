import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export function isDemoMode() {
  const flag = String(import.meta.env.VITE_USE_DEMO ?? 'true').toLowerCase();
  if (flag === 'false' || flag === '0') return false;
  // Without a project id, always stay in demo mode.
  return !firebaseConfig.projectId || !firebaseConfig.apiKey;
}

export function useFirebaseEmulators() {
  const flag = String(import.meta.env.VITE_USE_FIREBASE_EMULATORS ?? 'false').toLowerCase();
  return flag === 'true' || flag === '1';
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let emulatorsConnected = false;

export function getFirebaseApp() {
  if (isDemoMode()) return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth() {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) auth = getAuth(firebaseApp);
  maybeConnectEmulators();
  return auth;
}

export function getFirestoreDb() {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!db) db = getFirestore(firebaseApp);
  maybeConnectEmulators();
  return db;
}

function maybeConnectEmulators() {
  if (emulatorsConnected || !useFirebaseEmulators()) return;
  const authInstance = auth ?? (app ? getAuth(app) : null);
  const dbInstance = db ?? (app ? getFirestore(app) : null);
  if (!authInstance || !dbInstance) return;

  const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'http://127.0.0.1:9099';
  const fsHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
  const fsPort = Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080);

  connectAuthEmulator(authInstance, authHost, { disableWarnings: true });
  connectFirestoreEmulator(dbInstance, fsHost, fsPort);
  emulatorsConnected = true;
}
