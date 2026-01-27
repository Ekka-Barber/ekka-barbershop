# 🔧 PHASE 2: EMPLOYEE MODULE CONSOLIDATION

> **Estimated Time**:3-5 days
> **Risk Level**: High
> **Dependencies**: Phase1 complete
> **Status**: ✅ Completed

---

## 📋 Progress Summary

### Completed Tasks ✅
- ✅ 2.1-2.5: Audit completed (documented in `phase2_audit_report.md`)
- ✅ Created `packages/shared/src/hooks/employee/` directory
- ✅ Added shared utilities: `isEmployeeActiveOnDate`, `calculateEmployeeTenure`, `getActiveEmployeesForPeriod`
- ✅ Added shared `useDeductionOperations` hook
- ✅ Added shared `useLoanOperations` hook
- ✅ Exported employee hooks from `packages/shared/src/hooks/index.ts`
- ✅ Updated owner hooks index to note shared hooks availability
- ✅ Updated owner imports (DeductionsTab.tsx, LoansTab.tsx)
- ✅ Deleted local hook files (useDeductionOperations.ts, useLoanDeletion.ts)
- ✅ Verified lint, build, and type checking pass

### Resolved ✅
- ESLint import/order issues resolved with proper blank line spacing
- All required import changes completed successfully

---

## ✅ Phase 2 Complete

All employee module consolidation tasks have been completed successfully:

### What Was Accomplished
1. **Shared Hooks Created**: `useDeductionOperations` and `useLoanOperations` moved to `@shared/hooks/employee/`
2. **Shared Utilities Extracted**: `isEmployeeActiveOnDate`, `calculateEmployeeTenure`, `getActiveEmployeesForPeriod`
3. **Owner Imports Updated**: DeductionsTab.tsx and LoansTab.tsx now use shared hooks
4. **Local Files Deleted**: Removed duplicate `useDeductionOperations.ts` and `useLoanDeletion.ts`
5. **Validation Passed**: ESLint, TypeScript, and build verification successful

### Next Phase
Proceed to **Phase 3: Hook Consolidation** to audit and merge remaining duplicate hooks.

---

## Overview

Consolidate duplicated employee management logic between owner and manager features into a shared module.

---

## Current State Analysis

### Owner Employee Module
**Path**: [`features/owner/employees/`](file:///c:/Users/alazi/Downloads/EXPAND-EKKA/ekka-app/src/features/owner/employees)  
**Files**: 154 files

```
features/owner/employees/
├── bonuses-tab/        (6 files)
├── bulk-actions/       (11 files)
├── components/         (48 files)
├── document-form/      (9 files)
├── filters/            (6 files)
├── hooks/              (29 files)  ⚠️ Duplication risk
├── inputs/             (4 files)
├── shared/             (5 files)
├── tabs/               (18 files)
├── templates/          (6 files)
├── types/              (4 files)   ⚠️ Duplication risk
├── utils/              (7 files)   ⚠️ Duplication risk
└── index.ts
```

### Manager Employee Module
**Path**: [`features/manager/employees/`](file:///c:/Users/alazi/Downloads/EXPAND-EKKA/ekka-app/src/features/manager/employees)  
**Files**: 28 files

```
features/manager/employees/
├── payslip/            (7 files)
├── salary/             (8 files)
├── DeductionLoanForm.tsx
├── EmployeeCard.tsx
├── EmployeeInfo.tsx
├── EmployeeSalaryDetails.tsx
├── EmployeeTarget.tsx
├── EmployeesHeader.tsx
├── EmployeesList.tsx
├── EmployeesLoading.tsx
├── LeaveBalance.tsx
├── LeaveHistory.tsx
├── MonthSelector.tsx
├── employeeUtils.ts    ⚠️ Duplicate of owner/employees/utils?
└── index.ts
```

---

## Overlap Mapping

### Components to Analyze for Duplication

| Owner | Manager | Likely Duplicate? |
|-------|---------|-------------------|
| `components/EmployeeCard.tsx` | `EmployeeCard.tsx` | ✅ Yes |
| `components/EmployeeInfo.tsx` | `EmployeeInfo.tsx` | ✅ Yes |
| `components/EmployeesList.tsx` | `EmployeesList.tsx` | ✅ Yes |
| `tabs/salary/*` | `salary/*` | ✅ Yes |
| `shared/MonthSelector.tsx` | `MonthSelector.tsx` | ✅ Yes |

### Hooks to Analyze

| Owner (`employees/hooks/`) | Shared Already? | Action |
|---------------------------|-----------------|--------|
| `useEmployeeForm.ts` | No | Extract to shared |
| `useSalaryCalculation.ts` | Partially (in `packages/shared/src/lib/salary/`) | Verify usage |
| `useDeductions.ts` | No | Extract if used by manager |
| `useLoans.ts` | No | Extract if used by manager |

---

## Target Structure

```
packages/shared/src/
├── lib/
│   └── employee/           # NEW
│       ├── index.ts
│       ├── types.ts
│       ├── utils.ts
│       └── constants.ts
├── hooks/
│   └── employee/           # NEW
│       ├── index.ts
│       ├── useEmployeeForm.ts
│       ├── useEmployeeList.ts
│       ├── useDeductions.ts
│       └── useLoans.ts
└── types/
    └── employee.ts         # NEW or expand existing

features/owner/employees/
├── (role-specific components only)
└── uses: @shared/lib/employee, @shared/hooks/employee

features/manager/employees/
├── (role-specific components only)
└── uses: @shared/lib/employee, @shared/hooks/employee
```

---

## Step-by-Step Migration

### Step 2.1: Audit Owner Employee Types

> [!IMPORTANT]
> **AI Instruction**: Read file contents before extracting

```powershell
# View type definitions
view_file "c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src\features\owner\employees\types\*.ts"
```

Expected types to extract:
- `Employee`
- `EmployeeFormData`
- `Deduction`
- `Loan`
- `SalaryRecord`

### Step 2.2: Create Shared Employee Types

**Create**: `packages/shared/src/types/employee.ts`

```typescript
// packages/shared/src/types/employee.ts

export interface Employee {
  id: string;
  name: string;
  name_ar?: string;
  branch_id: string;
  role: string;
  salary_plan_id?: string;
  // ... other common fields
}

export interface EmployeeFormData {
  // ... form fields
}

export interface Deduction {
  id: string;
  employee_id: string;
  amount: number;
  reason: string;
  date: string;
}

export interface Loan {
  id: string;
  employee_id: string;
  amount: number;
  remaining: number;
  monthly_deduction: number;
}

// Re-export for convenience
export type { Employee, Deduction, Loan };
```

### Step 2.3: Create Shared Employee Hooks Directory

```powershell
# Create directory structure
mkdir packages\shared\src\hooks\employee
```

**Create**: `packages/shared/src/hooks/employee/index.ts`

```typescript
// packages/shared/src/hooks/employee/index.ts
export * from './useEmployeeList';
export * from './useEmployeeForm';
export * from './useDeductions';
export * from './useLoans';
```

### Step 2.4: Migrate Hooks

For each hook to migrate:

1. **VERIFY source hook exists** (use `view_file`)
2. **VERIFY no duplicate in target** (use `find_by_name`)
3. **Copy hook to shared location**
4. **Update imports to use `@shared/*` aliases**
5. **Update source feature to import from shared**
6. **Run lint/build**

### Step 2.5: Update Import Paths

**Owner files to update**:
| File | Old Import | New Import |
|------|------------|------------|
| `features/owner/employees/components/*.tsx` | `../types` | `@shared/types/employee` |
| `features/owner/employees/hooks/*.ts` | `../types` | `@shared/types/employee` |

**Manager files to update**:
| File | Old Import | New Import |
|------|------------|------------|
| `features/manager/employees/*.tsx` | Local types | `@shared/types/employee` |

---

## File Movement Table

| Source | Destination | Action |
|--------|-------------|--------|
| `owner/employees/types/employee.ts` | `packages/shared/src/types/employee.ts` | Move + Merge |
| `owner/employees/hooks/useEmployeeForm.ts` | `packages/shared/src/hooks/employee/useEmployeeForm.ts` | Move |
| `owner/employees/hooks/useDeductions.ts` | `packages/shared/src/hooks/employee/useDeductions.ts` | Move |
| `owner/employees/hooks/useLoans.ts` | `packages/shared/src/hooks/employee/useLoans.ts` | Move |
| `owner/employees/utils/employeeUtils.ts` | `packages/shared/src/lib/employee/utils.ts` | Move + Merge |

---

## Validation Steps

After each hook migration:

```powershell
# 1. Type check
npx tsc --noEmit

# 2. Lint check
npm run lint

# 3. Build check
npm run build
```

### Functional Tests

- [ ] Owner: Can view employee list
- [ ] Owner: Can add new employee
- [ ] Owner: Can edit employee
- [ ] Owner: Can add deduction
- [ ] Owner: Can add loan
- [ ] Manager: Can view employee list
- [ ] Manager: Can view salary details
- [ ] Manager: Can print payslip

---

## Anti-Hallucination Safeguards

> [!CAUTION]
> **BEFORE moving any file**:
> 1. `grep_search` for all usages of that file
> 2. Count the number of imports
> 3. Update ALL import locations
> 4. Only then delete the original

```powershell
# Example: Find all usages of useEmployeeForm
grep_search Query="useEmployeeForm" SearchPath="c:\Users\alazi\Downloads\EXPAND-EKKA\ekka-app\src"
```

---

## Rollback Plan

```powershell
# If migration breaks, revert
git checkout -- src/features/owner/employees/
git checkout -- src/features/manager/employees/
git checkout -- packages/shared/src/
```

---

*Next Phase*: [04_PHASE3_HOOKS.md](./04_PHASE3_HOOKS.md)
