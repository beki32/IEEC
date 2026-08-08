# Firebase production setup (IEEC YA Connect)

The web app defaults to **demo mode**. Follow this checklist to run against real Firebase Auth + Firestore.

## 1. Create / confirm the Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/) → project **`ieec-ya-connect-a1ae1`**
2. Enable **Authentication → Sign-in method → Email/Password**
3. Create a **Cloud Firestore** database if you have not already (production mode is fine — we deploy rules next)
4. (Optional) Enable **Storage** later for photos

## 2. Web app config (already registered)

Project ID: **`ieec-ya-connect-a1ae1`**

Paste these into Vercel (Production + Preview):

```bash
VITE_USE_DEMO=false
VITE_USE_FIREBASE_EMULATORS=false
VITE_FIREBASE_API_KEY=AIzaSyC3q0X39QtmqSwlAHx8fiWk9Fl0ZxgqxC8
VITE_FIREBASE_AUTH_DOMAIN=ieec-ya-connect-a1ae1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ieec-ya-connect-a1ae1
VITE_FIREBASE_STORAGE_BUCKET=ieec-ya-connect-a1ae1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1061724194168
VITE_FIREBASE_APP_ID=1:1061724194168:web:08b363171c3b37330db48d
VITE_FIREBASE_MEASUREMENT_ID=G-0RSD7DJ59Q
```

## 3. Set Vercel Production env vars

Project **ieec-web** → Settings → Environment Variables → add the block above for **Production** (and Preview if you want).

Redeploy Production after saving.

Authorized domains: Authentication → Settings → **Authorized domains** → add:

- `ieec-web.vercel.app`
- `localhost` (for local testing)

## 4. Deploy rules + indexes (from this repo)

```bash
# one-time: login with a Google account that owns the Firebase project
npx firebase-tools login

# confirm project
npx firebase-tools use ieec-ya-connect-a1ae1

# deploy Firestore rules + indexes
npm run firebase:deploy
```

## 5. Bootstrap org + staff accounts

This creates the organization, roles, demo-shaped staff users, and sample newcomers **once**.

1. Firebase Console → Project settings → Service accounts → **Generate new private key**
2. Save the JSON locally (do not commit it)
3. Run:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/serviceAccount.json"
export FIREBASE_PROJECT_ID="ieec-ya-connect-a1ae1"
export ALLOW_FIREBASE_BOOTSTRAP=YES
npm run seed:bootstrap
```

Default staff logins after bootstrap:

| Email | Password | Role |
| --- | --- | --- |
| `leader@ieec.demo` | `demo-password` | Follow-Up Leader |
| `assistant@ieec.demo` | `demo-password` | Assistant |
| `minister@ieec.demo` | `demo-password` | Minister |

**Change these passwords** (or recreate with real emails) before sharing with the ministry team.

## 6. Verify

1. Open https://ieec-web.vercel.app/login
2. Sign in with `leader@ieec.demo` / `demo-password`
3. You should see live Firestore data (not the browser-only demo store)

If login fails: check Auth email/password enabled, authorized domain, and that `userAccounts/{uid}` exists for that Auth user.

### “Missing or insufficient permissions” on login

Auth succeeded, but Firestore blocked reading your staff data. Fix:

1. `npm run firebase:deploy` (rules are still the default deny-all until you deploy)
2. `npm run seed:bootstrap` (creates `userAccounts` + org data)
3. Confirm Vercel has `VITE_USE_DEMO=false` and the Firebase web keys, then redeploy
4. Retry `leader@ieec.demo` / `demo-password`

## Local emulator (optional)

```bash
npm run emulators          # terminal 1
npm run seed:emulator      # terminal 2
cp apps/web/.env.example apps/web/.env.local
# set VITE_USE_DEMO=false and VITE_USE_FIREBASE_EMULATORS=true
npm run dev:web
```

## Security notes

- Never commit service account JSON or `.env.local`
- `userAccounts` writes are denied to clients (rules) — bootstrap / Admin SDK / future Cloud Functions only
- Tighten rules further before a wide public launch
