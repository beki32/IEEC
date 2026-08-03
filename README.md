# IEEC YA Connect

People-centered Young Adult ministry platform — **Follow-Up first**.

| Client | Stack |
| --- | --- |
| Web | React (DOM) + TypeScript + Vite |
| Mobile | React Native (Expo) + TypeScript |
| Shared | `@ieec/shared` types + RBAC |
| Backend target | Firebase Auth + Firestore |

Planning docs remain under `docs/`. Architecture Handbook: `docs/handbook/IEEC_YA_Connect_Architecture_Handbook_v0.4.pdf`.

## Quick start (demo mode)

Demo mode uses an in-browser / in-memory store so you can run without Firebase credentials.

```bash
npm install
npm run dev:web
```

Open http://localhost:5173 — public **landing page** (announcements, events, sermons, prayer, about, Instagram).  
Newcomer registration: http://localhost:5173/register · Staff: http://localhost:5173/login

### Demo accounts

| Email | Role |
| --- | --- |
| `leader@ieec.demo` | Follow-Up Leader (+ RBAC admin) |
| `assistant@ieec.demo` | Assistant Leader (no management by default) |
| `minister@ieec.demo` | Follow-Up Minister (assigned work) |

Password field is display-only in demo mode.

Public registration (no login): http://localhost:5173/register

### Mobile (Expo)

```bash
npm run dev:mobile
# or: npm run start -w @ieec/mobile
```

Then scan the QR code with Expo Go, or press `a` / `i` for emulator.

Demo login: `minister@ieec.demo`

### Android / iOS binaries

```bash
cd apps/mobile
npx eas login
npx eas build --platform android --profile preview   # APK
npx eas build --platform ios --profile preview       # IPA (Apple Developer account)
```

See handbook Ch. 13 §13.8.1 and `apps/mobile/eas.json`.

## Workspace layout

```text
apps/web          React web app
apps/mobile       Expo React Native app
packages/shared   Types, permission catalog, RBAC resolver
firebase/         Firestore rules + indexes
docs/             Architecture + Follow-Up planning pack
```

## Firebase (Auth + Firestore)

Default remains **demo mode** (`VITE_USE_DEMO=true`). To run against emulators:

```bash
# terminal 1
npm run emulators

# terminal 2
npm run seed:emulator

# terminal 3 — copy env, then start web
cp apps/web/.env.example apps/web/.env.local
# ensure VITE_USE_DEMO=false and VITE_USE_FIREBASE_EMULATORS=true
npm run dev:web
```

Sign in with the same demo emails and password `demo-password`.

Confirm the Firebase project with a human before deploying rules or writing to production (`ieec-ya-connect` if that is yours).

Firestore rules live in `firebase/firestore.rules` (includes calendar + chat collections). Client writes hydrate through the existing app store for emulator/dev; production should move to collection-scoped repositories and stricter permission-aware rules.

## Deploy web (Vercel)

This is an npm workspaces monorepo. Deploy **`apps/web`** only.

**Recommended project settings** (or rely on `apps/web/vercel.json`):

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Root Directory | `apps/web` |
| Include files outside Root Directory | **On** |
| Install Command | `cd ../.. && npm install --workspace=@ieec/web --workspace=@ieec/shared` |
| Build Command | `cd ../.. && npm run build:web` |
| Output Directory | `dist` |

If Root Directory is left empty (repo root), use root `vercel.json` (`build:web` → `apps/web/dist`).

You currently have two linked projects (`ieec` and `ieec-web`). Keep **one** to avoid duplicate/conflicting deploys — prefer `ieec-web` with Root Directory `apps/web`.

If a Vercel dashboard Install Command override still says `cd ../.. && npm install`, change it to the scoped command above (full root install also pulls Expo/mobile tooling and is very slow).

## Stakeholder presentation

Progress & Follow-Up workflow slides (served with the web app):

- Local: http://localhost:5173/presentations/ieec-ya-connect-progress.html  
- Production: `https://<your-vercel-domain>/presentations/ieec-ya-connect-progress.html`  
- Also linked from the landing page footer as **Progress briefing**

Source: `apps/web/public/presentations/` (mirrored under `docs/presentations/`).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev:web` | Start Vite web app |
| `npm run build` / `build:web` | Production web build |
| `npm run dev:mobile` | Start Expo |
| `npm run typecheck` | Typecheck shared + web |
| `npm run emulators` | Auth + Firestore emulators |
| `npm run seed:emulator` | Seed emulator Auth/Firestore demo data |

## Coding authority

Follow `docs/AI_CODING_HANDOFF_PROMPT.md` and Handbook v0.4. Do not redesign RBAC or Follow-Up rules.
