# 📘 PHASE 4: TYPE UNIFICATION

> **Estimated Time**: 1-2 days  
> **Risk Level**: Medium  
> **Dependencies**: Phase 3 complete

---

## Overview

Unify TypeScript types scattered across 6+ directories into `packages/shared/src/types/`.

---

## Current Type Distribution

| Location | Files | Status |
|----------|-------|--------|
| `packages/shared/src/types/` | 14 files | ✅ Central |
| `features/auth/types/` | 1 file | Feature-specific |
| `features/customer/types/` | 1 file | Feature-specific |
| `features/manager/types/` | 7 files | ⚠️ May duplicate |
| `features/owner/types/` | 1 file | Feature-specific |
| `features/owner/employees/types/` | 4 files | ⚠️ May duplicate |
| `src/types/` | 0 files | Empty (delete) |

---

## Existing Shared Types

**Path**: `packages/shared/src/types/`

| File | Contents |
|------|----------|
| `admin.ts` | Admin-related types |
| `file-management.ts` | File upload/management |
| `language.ts` | i18n types |
| `navigation.ts` | Route/nav types |
| `salary-plans.ts` | Salary plan types |
| `supabase.ts` | DB types |
| `domains/` | Domain entity types (3 files) |
| `business/` | Business logic types (3 files) |
| `index.ts` | Barrel exports |

---

## Domain Type Categorization

### Target Structure

```
packages/shared/src/types/
├── index.ts                 # Main barrel export
├── domains/
│   ├── index.ts
│   ├── employee.ts          # Employee, EmployeeForm, etc.
│   ├── branch.ts            # Branch, BranchManager
│   ├── salary.ts            # Salary, SalaryPlan, Commission
│   ├── deduction.ts         # Deduction, Loan
│   └── document.ts          # EmployeeDocument
├── business/
│   ├── index.ts
│   ├── calculations.ts      # Salary calculation types
│   └── payslip.ts           # Payslip generation types
├── api/
│   ├── index.ts
│   └── supabase.ts          # Database types
├── ui/
│   ├── index.ts
│   ├── navigation.ts
│   └── dialog.ts
└── common/
    ├── index.ts
    └── language.ts
```

---

## Type Merge Strategy

### Priority 1: Merge Duplicate Domain Types

| Type Name | Sources | Merge Into |
|-----------|---------|------------|
| `Employee` | owner/employees/types, manager/types | `domains/employee.ts` |
| `Branch` | shared/types, owner/types | `domains/branch.ts` |
| `Deduction` | owner/employees/types, manager/types | `domains/deduction.ts` |
| `Loan` | owner/employees/types, manager/types | `domains/deduction.ts` |
| `SalaryRecord` | owner/employees/types, manager/types | `domains/salary.ts` |

### Priority 2: Keep Feature-Specific Types Local

| Type | Keep In | Reason |
|------|---------|--------|
| `CustomerBooking` | `features/customer/types/` | Only used in customer |
| `AuthSession` | `features/auth/types/` | Only used in auth |

---

## Step-by-Step Process

### Step 4.1: Audit All Type Directories

```powershell
# View each type directory
dir c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src\features\manager\types\
dir c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src\features\owner\employees\types\
```

### Step 4.2: Identify Overlaps

For each type file, check:
1. Does same type exist in shared?
2. Are the definitions compatible?
3. Merge or rename?

### Step 4.3: Merge Types

Example merge for `Employee`:

```typescript
// packages/shared/src/types/domains/employee.ts

// Common Employee interface - single source of truth
export interface Employee {
  id: string;
  name: string;
  name_ar?: string;
  branch_id: string;
  role: EmployeeRole;
  salary_plan_id?: string;
  phone?: string;
  email?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'terminated';
  created_at: string;
  updated_at: string;
}

export type EmployeeRole = 'barber' | 'manager' | 'receptionist' | 'cleaner';

export interface EmployeeFormData extends Omit<Employee, 'id' | 'created_at' | 'updated_at'> {
  // Form-specific fields
}

export interface EmployeeWithBranch extends Employee {
  branch: Branch;
}
```

### Step 4.4: Update Barrel Exports

**File**: `packages/shared/src/types/index.ts`

```typescript
// Domain types
export * from './domains/employee';
export * from './domains/branch';
export * from './domains/salary';
export * from './domains/deduction';
export * from './domains/document';

// Business types
export * from './business/calculations';
export * from './business/payslip';

// API types
export * from './api/supabase';

// UI types
export * from './ui/navigation';
export * from './ui/dialog';

// Common types
export * from './common/language';
```

### Step 4.5: Update All Imports

```typescript
// BEFORE
import { Employee } from '../types/employee';
import { Deduction } from '../../types';

// AFTER
import type { Employee, Deduction } from '@shared/types';
```

---

## Import Update Commands

```powershell
# Find all feature-local type imports
grep_search Query="from '../types" SearchPath="c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src\features"
grep_search Query="from '../../types" SearchPath="c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src\features"
grep_search Query="from './types" SearchPath="c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src\features"
```

---

## Validation

```powershell
# TypeScript must pass with no errors
npx tsc --noEmit

# Build must succeed
npm run build
```

---

## Completion Criteria

- [ ] All domain types in `packages/shared/src/types/domains/`
- [ ] All business types in `packages/shared/src/types/business/`
- [ ] Feature-specific types documented
- [ ] Empty `src/types/` deleted
- [ ] All imports use `@shared/types`
- [ ] `npx tsc --noEmit` passes

---

*Next Phase*: [06_PHASE5_ROUTING.md](./06_PHASE5_ROUTING.md)
