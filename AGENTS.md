# AGENTS.md - Ekka Barbershop Management App

This document provides essential information for AI agents working in the Ekka Barbershop Management App codebase.

## Project Overview

A modern barbershop management application built with React 18, TypeScript, and Supabase. The app serves both customers (booking system) and administrators (management dashboard), with multi-language support (Arabic/English) and PWA capabilities.

**Tech Stack:**
- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Backend**: Supabase (PostgreSQL database, authentication, realtime)
- **State Management**: TanStack Query (React Query) for server state, React Context for app state
- **Routing**: React Router v6
- **Testing**: Vitest with React Testing Library
- **Build Tool**: Vite

## Essential Commands

```bash
# Development
npm run dev                    # Start dev server on port 9913 (auto-finds available port)

# Building
npm run build                  # Production build with esbuild minification
npm run build:dev             # Development build
npm run build:analyze         # Build + analyze bundle with vite-bundle-analyzer
npm run build:fast            # Build without minification for faster iteration

# Code Quality
npm run lint                  # Run ESLint
npm run unimported            # Check for unused imports

# Testing
npm run test                  # Run tests once
npm run test:watch           # Run tests in watch mode

# Preview
npm run preview               # Preview production build locally

# Utilities
npm run analyze-tables        # Analyze used Supabase tables
```

## Code Organization

```
src/
├── components/               # All React components
│   ├── admin/               # Admin panel components
│   │   ├── branch-management/
│   │   ├── file-management/
│   │   ├── qr-code/
│   │   ├── ui-elements/
│   │   └── layout/
│   ├── customer/            # Customer-facing components
│   │   ├── sections/
│   │   ├── review-modal/
│   │   ├── review-states/
│   │   └── layout/
│   ├── common/              # Shared components (ErrorBoundary, OfflineNotification)
│   ├── ui/                  # shadcn/ui primitives
│   ├── legal/               # Legal page components
│   └── installation/         # Installation/PWA components
├── pages/                   # Route-level page components
├── hooks/                   # Custom React hooks (useIsMobile, useDialogState, etc.)
├── contexts/                # React contexts (LanguageContext)
├── services/                # Business logic and API services
├── lib/                     # Utility libraries and configurations
├── utils/                   # Pure utility functions
├── types/                   # TypeScript type definitions
├── constants/               # App-wide constants (animations, etc.)
├── i18n/                    # Internationalization (translations)
├── integrations/            # External service integrations (Supabase)
└── assets/                  # Static assets (SVGs, images)
```

**Key Patterns:**
- Components organized by feature (admin, customer) not by type
- Shared UI components in `components/ui/` (shadcn/ui)
- Business logic separated into `services/` and `hooks/`
- Types colocated with features or in `types/` for shared types
- Use `@/` path alias for all imports from src/

## TypeScript & Component Standards

**Strict Requirements:**
- All components must use TypeScript interfaces for props
- All functions must have explicit return types
- Use `React.FC` for functional components
- Never use `any` - use `unknown` with type guards if needed
- Use interfaces for component props, types for data structures

**Component Structure:**
```tsx
// Import order: React -> third-party -> internal -> types -> assets
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/types/supabase";

interface ComponentProps {
  // Always define props interface
  id: string;
  name: string;
  onAction: (id: string) => void;
}

const Component: React.FC<ComponentProps> = ({
  id,
  name,
  onAction,
}) => {
  // Hooks at the top
  const [state, setState] = React.useState<string>("");
  
  // Handlers named with "handle" prefix
  const handleClick = (): void => {
    onAction(id);
  };
  
  // Early returns for conditions
  if (!name) return null;
  
  // JSX
  return <button onClick={handleClick}>{name}</button>;
};

export default Component;
```

**Event Handlers:**
- Name with "handle" prefix (handleClick, handleSave, handleNavigate)
- Use arrow function syntax with const
- Type all parameters and return void explicitly
- Implement keyboard handlers for accessibility (handleKeyDown)

## Styling with Tailwind CSS

**Fundamental Rules:**
- Use Tailwind classes for ALL styling - no inline styles, no styled-components
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Group Tailwind classes logically: layout → spacing → typography → visual → interactive
- Use semantic design tokens: `bg-primary`, `text-muted-foreground`, `border-border`
- Mobile-first approach: write mobile styles first, add `md:`, `lg:` prefixes as needed

**Color Tokens:**
- Primary brand color: `#C4A36F` (also available as `bg-brand-primary`)
- Use CSS custom properties: `bg-background`, `text-foreground`, `border-border`
- Secondary: `#4A4A4A` (available as `bg-brand-secondary`)

**Example:**
```tsx
import { cn } from "@/lib/utils";

<div
  className={cn(
    // Layout & positioning
    "flex flex-col gap-4 p-6",
    // Spacing & sizing
    "rounded-xl border-2",
    // Typography
    "text-sm font-medium",
    // Visual
    "bg-card text-card-foreground shadow-sm",
    // Interactive
    "hover:shadow-md transition-shadow duration-200",
    // Conditional classes
    isActive && "ring-2 ring-primary ring-offset-2",
    isDisabled && "opacity-50 pointer-events-none"
  )}
>
  {children}
</div>
```

**Responsive Design:**
- Mobile breakpoint: 768px (use `useIsMobile()` hook)
- Extra small breakpoint: 375px (xs)
- Always test on mobile - this is a mobile-first app
- Use `max-w-app` for content width constraints

## Supabase Integration

**Import Pattern:**
```tsx
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
```

**Environment Variables Required:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `VITE_ADMIN_ACCESS_TOKEN` - Token for admin access (default: owner123)

**Environment Setup:**
Create a `.env` file in project root (see `.env.example` doesn't exist - check `.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_ACCESS_TOKEN=owner123  # Change this in production
```

**CRITICAL:** The app throws an error if Supabase credentials are missing. Never run without these variables.

**Type-Safe Queries:**
Use the auto-generated types from Supabase in `src/integrations/supabase/types.ts`:

```tsx
// Type-safe query
const { data: services } = await supabase
  .from('services')
  .select('*')
  .eq('branch_id', branchId);

// The result is automatically typed as Database['public']['Tables']['services']['Row'][]
```

## State Management

**Server State (React Query):**
- Use TanStack Query for all API calls
- Import QueryClient and QueryClientProvider as needed
- Configure in App.tsx or root components
- Use proper loading/error states

**Local State:**
- Use `useState` for simple component state
- Use `useReducer` for complex state (booking wizards, multi-step forms)
- Keep state as close to where it's used as possible

**Global State:**
- Use React Context for app-wide state (language, user session, current booking)
- Contexts defined in `src/contexts/`
- Create custom hooks for context access (useLanguage, useBooking, etc.)

**Example Hook Pattern:**
```tsx
import * as React from "react";

export function useFeature() {
  const [state, setState] = React.useState<Type>(initialValue);
  
  const handleAction = React.useCallback((param: ParamType): void => {
    // Implementation
  }, [dependency]);
  
  return { state, handleAction };
}
```

## Routing

**Routes (App.tsx):**
- `/` → redirects to `/customer`
- `/customer` → Customer booking page (public)
- `/menu` → Menu page (public)
- `/offers` → Offers page (public)
- `/admin` → Admin panel (protected)
- `/privacy`, `/terms`, `/refund`, `/contact` → Legal pages (public)

**Route Protection:**
Admin routes use `ProtectedRoute` component with token-based authentication:
- Token checked from localStorage or URL parameters
- URL params: `?access=owner123` or `?token=owner123`
- Stored in localStorage as `ekka-admin-token`
- Redirects to `/customer` if unauthorized

**Lazy Loading:**
All route components use `lazyWithRetry()` utility for code splitting:
```tsx
const Component = lazyWithRetry(() => import("./pages/Component"));
```

Wrap with `<Suspense>` and provide loading component (`RouteLoader`).

## Testing

**Framework:** Vitest with React Testing Library, jsdom environment

**Test Structure:**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Component from './Component';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('Component', () => {
  it('renders without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Component />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

**Test Commands:**
- `npm run test` - Run all tests
- `npm run test:watch` - Watch mode for development

**Important:** Tests use `window.matchMedia` mock defined in `vitest.setup.ts`.

## Internationalization (i18n)

**Languages Supported:** English (en), Arabic (ar)

**Usage:**
```tsx
import { useLanguage } from '@/contexts/LanguageContext';

const { language, setLanguage } = useLanguage();

// Format for current language
import { formatPrice, formatDuration } from '@/utils/formatters';

const price = formatPrice(100, language);  // "100 SAR" or "١٠٠ ريال"
const duration = formatDuration(45, language);  // "45 mins" or "٤٥ د"
```

**Arabic-Specific:**
- Uses IBM Plex Sans Arabic font
- Arabic numerals conversion with `convertToArabic()`
- Right-to-left layout automatically handled by RTL-aware components
- Arabic translations in `src/i18n/translations.ts`

## Accessibility (a11y)

**Critical Requirements:**
- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Include aria-labels for icon-only buttons and decorative elements
- Ensure proper focus management in modals and dialogs
- All images must have alt text
- Color contrast must meet WCAG AA standards

**Example:**
```tsx
<button
  onClick={handleAction}
  aria-label="Delete item"
  aria-pressed={isActive}
  disabled={isDisabled}
>
  <TrashIcon aria-hidden="true" />
</button>
```

**Key Accessibility Patterns:**
- Use proper button elements (not divs) for actions
- Implement keyboard handlers (Enter, Space, Escape)
- Focus traps in modals
- ARIA live regions for dynamic content
- Skip links for keyboard navigation

## Code Style & Patterns

**Import Order:**
1. React and React-related
2. Third-party libraries
3. Internal components, hooks, utils
4. Types
5. Assets

**Naming Conventions:**
- Components: PascalCase (`ServiceCard`, `BookingForm`)
- Props interfaces: `ComponentNameProps` (`ServiceCardProps`)
- Hooks: `useFeature` (`useServices`, `useBookings`)
- Event handlers: `handleAction` (`handleServiceSelect`, `handleBookingSubmit`)
- Utils: `verbNoun` (`formatDuration`, `calculatePrice`)
- Contexts: `FeatureContext` (`BookingContext`, `LanguageContext`)

**Component Organization:**
```tsx
// 1. Imports
import * as React from "react";

// 2. Types/Interfaces
interface Props { ... }

// 3. Constants
const CONSTANT = "...";

// 4. Component
const Component: React.FC<Props> = ({ ... }) => {
  // Hooks
  // Handlers
  // Effects
  // Computed values
  
  // Early returns
  if (condition) return <Component />;
  
  // JSX
  return <div>...</div>;
};

// 5. Helper functions (if small and specific)
const helper = () => { ... };

// 6. Export
export default Component;
```

**Performance:**
- Use `React.memo` for expensive renders (service lists, tables)
- Use `React.useCallback` for functions passed as props
- Use `React.useMemo` for expensive calculations
- Lazy load heavy route components
- Code split with dynamic imports
- Use the build analyzer: `npm run build:analyze`

**Error Handling:**
- All async operations must have try/catch
- Show user-friendly error messages
- Use ErrorBoundary component for component-level errors
- Log detailed errors for debugging
- Implement retry mechanisms for failed requests

## Important Gotchas

### React Singleton Pattern
The app uses a custom React singleton pattern (`src/lib/react-singleton.ts`) to prevent duplicate React instances. This is configured in `vite.config.ts` with aliases. Never import React directly - let Vite handle the aliasing.

### Admin Security
⚠️ **SECURITY ISSUE:** Admin access uses a basic token system. This is intentional for this codebase but not secure for production. The token is stored in localStorage and checked on each admin route load.

### File Management
Files are managed with end dates and drag-and-drop functionality. Key files:
- `src/components/admin/file-management/`
- Services: `src/services/avatarCacheService.ts`, `src/services/offlineSupport.ts`

### PDF Handling
PDF viewing uses `react-pdf` and `pdfjs-dist`. Key components:
- `src/components/PDFViewer.tsx`
- `src/components/LazyPDFViewer.tsx` (for performance)
- Custom hook: `src/hooks/usePDFFetch.ts`

### PWA & Offline Support
- Service worker registered in `src/components/ServiceWorkerRegistration.tsx`
- Offline notification in `src/components/common/OfflineNotification.tsx`
- Service worker files in `public/sw/`

### Google Places Integration
Google Places API integration for branch locations:
- Service: `src/services/googlePlacesService.ts`
- Requires `google_places_api_key` in branches table

### Lazy Loading Retry
Components use `lazyWithRetry()` utility for more resilient lazy loading:
```tsx
import { lazyWithRetry } from "@/utils/lazyWithRetry";
```

### Branch Management
Complex branch management with:
- Multiple branches support
- Branch managers with access codes
- Salary aggregates (materialized view: `mv_branch_salary_aggregates`)
- Google Places integration

### QR Codes
QR code generation and tracking for customer access:
- Components: `src/components/admin/qr-code/`
- Analytics: QR code click tracking
- Updates: Dynamic QR code URL updates

### Critical Environment Variables
Missing Supabase credentials will throw an error and prevent the app from running. Always check:
```tsx
src/integrations/supabase/client.ts:5-11
```

### Mobile Optimization
- App is mobile-first with 768px breakpoint
- Uses safe-area CSS variables for notched devices
- Bottom navigation bar on mobile
- Touch targets minimum 44px height
- Custom animations for mobile feel

### Console Logs
All `console.log` statements must be removed before production deployment. The project enforces this in code review.

## Existing Documentation

**Rule Files (.cursor/rules/):**
- `ai-assistant-rules.md` - Comprehensive AI assistant guidelines (323 lines)
- `coding-standards.md` - Detailed coding standards and best practices (380 lines)

**These files contain:**
- Component structure patterns
- TypeScript implementation standards
- Tailwind CSS usage guidelines
- Event handler patterns
- Accessibility requirements
- Booking flow patterns
- Admin patterns
- Code review checklists

**Review these files before making changes** - they contain project-specific patterns and conventions not covered here.

## Build & Deployment

**Build Output:**
- Default target: `dist/` directory
- Sourcemaps disabled in production
- Chunk size warning limit: 2000KB
- Target: ES2020
- Manual chunks configured for react-vendor, ui-vendor, data-vendor

**Preview:**
```bash
npm run build && npm run preview
```

## Common Tasks

**Add a new page component:**
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Use lazy loading with `lazyWithRetry()`
4. Wrap in `<Suspense>` with loading fallback

**Create a new UI component:**
1. Add to `src/components/ui/` if it's a reusable primitive
2. Add to feature folder (admin, customer) if it's feature-specific
3. Follow component structure pattern
4. Use `cn()` for conditional classes
5. Implement accessibility attributes

**Add a Supabase table query:**
1. Import `supabase` from `@/integrations/supabase/client`
2. Import types from `@/integrations/supabase/types`
3. Use type-safe query builder
4. Handle loading/error states
5. Use React Query for caching

**Add a new translation:**
1. Update `src/i18n/translations.ts`
2. Add Arabic and English versions
3. Use `useLanguage()` hook in components
4. Format numbers/dates with formatters

**Create a custom hook:**
1. Add to `src/hooks/` or feature-specific hooks folder
2. Name with `use` prefix
3. Type all parameters and return values
4. Use `React.useCallback` for handlers
5. Export with explicit typing

## Troubleshooting

**Supabase connection errors:**
- Check `.env` file exists and has required variables
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart dev server after adding environment variables

**Build fails with type errors:**
- Check TypeScript imports are using `@/` alias
- Verify all types are properly imported
- Run `npm run lint` to see ESLint errors
- Check for unused imports with `npm run unimported`

**Tests fail with matchMedia errors:**
- Ensure `vitest.setup.ts` is loaded
- Check window.matchMedia mock is defined
- Use `jsdom` environment (configured in vitest.config.ts)

**Styles not appearing:**
- Check Tailwind classes are correct
- Verify `cn()` utility is imported and used
- Ensure Tailwind config paths are correct
- Check for CSS specificity issues

**Component not re-rendering:**
- Verify props/dependencies are correct in useCallback/useMemo
- Check for stale closure issues
- Use React DevTools Profiler to debug

**Routing issues:**
- Check route paths match in App.tsx
- Verify lazy loading is working
- Check Suspense boundaries are present
- Ensure ProtectedRoute is properly configured for admin routes

---

**Last Updated:** 2026-01-18
**Project:** Ekka Barbershop Management App
**Working Directory:** C:/Users/alazi/ekka-barbershop
