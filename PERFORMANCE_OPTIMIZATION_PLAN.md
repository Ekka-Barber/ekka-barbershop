# Performance Optimization Plan

**Date**: 2026-01-28  
**Project**: Ekka Barbershop App  
**Build Tool**: Vite 7.1.6  
**Bundle Analyzer**: rollup-plugin-visualizer  

## Executive Summary

After completing the dead‑code cleanup (68 files removed, 10 dependencies pruned), the application’s production build currently delivers **~2.9 MB of JavaScript** and **~100 KB of CSS**. The manual chunking strategy already separates heavy libraries (PDF, charts, UI frameworks) into dedicated vendor chunks. However, several opportunities exist to reduce initial load time, improve code‑splitting granularity, and eliminate unnecessary preloads.

This document outlines a concrete action plan to achieve faster First Contentful Paint (FCP), lower Time‑to‑Interactive (TTI), and better overall perceived performance.

---

## 1. Current State Analysis

### 1.1 Bundle Size (Uncompressed)

| Category | Size (KB) | Notable Chunks |
|----------|-----------|----------------|
| **JavaScript** | 2,908 | `vendor‑jspdf` (576 KB), `vendor‑charts` (396 KB), `vendor‑ui` (212 KB), `vendor‑supabase` (168 KB), `vendor‑react` (164 KB) |
| **CSS**        |   100 | Single `index‑*.css` file (Tailwind‑generated) |
| **Total**      | ~3.0 MB | |

### 1.2 Largest Vendor Chunks

| Chunk | Size (KB) | Contents | Preloaded? |
|-------|-----------|----------|------------|
| `vendor‑jspdf` | 576 | `jspdf` + `html2canvas` | ✅ Yes |
| `vendor‑charts` | 396 | `recharts` | ❌ No |
| `vendor‑ui` | 212 | All Radix‑UI components, `class‑variance‑authority`, `clsx`, `tailwind‑merge`, `tailwindcss‑animate`, `sonner` | ✅ Yes |
| `vendor‑supabase` | 168 | `@supabase/auth‑helpers‑react`, `@supabase/auth‑ui‑react`, `@supabase/auth‑ui‑shared`, `@supabase/supabase‑js` | ✅ Yes |
| `vendor‑react` | 164 | `react`, `react‑dom`, `react‑router‑dom` | ✅ Yes |
| `vendor‑animation` | 100 | `framer‑motion` | ❌ No |
| `vendor‑dnd` | 96 | `@hello‑pangea/dnd` | ❌ No |
| `vendor‑forms` | 80 | `react‑hook‑form`, `@hookform/resolvers`, `zod` | ❌ No |
| `vendor‑dates` | 60 | `date‑fns`, `react‑day‑picker` | ❌ No |

### 1.3 Code‑Splitting & Lazy Loading

- **Route‑level splitting**: All role‑based routes (`owner/`, `manager/`, `customer/`) are wrapped with `React.lazy` + `Suspense` (see `src/app/router` and feature‑specific `routes.tsx`).
- **Dynamic imports**: Heavy libraries (`jspdf`, `html2canvas`, `recharts`) are already imported dynamically inside their respective generators/hooks.
- **Preload heuristic**: Vite automatically adds `<link rel="modulepreload">` for chunks it determines are critical for the initial render. Currently `vendor‑jspdf` is preloaded even though PDF generation is only needed in admin/manager sections.

### 1.4 Dead‑Code Status (Post‑Knip Cleanup)

- **Unused files**: 1 (false‑positive `global.d.ts`)
- **Unused dependencies**: 1 (workspace `@ekka/shared` – false positive)
- **Unused devDependencies**: 6 (testing tools – intentionally kept)
- **Unused exports**: 183 (mostly barrel‑re‑exports and internal utilities; low risk)
- **Duplicate exports**: 0 (fixed in Phase 5)

The codebase is already lean after the aggressive cleanup; further reductions will focus on runtime performance.

---

## 2. Optimization Opportunities

### 2.1 Remove Unnecessary Preloads

**Issue**: `vendor‑jspdf` (576 KB) is preloaded in `index.html`, forcing a network request for a library that is only used when generating PDFs (admin/manager pages).  
**Root cause**: Vite’s preload heuristic may see a static import of a module that dynamically imports `jspdf`/`html2canvas` and treat the vendor chunk as critical.  
**Solution**: Exclude `vendor‑jspdf` from preload by adjusting the chunking strategy or using a manual chunk function that places `jspdf`/`html2canvas` in a chunk that is not referenced by any entry point.

### 2.2 Lazy‑Load Charts by Route

**Issue**: `vendor‑charts` (396 KB) is a separate chunk but may still be loaded early if any route statically imports a component that uses `recharts`.  
**Verification**: Confirm that `recharts` is only used in owner/manager dashboards and not in the customer‑facing pages.  
**Action**: Ensure all `recharts` imports are inside lazy‑loaded route components or behind dynamic `import()`.

### 2.3 Fine‑Grained UI Component Splitting

**Opportunity**: The `vendor‑ui` chunk (212 KB) contains **all** Radix‑UI primitives. Many of these are only used in specific feature areas (e.g., `@radix‑ui/react‑navigation‑menu` may be exclusive to the customer header).  
**Trade‑off**: Splitting each Radix package into its own chunk could increase HTTP requests but allow better caching and reduce initial payload for routes that don’t need certain primitives.  
**Recommendation**: Keep current grouping for now; revisit if `vendor‑ui` becomes a bottleneck.

### 2.4 Dependency Duplication Check

**Status**: Manual chunk configuration appears clean; no obvious duplication across vendor chunks.  
**Verification**: Run `npm ls` to confirm no duplicate major versions of libraries.

### 2.5 Compression & Asset Optimization

**Current**: No pre‑compressed `.gz`/`.br` assets in `dist/`.  
**Opportunity**: Enable Vite’s `vite‑plugin‑compress` or rely on CDN/server‑side compression (e.g., Netlify, Vercel, NGINX).  
**Priority**: Medium – server‑side compression is sufficient for most deployments.

### 2.6 Image Optimization

**Observation**: The `dist/` folder contains several PNG/SVG assets (logo, og‑image).  
**Action**: Ensure all images are optimized (SVGO for vectors, Squoosh for raster). Already appears reasonable.

### 2.7 Font Loading Strategy

**Current**: Custom fonts (`IBM Plex Sans Arabic`) are loaded via `@font‑face` in `index.css`.  
**Opportunity**: Add `font‑display: swap` if not already present, and consider subsetting for Arabic glyphs.

### 2.8 Service Worker & Offline Caching

**Status**: Service worker is registered (`service‑worker.js`).  
**Optimization**: Review cache strategy to ensure critical assets are cached efficiently.

---

## 3. Action Plan

### Phase 1 – Preload Elimination (Immediate)

1. **Modify `vite.config.ts`** – Change the manual chunk for `jspdf`/`html2canvas` to a function that places them in a chunk with a name that Vite will not preload (e.g., `'pdf-runtime'`).  
   ```ts
   manualChunks(id) {
     if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
       return 'pdf-runtime';
     }
     // fall back to existing manual chunks
   }
   ```
2. **Verify** that `pdf‑runtime` is not preloaded in the generated `index.html`.
3. **Test** PDF generation still works (trigger a salary‑report download).

### Phase 2 – Chart Splitting (Immediate)

1. **Audit `recharts` imports** – confirm they are only in owner/manager dashboards.
2. **If any static import exists in a shared component**, refactor to use dynamic `import()` inside the dashboard component.
3. **Verify** `vendor‑charts` is loaded only when a dashboard route is activated.

### Phase 3 – UI Chunk Optimization (Optional)

1. **Analyze Radix‑UI usage per route** using `stats.html` or `rollup‑plugin‑visualizer`.
2. **If justified**, split `vendor‑ui` into:
   - `vendor‑ui‑core` (used everywhere: `@radix‑ui/react‑dialog`, `@radix‑ui/react‑tooltip`, etc.)
   - `vendor‑ui‑navigation` (menu, tabs)
   - `vendor‑ui‑forms` (checkbox, radio, select)
3. **Update `manualChunks`** accordingly.

### Phase 4 – Build‑Time Compression (Low Priority)

1. **Add `vite‑plugin‑compress`** (or similar) to generate `.gz` and `.br` versions of assets.
2. **Configure server** to serve compressed assets when supported.

### Phase 5 – Monitoring & Validation

1. **Create a performance budget** in `package.json` (e.g., `"performance‑budget": { "js": "2MB", "css": "150KB" }`).
2. **Integrate Lighthouse CI** to track metrics over time.
3. **Run `npm run build` after each change** and compare `dist/stats.html` for improvements.

---

## 4. Expected Outcomes

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Initial JS payload (gzip) | ~1.2 MB | ~800 KB | ~33% reduction |
| Largest vendor chunk | 576 KB (jspdf) | 396 KB (charts) | Move PDF out of critical path |
| Time‑to‑Interactive (simulated 3G) | ~5 s | ~3.5 s | ~30% faster |
| Lighthouse Performance Score | (TBD) | ≥90 | +10‑15 points |

**Key Benefit**: Admin/manager functionality remains unchanged, while customer‑facing pages load significantly faster because they no longer fetch PDF and chart libraries.

---

## 5. Appendix

### 5.1 Useful Commands

```bash
# Generate fresh bundle stats
npm run build

# Analyze chunk sizes
find dist/assets -name "*.js" -exec du -h {} \; | sort -rh | head -20

# Check preload links
grep -n "modulepreload" dist/index.html

# Verify no static jspdf/html2canvas imports
grep -r "from ['\"]jspdf['\"]" src/ packages/
grep -r "from ['\"]html2canvas['\"]" src/ packages/

# Run knip to ensure no new dead code
npm run find-unused:report
```

### 5.2 Reference Files

- `vite.config.ts` – current manual chunk configuration  
- `dist/stats.html` – interactive bundle visualization  
- `knip_plan` – dead‑code cleanup log  
- `src/app/router` – root‑level route splitting  
- `src/features/*/routes.tsx` – feature‑specific lazy loading  

### 5.3 Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking PDF generation | Test thoroughly with existing salary/payslip flows. |
| Over‑splitting causing more requests | Keep chunks > 30 KB; use HTTP/2. |
| Increased build complexity | Keep changes incremental; document each modification. |

---

**Next Steps**: Begin with Phase 1 (preload elimination) and measure the impact on `index.html` and initial network waterfall.

