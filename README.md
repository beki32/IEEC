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

Open http://localhost:5173

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

## Firebase (optional next step)

1. Copy `apps/web/.env.example` → `apps/web/.env.local`
2. Set `VITE_USE_DEMO=false` and fill Firebase web config
3. Deploy rules: `firebase deploy --only firestore` (project `ieec-ya-connect` if that is yours — confirm before prod)
4. Replace demo store calls with Firestore repositories (same collection shapes as `docs/modules/follow-up-firestore-data-model.md`)

Current UI implements the Follow-Up MVP flows against the **demo store** with the canonical permission keys and workflows from the baseline docs.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev:web` | Start Vite web app |
| `npm run build:web` | Production web build |
| `npm run dev:mobile` | Start Expo |
| `npm run typecheck` | Typecheck shared + web |

## Coding authority

Follow `docs/AI_CODING_HANDOFF_PROMPT.md` and Handbook v0.4. Do not redesign RBAC or Follow-Up rules.
