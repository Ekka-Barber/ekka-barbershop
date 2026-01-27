# 🪝 Hook Architecture

> **Last Updated**: January 26, 2026  
> **Phase**: 3 (Hook Consolidation Complete)

## 📊 Overview

Ekka's hook architecture follows a **shared vs feature-specific** pattern:

| Category | Location | Purpose | Count |
|----------|----------|---------|-------|
| **Shared Hooks** | `packages/shared/src/hooks/` | Reusable across features | 36 files |
| **Auth Hooks** | `src/features/auth/hooks/` | Authentication-specific logic | 0 files (consolidated) |
| **Customer Hooks** | `src/features/customer/components/hooks/` | Customer-facing UI logic | 1 file |
| **Manager Hooks** | `src/features/manager/hooks/` | Manager-specific business logic | 8 files |
| **Owner Hooks** | `src/features/owner/employees/hooks/` | Owner-specific employee operations | 26 files |

**Total Hook Files**: 71 unique implementations (after consolidation)

## 🏗️ Design Principles

### 1. Shared Hooks (`@shared/hooks/`)
- **Purpose**: Cross-cutting concerns used by multiple features
- **Examples**: `useToast`, `useMobile`, `usePayrollData`, `useFileValidation`
- **Location**: `packages/shared/src/hooks/` + subdirectories
- **Import pattern**: `import { useToast } from '@shared/hooks/use-toast'`

### 2. Feature-Specific Hooks (`@features/*/hooks/`)
- **Purpose**: Business logic specific to a role/feature
- **Examples**:
  - Manager: `useEmployeeData` (branch-manager filtered)
  - Owner: `useEmployeeCalculationActions` (owner-level calculations)
  - Customer: `useReviews` (Google reviews display)
- **Location**: `src/features/{role}/hooks/` or `src/features/{role}/components/hooks/`
- **Import pattern**: `import { useEmployeeData } from '@/features/manager/hooks/useEmployeeData'`

### 3. Subdirectories for Logical Grouping
- `employee/` – Employee operations (shared)
- `file-management/` – File upload/validation logic
- `qr-analytics/` – QR code analytics
- `salary/` – Salary-specific hooks (manager)

## 🔄 Consolidation History

### Phase 3 Changes (January 26, 2026)
1. **Removed Re-exports**: Deleted 2 re-export files from manager hooks
   - `src/features/manager/hooks/use-mobile.tsx` → direct import from `@shared/hooks/use-mobile`
   - `src/features/manager/hooks/use-toast.ts` → direct import from `@shared/hooks/use-toast`
2. **Consolidated Duplicates**: Merged 2 duplicate hooks
   - `useLogout` (owner + manager) → `@shared/hooks/auth/useLogout.ts`
   - `useFileValidation` (root duplicate) → `@shared/hooks/file-management/useFileValidation.ts`
3. **Cleaned Empty Directories**: Removed 2 empty hook directories
   - `src/features/auth/hooks/`
   - `src/features/customer/hooks/`

### Key Decisions
- **No true duplicates** found beyond the 2 consolidated
- **Feature-specific hooks remain in place** – different business logic justifies separation
- **Re-exports eliminated** – direct imports improve clarity and maintainability

## 📁 Directory Structure (Post-Consolidation)

```
hooks/
├── packages/shared/src/hooks/          # Shared hooks (36 files)
│   ├── auth/                           # Authentication hooks (1 file)
│   │   └── useLogout.ts                # Consolidated logout hook
│   ├── employee/                       # Shared employee operations (4 files)
│   ├── file-management/                # File management (8 files)
│   ├── qr-analytics/                   # QR analytics (7 files)
│   ├── use-toast.ts                    # Toast notifications
│   ├── use-mobile.tsx                  # Mobile detection
│   └── ... (19 root hooks)
│
├── src/features/manager/hooks/         # Manager-specific (8 files)
│   ├── useCurrency.ts                  # Arabic currency formatting
│   ├── useEmployeeData.ts              # Branch-manager filtered employee fetch
│   ├── useEmployeeLeaveBalance.ts      # Leave balance calculations
│   ├── useFullscreen.ts                # Fullscreen toggle
│   ├── useMonthContext.ts              # Month context consumer
│   ├── useSalaryCalculation.ts         # Salary calculation with plans
│   └── salary/                         # Salary subdirectory (3 files)
│
├── src/features/owner/employees/hooks/ # Owner-specific (26 files)
│   ├── useEmployeeActions.ts           # Orchestrator hook
│   ├── useEmployeeCalculationActions.ts # Master calculation hook
│   ├── useEmployeeData.ts              # Owner-level employee fetch
│   └── ... (23 more)
│
└── src/features/customer/components/hooks/ # Customer-specific (1 file)
    └── useReviews.ts                   # Google reviews fetch & display
```

## 🎯 Import Guidelines

### Always Use These Patterns
```typescript
// ✅ CORRECT: Shared hooks
import { useToast } from '@shared/hooks/use-toast';
import { useLogout } from '@shared/hooks/auth/useLogout';

// ✅ CORRECT: Feature hooks
import { useEmployeeData } from '@/features/manager/hooks/useEmployeeData';
import { useReviews } from '@/features/customer/components/hooks/useReviews';

// ❌ AVOID: Re-exports (removed)
import { useToast } from '@/features/manager/hooks/use-toast'; // DON'T USE
```

### Import Order (ESLint enforced)
1. External dependencies (`react`, `@tanstack/react-query`)
2. Internal absolute imports (`@shared/*`, `@features/*`)
3. Relative imports (`./components`, `../utils`)
4. Type-only imports (`import type ...`)

## 🔍 Audit Results (January 26, 2026)

| Metric | Value |
|--------|-------|
| Total hook files analyzed | 87 |
| Unique implementations | 71 |
| Already centralized | 36 (51%) |
| Feature-specific kept | 71 (100%) |
| Re-exports removed | 2 |
| True duplicates consolidated | 2 |

**Key Insight**: The hook architecture is **already well-organized**. Phase 2 centralized shared employee operations correctly. Feature-specific hooks are intentionally local for different business logic.

## 🚀 Future Considerations

1. **New Shared Hooks**: When creating hooks used by multiple features, place in `packages/shared/src/hooks/`
2. **Feature Hooks**: Keep business logic in feature directories
3. **Regular Audits**: Run hook analysis every 6 months to identify new duplicates
4. **Documentation Updates**: Update this file when hook patterns change

---

*Phase 3 completed successfully. All lint, type checks, and build pass.*