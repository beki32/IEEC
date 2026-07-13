# IEEC YA Connect Web

React + TypeScript + Firebase client for the IEEC YA Connect platform.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run test:rbac
npm run lint
```

## Environment

Copy `.env.example` to `.env` (already configured for `ieec-ya-connect` in this repo’s working tree).

## Routes

- `/login` — email/password auth
- `/` — platform home (requires auth)
- `/follow-up` — Follow-Up module (requires `follow_up.view`)
- `/register` — public newcomer registration (no account)
