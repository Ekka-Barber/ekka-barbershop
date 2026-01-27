# Ekka App Runbook

## Requirements
- Node.js + npm (Vite dev server)
- Supabase project credentials

## Environment Variables
Set these before running the app (optional for deploy: the app uses fallbacks for project `jfnjvphxhzxojxgptmtu` if unset):

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon or publishable key

- **Local**: add them to a `.env` file in the project root (see `.env.example`).
- **Deploy (Netlify/Vercel/etc.)**: set the same vars in the host’s environment so they are available at build time. If they are not set, the built app still loads using the built-in fallbacks.

## Install + Run
```bash
npm install
npm run dev
```

Other commands:
```bash
npm run build
npm run preview
```

## Role Entry URLs
- Customer: `/` or `/?role=customer`
- Owner: `/?role=owner` (redirects to owner login if not authenticated)
- Manager: `/?role=manager` (redirects to manager login if not authenticated)
- Legacy admin links: `/?access=...` or `/?token=...` redirect to owner login and then `/admin`

## Access Codes
- Owner access codes live in `owner_access.access_code` (no hardcoded default).
- Manager access codes live in `branch_managers.access_code`.
- Super-manager access code: `ma225` (grants access to all branches in manager tools).

## Storage Keys (Auth)
- `owner_access_code`: stored owner access code after login
- `branch_manager_code`: stored manager access code after login
- `legacy_admin_token`: legacy redirect tracking token
