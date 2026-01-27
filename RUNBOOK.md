# Ekka App Runbook

## Requirements
- Node.js + npm (Vite dev server)
- Supabase project credentials

## Environment Variables
Set these before running the app:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

You can add them to a local `.env` file in `ekka-app/`.

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
