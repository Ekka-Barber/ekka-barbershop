# Project Structure & Migration Guide

## Overview
This document outlines the directory structure, import patterns, and migration guidelines for the Ekka Barbershop application. The project follows a feature‑based architecture with a clear separation between business features (`features/`) and shared infrastructure (`shared/`).

## Target Structure
```
src/
  app/                          # Application shell (providers, router, stores)
  features/                     # Business features by role
    auth/                       # Authentication & access control
    owner/                      # Owner-specific features (employees, settings, branches)
    manager/                    # Manager-specific features (dashboard, payslips)
    customer/                   # Customer-facing features (bookings, reviews, loyalty)
    shared-features/            # Cross-role features (file‑management, qr‑code, branch‑management)
  shared/                       # Extractable shared layer (monorepo‑ready)
    ui/                         # Design system (shadcn/ui + custom components)
    lib/                        # Integrations (Supabase, React Query, PDF generation)
    hooks/                      # Shared React hooks
    utils/                      # Single source utilities (formatters, logger, date, currency)
    types/                      # Centralized TypeScript types
    constants/                  # Application constants
    services/                   # Shared services (error handling, caching, APIs)
  contexts/                     # React context providers (e.g., LanguageContext)
  i18n/                         # Translations (English/Arabic)
  assets/                       # Static assets (logos, images)
```

## Aliases (configured in `vite.config.ts`)
- `@/*` → `src/*`
- `@app/*` → `src/app/*`
- `@features/*` → `src/features/*`
- `@shared/*` → `src/shared/*`
- `@shared/ui/*` → `src/shared/ui/*`
- `@shared/lib/*` → `src/shared/lib/*`
- `@shared/types/*` → `src/shared/types/*`
- `@shared/hooks/*` → `src/shared/hooks/*`
- `@shared/utils/*` → `src/shared/utils/*`
- `@shared/constants/*` → `src/shared/constants/*`
- `@shared/services/*` → `src/shared/services/*`

**Note**: The `@/` alias works for all paths under `src/`, including `contexts/`, `assets/`, and `i18n/`. For new code, prefer the more specific aliases (`@shared/*`, `@features/*`, `@app/*`) to make dependencies explicit.

## Import Patterns

### Import Ordering
ESLint is configured with `import/order` rules that enforce the following grouping:
1. External packages (`react`, `@tanstack/react‑query`, etc.)
2. Internal absolute imports (using the aliases above)
3. Relative imports (`./`, `../`)
4. Type‑only imports (`import type ...`)

Run `npm run lint` to verify ordering; the lint pass should show 0 errors.

### Contexts, Assets, i18n
- **Contexts**: The `LanguageContext` (and any future global contexts) reside in `src/contexts/`. Import via `@/contexts/LanguageContext`.
- **Assets**: Static files (SVG logos, images) live in `src/assets/`. Import via `@/assets/*`.
- **i18n**: Translation keys are defined in `src/i18n/translations.ts`. Import via `@/i18n/translations`.

These directories are considered part of the application shell and are not moved into `shared/` because they are tightly coupled to the React application.

### Shared Layer
The `shared/` directory contains code that is independent of any specific feature and could be extracted into a separate package in a monorepo setup. When adding new utilities, types, or components that will be used across multiple features, place them in the appropriate subdirectory under `shared/`.

## Migration Guide

### Current State
The codebase is in transition from a flat `src/` layout to the feature‑based structure described above. Both the old `@/` alias and the new, more specific aliases work simultaneously.

### Steps for Gradual Migration
1. **New code**: Always use the specific aliases (`@shared/*`, `@features/*`, `@app/*`).
2. **Existing `@/` imports**: Over time, migrate them to the appropriate specific alias when you touch the file. Prioritize:
   - `@/components/ui` → `@shared/ui/*`
   - `@/hooks` → `@shared/hooks/*` (if the hook is truly shared) or `@features/*/hooks`
   - `@/utils` → `@shared/utils/*`
   - `@/types` → `@shared/types/*`
3. **Contexts, assets, i18n**: Keep using `@/` for these; no migration required.
4. **Run lint and type‑check** after any changes to ensure no regressions.

### Verification
- **Lint**: `npm run lint` (should pass with 0 errors)
- **Type check**: `npx tsc --noEmit` (should produce no output)
- **Build**: `npm run build` (should succeed without warnings)
- **Dev server**: `npm run dev` (should start and load owner, manager, and customer interfaces)

## Conventions

### File Naming
- **Components**: PascalCase (`FileManagement.tsx`, `TopBar.tsx`)
- **Hooks**: camelCase with `use` prefix (`useBranches`, `useEmployeeForm`)
- **Types**: `*.ts` in `src/shared/types/` (use local `index.ts` for aggregation)
- **Utilities**: camelCase file names (`formatters.ts`, `lazyWithRetry.ts`)
- **Constants**: UPPER_SNAKE_CASE for values, PascalCase for configuration objects

### Component Structure
Prefer named exports. Use explicit TypeScript interfaces for props. Follow the pattern:

```tsx
import { useState } from 'react';
import { Button } from '@shared/ui/button';
import type { Employee } from '@shared/types/domains';

interface Props {
  employee: Employee;
}

export const Example = ({ employee }: Props) => {
  const [count, setCount] = useState(0);
  const handleClick = () => setCount((prev) => prev + 1);
  if (!employee) return null;
  return (
    <Button onClick={handleClick}>
      {employee.name} ({count})
    </Button>
  );
};
```

### Styling
- Use Tailwind CSS utility classes.
- Merge classes with `cn()` from `@shared/lib/utils`.
- Theme tokens are defined as CSS variables in `index.css` and `tailwind.config.ts`.
- Support RTL layouts for Arabic (`dir="rtl"` on the HTML element).

### State & Data
- Global state: Zustand store in `src/app/stores/appStore.ts` (uses `immer` middleware).
- Server state: React Query with client defaults in `@shared/lib/query‑client.ts`.
- Query keys: Use the factory helpers in `@shared/lib/query‑keys.ts`.

### Error Handling & Logging
- Centralized error handler: `@shared/services/errorHandler.ts`
- Logger: `@shared/utils/logger.ts` (disabled in production)
- Never log sensitive data (passwords, tokens, secrets).

## Bundle Optimization
Manual chunks are configured in `vite.config.ts`:
- `vendor‑react`: React, ReactDOM, Router
- `vendor‑state`: Zustand, React Query
- `vendor‑forms`: React Hook Form, Zod
- `vendor‑ui`: All Radix UI packages
- `vendor‑icons`: Lucide React
- `vendor‑charts`: Recharts
- `vendor‑supabase`: Supabase packages

Use `lazyWithRetry` from `@shared/utils/lazyWithRetry.ts` for critical lazy‑loaded routes.

## Security
- Never commit secrets or keys to the repository.
- Environment variables for all configuration.
- Logger and error handler automatically redact sensitive information in production logs.

---

*Last updated: January 23, 2025*