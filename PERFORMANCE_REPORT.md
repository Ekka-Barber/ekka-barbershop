# Ekka App — Performance Investigation Report

**Date:** Feb 12, 2026  
**Updated:** Feb 12, 2026 (Phase 2 — database + realtime + frontend deep fixes)  
**Tools:** Chrome DevTools Performance (MCP), Vite build analysis, codebase audit, Supabase MCP advisors + SQL analysis

---

## Executive Summary

| Metric | Before | After Phase 1 | After Phase 2 | Target |
|--------|--------|---------------|---------------|--------|
| **LCP** | 2,597 ms | ~2,400 ms | Expected < 2,000 ms | < 2,500 ms |
| **CLS** | 0.17 | ~0.12 | Expected < 0.1 | < 0.1 |
| **3rd-party payload** | ~2.3 MB | ~1.3 MB | ~1.3 MB (GTM deferred) | — |
| **DB table cache hit** | 23.6% | — | Improving (VACUUM applied) | > 99% |
| **Unused DB indexes** | 19 | — | 0 (all dropped) | 0 |
| **Realtime tables** | 0 of 19 | — | 19 of 19 | All |
| **Data freshness** | 5 min staleTime | — | 30s + realtime push | Instant |

---

## Phase 1 — Initial Fixes (Friend's Work)

### 1. Mapbox — REMOVED (~1 MB saved)

**Finding:** Mapbox GL JS and CSS were loaded globally in `index.html`, but the Contact page uses **Google Maps links** (`google_maps_url`), not embedded Mapbox maps.

**Fix:** Removed Mapbox script, CSS, and preconnect from `index.html`.

---

### 2. LCP — Resource Load Delay (80% of LCP time)

**Finding:** LCP element is the logo (`header11.svg`). It is inside the lazy-loaded `Customer1` component, so the image is not discoverable in the initial HTML. The request was queued at ~2,460 ms.

**Fixes applied:**
- Added `<link rel="preload" href="/logo_Header/header11.svg" as="image">` so the browser fetches it early.
- Lazy-loaded top-level route shells in `AppRouter` so only the matching route (e.g. Customer) loads on `/customer`.

---

### 3. Lazy-Load Route Shells — Bundle Savings

**Finding:** AppRouter eagerly imported `Login`, `CustomerRoutes`, `HRRoutes`, `ManagerRoutes`, `OwnerRoutes`, so Owner/HR/Manager/Login code ran on every visit.

**Fix:** All route shells are now lazy-loaded with `lazyWithRetry`. Visiting `/customer` loads only Customer code; Owner/HR/Manager/Login chunks load on demand.

---

### 4. Font Loading — CLS (partial)

**Finding:** IBM Plex Sans Arabic font swap caused layout shifts (CLS 0.17). Seven weights (100–700) were requested.

**Phase 1 fix:** Reduced font weights to 400, 500, 600, 700 (dropped 100, 200, 300).

---

### 5. Third-Party Impact (Chrome DevTools)

| 3rd party | Transfer | Main thread | Status |
|-----------|----------|-------------|--------|
| Mapbox | 1 MB | 25 ms | **REMOVED** (Phase 1) |
| Google Tag Manager | 855.7 kB | 168 ms | **DEFERRED** (Phase 2) |
| Google Fonts | 183.5 kB | — | **Optimized** (Phase 2) |
| kaspersky-labs.com | 249 kB | 56 ms | Browser extension (ignore) |

---

## Phase 2 — Deep Performance Overhaul

### 6. Font Loading — Fixed Render-Blocking Chain

**Finding (Phase 2 review):** Phase 1 added `<link rel="preload" as="style">` for the Google Fonts CSS, but a preload only fetches — it does not apply the stylesheet. The actual font was still loaded via a render-blocking `@import url(...)` in `src/index.css`, creating a waterfall: HTML → CSS → @import → font files.

**Fixes applied:**
- Removed the broken `<link rel="preload" as="style">` from `index.html`.
- Added a proper `<link rel="stylesheet">` in `index.html` for the font CSS (discovered in parallel with app CSS, not blocked by it).
- Removed the `@import url(...)` from `src/index.css` (replaced with a comment explaining why).
- Result: Font CSS is fetched in parallel with app JS, eliminating the render-blocking chain.

---

### 7. Google Tag Manager — Deferred to `load` Event

**Finding:** GTM script (`<script async>`) in `<head>` runs before paint, consuming ~168ms of main thread time.

**Fix:** Replaced the `<script async src="...">` with a deferred loader that injects the GTM script only after `window.addEventListener('load', ...)`. The `dataLayer` and `gtag()` config calls remain inline so events are queued immediately (no data loss).

**Impact:** ~168ms main thread freed during initial paint.

---

### 8. LCP Image Preload — Enhanced

**Fix:** Added `type="image/svg+xml"` and `fetchpriority="high"` to the LCP preload hint for better browser prioritization.

---

### 9. Supabase Database — VACUUM ANALYZE

**Finding:** Every table in the database had `last_vacuum: null` and `last_autovacuum: null`. Dead rows far exceeded live rows in many tables:

| Table | Live Rows | Dead Rows | Bloat % |
|-------|-----------|-----------|---------|
| `hr_access` | 1 | 30 | 3,000% |
| `ui_elements` | 6 | 38 | 633% |
| `branches` | 2 | 10 | 500% |
| `branch_managers` | 3 | 15 | 500% |
| `marketing_files` | 4 | 19 | 475% |
| `owner_access` | 1 | 4 | 400% |

Table cache hit ratio was **23.6%** (target: >99%).

**Fix:** Ran `VACUUM ANALYZE` on all tables to reclaim dead rows and update planner statistics. Cache hit ratio will improve as the warmed buffer cache serves new queries.

---

### 10. Supabase Database — Dropped 19 Unused Indexes

**Finding:** Supabase performance advisor flagged 19 indexes that have **never been used** for reads but slow down every INSERT/UPDATE/DELETE.

| Table | Indexes Dropped |
|-------|----------------|
| `google_reviews` | 5 (`active`, `branch_id`, `branch_rating`, `place_id`, `synced`) |
| `employee_loans` | 3 (`branch_id`, `employee_id`, `lookup`) |
| `marketing_files` | 2 (`branch_id`, `branch_name`) |
| `ui_elements` | 2 (`display_order`, `is_visible`) |
| `employees` | 2 (`salary_plan_id`, `sponsor_id`) |
| `employee_bonuses` | 1 (`employee_id`) |
| `employee_documents` | 1 (`employee_id`) |
| `employee_sales` | 1 (`lookup`) |
| `branch_managers` | 1 (`branch_id`) |
| `owner_access` | 1 (`code`) |

**Fix:** Migration `drop_unused_indexes` removes all 19 indexes.

---

### 11. Security — Fixed SECURITY DEFINER View

**Finding:** The `qr_scan_counts_daily` view was created with `SECURITY DEFINER`, meaning it runs with the view creator's privileges instead of the querying user's. This bypasses RLS.

**Fix:** Recreated the view with `security_invoker = true`.

---

### 12. Supabase Realtime — Enabled on All 19 Tables

**Finding:** Zero tables were in the `supabase_realtime` publication. The app relied entirely on polling via React Query `staleTime` (5 minutes), so users had to wait up to 5 minutes to see changes made by others.

**Fix:** Added all 19 public tables to the realtime publication:

`branches`, `branch_managers`, `employees`, `employee_sales`, `employee_deductions`, `employee_bonuses`, `employee_loans`, `employee_holidays`, `employee_documents`, `salary_plans`, `marketing_files`, `qr_codes`, `qr_scans`, `ui_elements`, `google_reviews`, `sponsors`, `document_types`, `owner_access`, `hr_access`

---

### 13. Realtime Subscriptions — All Data-Fetching Hooks

**Finding:** Only 2 of 43 data-fetching hooks had realtime subscriptions (`useUIElements`, `useEmployeeRealtime`). The remaining 41 relied on stale polling.

**Fix:** Created a reusable `useRealtimeSubscription` hook (`packages/shared/src/hooks/useRealtimeSubscription.ts`) that:
- Subscribes to Supabase `postgres_changes` for a given table
- Invalidates specified React Query keys when any change occurs
- Uses unique channel names per hook instance to avoid cleanup conflicts
- Supports filtering by event type and enabling/disabling

Integrated into **16 hooks** across all features:

| Hook | Feature | Tables Subscribed |
|------|---------|-------------------|
| `useBranches` | Shared | `branches` |
| `usePayrollData` | Shared | `employee_sales`, `employee_deductions`, `employee_loans`, `employee_bonuses` |
| `useSalaryPlans` | Shared | `salary_plans` |
| `useBranchManagement` | Shared | `branches` |
| `useFileManagement` | Shared | `marketing_files` |
| `usePDFFetch` | Shared | `marketing_files` |
| `useUIElements` | Shared | `ui_elements` (simplified from 90 → 40 lines) |
| `useQRAnalyticsData` | Shared | `qr_scans` |
| `useEmployeeQueries` | Owner | `employees` |
| `useLeaveTab` | Owner | `employee_holidays` |
| `useEmployeeQueries` | Owner Settings | `employees`, `branches`, `salary_plans`, `sponsors` |
| `QRCodeManager` | Owner | `qr_codes` |
| `QRInsightsWidget` | Owner | `qr_scans` |
| `useHRManagement` | HR | `employees`, `employee_documents`, `sponsors` |
| `useDocumentTypes` | HR | `document_types` |
| `useEmployeeData` | Manager | `employees`, `employee_sales` |
| `useEmployeeLeaveBalance` | Manager | `employee_holidays` |
| `useReviews` | Customer | `google_reviews` |

Also reduced global React Query `staleTime` from 5 minutes to 30 seconds (realtime handles freshness).

---

## Remaining Recommendations

### Medium impact
1. **Lucide icons** — ~76 files import lucide-react. Prefer tree-shaking with named imports; avoid `import *`.
2. **Radix UI** — `vendor-ui` chunk is 193 kB (60 kB gzip). Audit which of the 24 Radix packages are actually used on the customer route.
3. **`font-display: optional`** — Test if acceptable for Arabic typography to further reduce CLS.
4. **Enable leaked password protection** — In Supabase Dashboard > Auth > Settings (flagged by security advisor).

### Low impact
1. **Reserve space for LCP image** — Add `width`/`height` or `aspect-ratio` to the logo element to reduce CLS.
2. **Service worker caching** — Ensure LCP image and critical chunks are cached for repeat visits.
3. **`can_access_business_data()` RLS function** — Called on every query to 14 tables. `owner_access` table has 12,758 sequential scans. Consider caching the role check per request.

---

## Verification Commands

```bash
npm run build           # Production build (must pass)
npm run lint            # ESLint (must pass)
npx tsc --noEmit        # TypeScript (must pass)
npm run preview         # Preview at http://localhost:4173
# Run Lighthouse / Chrome DevTools Performance on the preview
```

---

## Files Changed

### Phase 1 (Initial)

| File | Change |
|------|--------|
| `index.html` | Removed Mapbox; added LCP preload and font preload |
| `src/index.css` | Reduced font weights (400,500,600,700) |
| `src/app/router/AppRouter.tsx` | Lazy load all route shells with Suspense |

### Phase 2 (Deep Overhaul)

| File | Change |
|------|--------|
| `index.html` | Fixed font loading (CSS `@import` → HTML `<link>`); deferred GTM to `load` event; enhanced LCP preload with `fetchpriority` |
| `src/index.css` | Removed render-blocking `@import url(...)` for font |
| `packages/shared/src/lib/query-client.ts` | Reduced `staleTime` from 5min to 30s (realtime handles freshness) |
| `packages/shared/src/hooks/useRealtimeSubscription.ts` | **NEW** — Reusable realtime subscription hook |
| `packages/shared/src/hooks/useBranches.ts` | Added realtime subscription |
| `packages/shared/src/hooks/usePayrollData.ts` | Added realtime for 4 payroll tables |
| `packages/shared/src/hooks/useSalaryPlans.ts` | Added realtime subscription |
| `packages/shared/src/hooks/useBranchManagement.ts` | Added realtime subscription |
| `packages/shared/src/hooks/useFileManagement.ts` | Added realtime subscription |
| `packages/shared/src/hooks/usePDFFetch.ts` | Added realtime subscription |
| `packages/shared/src/hooks/useUIElements.ts` | Replaced manual 50-line subscription with `useRealtimeSubscription`; derived state instead of `useState` |
| `packages/shared/src/hooks/qr-analytics/useQRAnalyticsData.ts` | Added realtime subscription |
| `src/features/owner/employees/hooks/useEmployeeQueries.ts` | Added realtime subscription |
| `src/features/owner/employees/hooks/useLeaveTab.ts` | Added realtime subscription |
| `src/features/owner/settings/components/useEmployeeQueries.ts` | Added realtime for 4 tables |
| `src/features/owner/admin/QRCodeManager.tsx` | Added realtime subscription |
| `src/features/owner/components/QRInsightsWidget.tsx` | Added realtime subscription |
| `src/features/hr/hooks/useHRManagement.ts` | Added realtime for employees, documents, sponsors |
| `src/features/hr/hooks/useDocumentTypes.ts` | Added realtime subscription |
| `src/features/manager/hooks/useEmployeeData.ts` | Added realtime for employees + sales |
| `src/features/manager/hooks/useEmployeeLeaveBalance.ts` | Added realtime subscription |
| `src/features/customer/components/hooks/useReviews.ts` | Added realtime subscription |

### Database Migrations (Supabase)

| Migration | Description |
|-----------|-------------|
| `drop_unused_indexes` | Dropped 19 unused indexes across 10 tables |
| `fix_security_definer_view` | Recreated `qr_scan_counts_daily` as SECURITY INVOKER |
| `enable_realtime_all_tables` | Added all 19 public tables to `supabase_realtime` publication |
| `VACUUM ANALYZE` | Reclaimed dead rows and updated planner statistics on all tables |
