# Agent Guidelines for Ekka App

## Build, Lint, Test

```bash
npm run dev                    # Start Vite dev server
npm run build                  # Build for production (~16s after cleanup)
npm run preview                # Preview production build
npm run lint                   # ESLint (TS/TSX) - passes with 0 errors
npx tsc --noEmit               # Type check (no output means success)
```

### Turbo (Monorepo)
```bash
npx turbo build                # Build all workspace packages
npx turbo lint                 # Lint all workspaces
npx turbo test                 # Run tests across workspaces (if configured)
```

### Tests (Vitest, no npm script)
```bash
npx vitest                     # Run all tests
npx vitest --watch             # Watch mode
npx vitest path/to/file.test.tsx
npx vitest -t "test name"
```
Note: Vitest is installed but tests are not implemented yet.

### Dead Code Analysis
```bash
npm run find-unused            # Run knip to find unused code
npm run find-unused:report     # Run knip without exit code (for CI)
```

## Project Overview
- Stack: React 18 + TypeScript + Vite 7.x
- Styling: Tailwind CSS + shadcn/ui (Radix primitives)
- State: Zustand (global) with immer middleware + React hooks (local)
- Data: Supabase + @tanstack/react-query
- Routing: react-router-dom v6
- i18n: English/Arabic in `src/i18n/translations.ts`
- Monorepo: Workspaces in `packages/` (`shared`, `ui`)

**Current State**: All consolidation phases and dead code cleanup complete (Phase 1-5). Build, lint, typecheck pass. Use specific aliases (`@shared/*`, `@features/*`, `@app/*`) for new code. `@/` retained for contexts, assets, i18n.

## Cleanup Status (Phase 1-5 Complete)
✅ **68 files deleted** across 5 phases:
- **Phase 1**: Legacy Supabase files, Customer1 subpages, unused manager hooks, UI components
- **Phase 2**: Salary calculators/ directory (11 files), supplanted salary engine
- **Phase 3**: Dependencies removed: `cmdk`, `date-fns-tz`, `embla-carousel-react`, `input-otp`, `react-dropzone`, `react-resizable-panels`, `vaul`
- **Phase 4**: Admin layout components, duplicate QRCodeManager, empty barrel exports
- **Phase 5**: Export normalization (5 duplicates), unused salary/platform exports

**Build time improvement**: ~37.94s → ~15.92s. Knip reports 0 unused files (1 false positive).

## Key Paths (Current Structure)
- `src/app/` — App shell (providers, router, stores)
- `src/features/` — Business features by role (auth/owner/manager/customer/shared-features)
- `src/contexts/` — React context providers
- `src/assets/` — Static assets
- `src/i18n/` — Translations (en/ar)
- `packages/shared/src/` — Shared layer (lib/hooks/utils/types/constants/services)
- `packages/ui/src/components/` — UI components (shadcn/ui + custom)

## Monorepo Workspaces
The project uses a monorepo with workspaces defined in `package.json` (`"workspaces": ["packages/*"]`). Two packages exist:
- `packages/shared/`: Shared utilities, types, hooks, services, constants, and integrations.
- `packages/ui/`: UI components (shadcn/ui plus custom components).

Use `npx turbo` to run commands across workspaces (e.g., `npx turbo build`). Vite aliases map `@shared/*` to `packages/shared/src/*` and `@shared/ui/*` to `packages/ui/src/*`.

## Aliases (configured in vite.config.ts)
- `@/*` → `src/*`
- `@app/*` → `src/app/*`
- `@features/*` → `src/features/*`
- `@shared/*` → `packages/shared/src/*`
- `@shared/ui/*` → `packages/ui/src/*`
- `@shared/lib/*` → `packages/shared/src/lib/*`
- `@shared/types/*` → `packages/shared/src/types/*`
- `@shared/hooks/*` → `packages/shared/src/hooks/*`
- `@shared/utils/*` → `packages/shared/src/utils/*`
- `@shared/constants/*` → `packages/shared/src/constants/*`
- `@shared/services/*` → `packages/shared/src/services/*`

## Code Conventions

### Imports & Formatting
- **Import ordering**: ESLint configured with import/order rules (external → internal absolute → relative → type-only). Lint passes with 0 errors.
- **Alias usage**: Keep `@/` alias for backward compatibility (contexts, assets, i18n). Prefer specific aliases (`@shared/*`, `@features/*`, `@app/*`) for new code.
- **ESLint restrictions**: `@/components/**` → use `@shared/ui/components/`; `@/hooks/**` → `@shared/hooks/`; `@/utils/**` → `@shared/utils/`; `@/services/**` → `@shared/services/`.
- Use `import type` and `export type` for types.
- Prefer single quotes in TS/TSX; 2-space indent; semicolons; wrap long JSX props.

### Types
- Prefer explicit types; avoid `any`.
- `interface` for props that may extend; `type` for aliases/unions.
- Database types: `@shared/types/database.types.ts`.
- Domain types: `@shared/types/domains/index.ts`.
- Supabase `Database` re-export: `@shared/lib/supabase/types.ts`.

### Naming & Files
- Components: PascalCase (`FileManagement.tsx`, `TopBar.tsx`).
- Hooks: camelCase with `use` prefix (`useBranches`, `useEmployeeForm`).
- Types: `*.ts` in `@shared/types/` (use local `index.ts` where present).
- Utilities: camelCase file names (`formatters.ts`, `lazyWithRetry.ts`).
- Constants: UPPER_SNAKE_CASE for values, PascalCase for config objects.

### Components & Hooks
- Components in PascalCase; hooks in camelCase `useX`.
- Prefer named exports; default export only when existing pattern uses it.
- Keep feature logic in `features/**/hooks` or `features/**/components`.
- Routes use `React.lazy` + `Suspense` + `PageLoader` (see `src/app/router`).
- Wrap lazy routes in `ErrorBoundary` when possible.
- **Single Source of Truth**: Every hook/component exists in exactly ONE location.
- Shared hooks → `@shared/hooks/`; feature hooks → `@features/*/hooks/`.

## Styling
- Tailwind utilities; use `cn()` from `@shared/lib/utils` to merge classes.
- Variants via `class-variance-authority` (see `@shared/ui/components/button-variants.ts`).
- Theme tokens from CSS variables in `index.css` + `tailwind.config.ts`.
- Font stack includes `IBM Plex Sans Arabic` for `font-sans`.
- Brand colors: `brand-primary` (#e9b353), `brand-secondary` (#4A4A4A).
- Design tokens documented in `wrapup_plan/DESIGN_TOKENS.md` (colors, spacing, typography, animations).

## State & Data
- Zustand store: `src/app/stores/appStore.ts` uses `devtools`, `persist`, `immer`.
- Update store state via `set((state) => { ... })` to preserve immer style.
- React Query client defaults in `@shared/lib/query-client.ts`.
- Query keys live in `@shared/lib/query-keys.ts` (factory pattern with typed filters).

### React Query Patterns
- Prefer `useQuery`/`useMutation` for Supabase calls; throw on Supabase errors.
- Keep query keys stable and typed; reuse `queryKeys` helpers.
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.branches(),
  queryFn: async () => {
    const { data, error } = await supabase.from('branches').select('*');
    if (error) throw error;
    return data ?? [];
  },
});
```

## Error Handling & Supabase
- Wrap async Supabase calls in try/catch; throw on `error`.
- User-facing errors via `toast` from `@shared/ui/components/use-toast` or `sonner`.
- Centralized logging via `errorHandler` in `@shared/services/errorHandler.ts`.
- Use `logger` from `@shared/utils/logger.ts` (disabled in production).
- Never log sensitive data (passwords, tokens, secrets).
- Use client from `@shared/lib/supabase/client.ts`.
- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Optional: `VITE_ERROR_REPORTING_ENDPOINT` (used by logger).
- Use generated types from `@shared/types/database.types.ts` or domain types.

## UI Components
- shadcn/ui components in `@shared/ui/components/` (packages/ui/src/components).
- Keep imports consistent with surrounding feature; do not mix both in one file.
- Icons from `lucide-react`.
- Use `asChild` prop when composing Radix primitives.

## PDF & Salary Modules
- **PDF generation**: HTML-to-PDF with jsPDF + html2canvas.
  - Active pipeline: `@shared/lib/pdf/salary-html-generator.ts` → `salary-pdf-generator.ts`
  - Payslip generation: `@shared/lib/pdf/payslip-pdf-generator.ts` (via `payslip-html-template.ts`)
  - Lazy loading: PDF libraries are dynamically imported only when needed
  - Dead code cleaned: `salary-pdf-constants.ts`, `salary-pdf-html-generator.ts`, `salary-pdf-styles.ts`, `salary-pdf-utils.ts` (orphaned chain, deleted)
- **Salary calculations**: Active module: `@shared/lib/salary/calculations/` (salaryCalculations.ts, payrollWindow.ts)
  - Used by: `useEmployeeCalculationActions`, `useSalaryCalculation`, `usePayrollData`
  - Dead code cleaned: `@shared/lib/salary/calculators/*`, `hooks/useCalculator.ts`, `types/salary.ts`, `utils/calculatorUtils.ts`, `index.ts` (supplanted by calculations/)

## Internationalization, Accessibility & Performance
- Translations in `src/i18n/translations.ts` (en/ar keys).
- Use translation keys rather than inline strings in shared/customer views.
- Ensure RTL layouts when `ar` is active; avoid hard-coded left/right.
- Use `dir="rtl"` on html element for Arabic.
- Use semantic HTML + aria labels for icon buttons.
- Keep touch targets >= 44px (see Tailwind `min-h-tap-target` utility).
- Lazy load large routes; use `lazyWithRetry` from `@shared/utils/lazyWithRetry.ts` when chunk errors matter.
- Use `React.memo()` only when profiling shows benefit.
- Manual chunks configured in `vite.config.ts` for vendor libraries.

## Bundle Optimization
- Manual chunks configured in `vite.config.ts`:
  - `vendor-react`: React, ReactDOM, Router
  - `vendor-state`: Zustand, React Query
  - `vendor-forms`: React Hook Form, Zod
  - `vendor-ui`: All Radix UI packages + class-variance-authority, clsx, tailwind-merge, tailwindcss-animate, sonner
  - `vendor-icons`: Lucide React
  - `vendor-charts`: Recharts
  - `vendor-jspdf`: jsPDF, html2canvas
  - `vendor-dnd`: @hello-pangea/dnd
  - `vendor-animation`: framer-motion
  - `vendor-dates`: date-fns, react-day-picker
  - `vendor-supabase`: Supabase packages
- **Removed dependencies** (cleanup Phase 3): `cmdk`, `input-otp`, `vaul`, `date-fns-tz`, `embla-carousel-react`, `react-dropzone`, `react-resizable-panels`
- Use `lazyWithRetry` for critical chunks that may fail loading.

## Security
- Never log or expose secrets in production.
- Logger sanitizes sensitive keys automatically.
- Error handler redacts sensitive context in production logs.
- Use environment variables for all configuration.

## Anti-Hallucination Rules
Run these checks BEFORE making ANY code changes:
1. Run `npm run lint` — Fix ALL errors before proceeding
2. Run `npm run build` — Must complete successfully
3. Run `npx tsc --noEmit` — Zero type errors required
4. Verify file exists before editing
5. Search for existing implementations before creating new code
6. Check for existing imports before adding duplicates
7. Run `npm run find-unused` to verify dead code claims

## Cursor / Copilot Rules
- No `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` found.

## Additional Documentation
- `wrapup_plan/DESIGN_TOKENS.md` — Comprehensive design system (colors, spacing, typography, animations)
- `wrapup_plan/09_SINGLE_SOURCE_TRUTH.md` — Canonical locations for all code entities
- `wrapup_plan/08_TARGET_STRUCTURE.md` — Final folder structure after consolidation
- `knip_plan` — Dead code analysis and cleanup plan
- `KNIP_REPORT_AND_REALITY_CHECKS.md` — Detailed knip findings with verification