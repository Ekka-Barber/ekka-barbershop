# Agent Guidelines for Ekka App

## Purpose
This document guides AI agents working on the Ekka barbershop management app (React 18 + TypeScript + Vite).

## Build, Lint, Test

**Setup:**
```bash
npm install                    # Install dependencies (workspaces: shared, ui)
cp .env.example .env           # Add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

**Commands:**
```bash
npm run dev                    # Start Vite dev server
npm run build                  # Build for production
npm run lint                   # ESLint (must pass with 0 errors)
npx tsc --noEmit               # Type check (no output = success)
npm run find-unused            # Knip dead code analysis
```

**Vitest (no npm script):**
```bash
npx vitest                     # Run all tests
npx vitest --watch             # Watch mode
npx vitest path/to/file.test.tsx   # Single test file
npx vitest -t "test name"      # Run tests matching pattern
```

## Project Structure

**Tech Stack:** React 18, TypeScript, Vite 7.x, Tailwind CSS, shadcn/ui, Zustand, React Query, Supabase, react-router-dom v6

**Monorepo Workspaces:**
- `packages/shared/` - Utilities, types, hooks, services, constants
- `packages/ui/` - shadcn/ui + custom components

**Key Paths:**
- `src/app/` - App shell (providers, router, stores)
- `src/features/` - Business features by role (auth/owner/manager/hr/customer)
- `packages/shared/src/lib/` - Core utilities (query-client, supabase client)
- `packages/shared/src/hooks/` - Shared React hooks
- `packages/shared/src/types/` - TypeScript types

## Aliases (vite.config.ts)

| Alias | Path |
|-------|------|
| `@/*` | `src/*` (contexts, assets, i18n only) |
| `@app/*` | `src/app/*` |
| `@features/*` | `src/features/*` |
| `@shared/*` | `packages/shared/src/*` |
| `@shared/ui/*` | `packages/ui/src/*` |
| `@shared/lib/*` | `packages/shared/src/lib/*` |
| `@shared/hooks/*` | `packages/shared/src/hooks/*` |
| `@shared/types/*` | `packages/shared/src/types/*` |
| `@shared/utils/*` | `packages/shared/src/utils/*` |
| `@shared/services/*` | `packages/shared/src/services/*` |

## Code Conventions

### Imports & Formatting
- Import order: external → internal absolute → relative → type-only (ESLint enforced)
- Use `import type` / `export type` for types
- Single quotes, 2-space indent, semicolons
- ESLint restrictions:
  - `@/components/**` → use `@shared/ui/components/`
  - `@/hooks/**` → use `@shared/hooks/`
  - `@/utils/**` → use `@shared/utils/`
  - `@/services/**` → use `@shared/services/`

### Types & Naming
- Prefer explicit types; avoid `any`
- `interface` for extendable props; `type` for aliases/unions
- Components: PascalCase files (`TopBar.tsx`)
- Hooks: camelCase with `use` prefix (`useBranches.ts`)
- Constants: UPPER_SNAKE_CASE for values
- Prefer named exports; default only when existing pattern uses it

### Components & Hooks
- Keep feature logic in `features/**/hooks` or `features/**/components`
- Shared hooks → `@shared/hooks/`; feature hooks → `@features/*/hooks/`
- Routes use `React.lazy` + `Suspense` + `PageLoader`
- **Single Source of Truth**: Every hook/component in exactly ONE location

## State & Data

### Zustand (src/app/stores/appStore.ts)
- Uses `devtools`, `persist`, `immer` middleware
- Update via `set((state) => { ... })` for immer style

### React Query
- Client defaults in `@shared/lib/query-client.ts`
- Query keys factory in `@shared/lib/query-keys.ts`
- Always throw on Supabase errors:

```tsx
const { data } = useQuery({
  queryKey: queryKeys.branches(),
  queryFn: async () => {
    const { data, error } = await supabase.from('branches').select('*');
    if (error) throw error;
    return data ?? [];
  },
});
```

## Error Handling & Supabase

- Use client from `@shared/lib/supabase/client.ts`
- User-facing errors: `toast` from `@shared/ui/components/use-toast` or `sonner`
- Logging: `logger` from `@shared/utils/logger.ts` (disabled in production)
- Centralized handler: `errorHandler` in `@shared/services/errorHandler.ts`
- Never log passwords, tokens, or secrets

## Styling

- Tailwind utilities; use `cn()` from `@shared/lib/utils` to merge classes
- Variants via `class-variance-authority`
- Icons from `lucide-react`
- Brand colors: `brand-primary` (#e9b353), `brand-secondary` (#4A4A4A)
- Font includes `IBM Plex Sans Arabic` for RTL

## i18n & Accessibility

- Translations in `src/i18n/translations.ts` (en/ar)
- Use translation keys, not inline strings
- RTL support with `dir="rtl"` for Arabic
- Touch targets ≥ 44px (Tailwind `min-h-tap-target`)

## Pre-Change Checklist

1. `npm run lint` - Fix ALL errors
2. `npm run build` - Must succeed
3. `npx tsc --noEmit` - Zero type errors
4. Verify file exists before editing
5. Search for existing implementations before creating new code
6. `npm run find-unused` to verify dead code claims

## KISS Principles

- Write simple code with minimal indirection
- Each function does one thing well
- Avoid deep attribute chains (a.b.c.d) - extract to variables
- Remove redundant code, unnecessary comments, and thin wrappers
- Tests use real Supabase calls (test database), not mocks

## Cursor / Copilot Rules

None found in `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md`.
