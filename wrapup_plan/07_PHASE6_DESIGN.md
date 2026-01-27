# 🎨 PHASE 6: DESIGN SYSTEM UNIFICATION

> **Estimated Time**: 2-3 days  
> **Risk Level**: Medium  
> **Dependencies**: Phase 5 complete

---

## Overview

Unify design tokens, color palettes, and component styling across all features.

---

## Current State

### Color Sources
- `index.css` — CSS variables
- `tailwind.config.ts` — Tailwind theme extension
- Hardcoded values in components (e.g., `#C4A36F`)

### Inconsistencies Found
| Issue | Location | Example |
|-------|----------|---------|
| Hardcoded brand color | Customer RouteLoader | `#C4A36F` |
| Duplicate definitions | index.css + tailwind.config | `--primary` vs `primary` |
| Inconsistent spacing | Various components | `p-4` vs `p-5` vs `padding: 1rem` |

---

## Target Design System

### 1. CSS Variables (Single Source of Truth)

**File**: `src/index.css`

```css
:root {
  /* Brand Colors */
  --color-brand-gold: 196 163 111;      /* #C4A36F */
  --color-brand-dark: 34 34 34;          /* #222222 */
  --color-brand-light: 250 249 247;      /* #FAF9F7 */
  
  /* Semantic Colors */
  --color-primary: var(--color-brand-gold);
  --color-secondary: var(--color-brand-dark);
  --color-background: var(--color-brand-light);
  --color-foreground: var(--color-brand-dark);
  
  /* State Colors */
  --color-success: 34 197 94;            /* green-500 */
  --color-warning: 234 179 8;            /* yellow-500 */
  --color-error: 239 68 68;              /* red-500 */
  --color-info: 59 130 246;              /* blue-500 */
  
  /* Neutral Scale */
  --color-gray-50: 249 250 251;
  --color-gray-100: 243 244 246;
  --color-gray-200: 229 231 235;
  --color-gray-300: 209 213 219;
  --color-gray-400: 156 163 175;
  --color-gray-500: 107 114 128;
  --color-gray-600: 75 85 99;
  --color-gray-700: 55 65 81;
  --color-gray-800: 31 41 55;
  --color-gray-900: 17 24 39;
  
  /* Spacing Scale */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-arabic: 'Cairo', 'Noto Sans Arabic', sans-serif;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Dark mode */
.dark {
  --color-background: 17 24 39;          /* gray-900 */
  --color-foreground: 249 250 251;       /* gray-50 */
  /* ... other dark mode overrides */
}

/* RTL Support */
[dir="rtl"] {
  --font-sans: var(--font-arabic);
}
```

### 2. Tailwind Config

**File**: `tailwind.config.ts`

```typescript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          gold: 'rgb(var(--color-brand-gold) / <alpha-value>)',
          dark: 'rgb(var(--color-brand-dark) / <alpha-value>)',
          light: 'rgb(var(--color-brand-light) / <alpha-value>)',
        },
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
      },
      spacing: {
        // Use CSS variables for consistency
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        arabic: ['var(--font-arabic)'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
      },
    },
  },
};
```

---

## Migration Steps

### Step 6.1: Audit Hardcoded Colors

```powershell
# Find all hardcoded hex colors
grep_search Query="#C4A36F" SearchPath="c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src"
grep_search Query="#222222" SearchPath="c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src"
grep_search Query="bg-\[#" SearchPath="c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src"
grep_search Query="text-\[#" SearchPath="c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src"
```

### Step 6.2: Replace with Design Tokens

```tsx
// BEFORE
<div className="bg-[#C4A36F]">

// AFTER
<div className="bg-brand-gold">

// BEFORE
<p className="text-[#222222]">

// AFTER
<p className="text-brand-dark">
```

### Step 6.3: Consolidate Component Styling

For each component category, ensure consistent patterns:

| Component | Padding | Border Radius | Shadow |
|-----------|---------|---------------|--------|
| Card | `p-4` or `p-6` | `rounded-lg` | `shadow-md` |
| Button (sm) | `px-3 py-2` | `rounded-md` | none |
| Button (md) | `px-4 py-2` | `rounded-md` | none |
| Dialog | `p-6` | `rounded-xl` | `shadow-lg` |
| Input | `px-3 py-2` | `rounded-md` | none |

### Step 6.4: Document Design Tokens

**Create**: `packages/shared/src/constants/design-tokens.ts`

```typescript
export const DESIGN_TOKENS = {
  colors: {
    brand: {
      gold: '#C4A36F',
      dark: '#222222',
      light: '#FAF9F7',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  // ... other tokens
} as const;
```

---

## Validation

### Visual Checklist

- [ ] Customer landing page looks correct
- [ ] Manager dashboard maintains styling
- [ ] Owner admin panel consistent
- [ ] RTL layout works
- [ ] Dark mode (if supported) works

### Build Check

```powershell
npm run build
npm run dev
```

---

## Completion Criteria

- [ ] All hardcoded colors replaced
- [ ] CSS variables documented
- [ ] Tailwind config updated
- [ ] Component styling consistent
- [ ] Design tokens file created
- [ ] Visual regression check passed

---

*Next*: [08_TARGET_STRUCTURE.md](./08_TARGET_STRUCTURE.md)
