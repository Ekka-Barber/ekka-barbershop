# 🪝 PHASE 3: HOOK CONSOLIDATION

> **Estimated Time**: 1 hour (revised from 2-3 days)
> **Risk Level**: LOW (revised from Medium)
> **Dependencies**: Phase 2 complete
> **Status**: ✅ Analysis Complete - Ready for Action

---

## Overview

**Independent Audit Findings**: The hooks architecture is **mostly well-organized**, but independent audit revealed 2 missed duplicates. After deep analysis of 87 hook files across 7 directories, the findings are:

- ⚠️ **2 true duplicates** found (missed in initial analysis)
- ⚠️ **2 re-export files** to remove (manager hooks)
- ✅ **36 hooks already centralized** in shared (41%)
- ✅ **Phase 2 successfully completed** - employee operations centralized
- ✅ **Feature-specific hooks** are intentionally local for different business logic

**Conclusion**: Minimal cleanup needed. Consolidate 2 duplicates and remove 2 re-exports.

---

## Current Hook Distribution (UPDATED)

 ```mermaid
graph TD
    subgraph "Current State (7 locations)"
        A["packages/shared/src/hooks/<br/>36 files ✅ Central"]
        B["features/auth/hooks/<br/>0 files ✅ Consolidated"]
        C["features/customer/hooks/<br/>1 file ⚠️ Empty"]
        D["features/customer/components/hooks/<br/>1 file ✅ Keep"]
        E["features/manager/hooks/<br/>8 unique + 2 re-exports"]
        F["features/owner/hooks/<br/>1 file ✅ Keep"]
        G["features/owner/employees/hooks/<br/>26 files ✅ Keep"]
    end
```

### Detailed Inventory (POST-AUDIT)

| Location | File Count | Status | Action |
|----------|------------|--------|--------|
| `packages/shared/src/hooks/` | 36 | ✅ Centralized | Remove duplicate `useFileValidation` |
| `packages/shared/src/hooks/employee/` | 4 | ✅ Phase 2 Complete | Keep as-is |
| `features/auth/hooks/` | 0 | ✅ Consolidated | Remove duplicate `useLogout` |
| `features/customer/hooks/` | 1 | ❌ Empty dir | Remove empty directory |
| `features/customer/components/hooks/` | 1 | ✅ Customer-specific | Keep in place |
| `features/manager/hooks/` | 10 | ⚠️ 2 re-exports | Remove re-exports, keep 8 |
| `features/manager/hooks/salary/` | 3 | ✅ Manager-specific | Keep in place |
| `features/owner/hooks/` | 1 | ✅ Owner-specific | Keep `useLogout` until consolidation |
| `features/owner/employees/hooks/` | 26 | ✅ Owner-specific | Keep in place |

---

## Analysis Summary

### Files to Remove: 2

| File | Reason | Impact |
|------|---------|--------|
| `src/features/manager/hooks/use-mobile.tsx` | Re-export of `@shared/hooks/use-mobile` | Low - 6 imports found |
| `src/features/manager/hooks/use-toast.ts` | Re-export of `@shared/hooks/use-toast` | Low - 6 imports found |

### Re-Export Usage Analysis

```bash
# Imports found:
from '@/features/manager/hooks/use-mobile':  1 file
from '@/features/manager/hooks/use-toast':  5 files
```

**Files to update**:
1. `src/features/manager/hooks/useSalaryCalculation.ts:11`
2. `src/features/manager/hooks/useFullscreen.ts:4`
3. `src/features/manager/hooks/salary/useEmployeeSalaryData.ts:8`
4. `src/features/manager/pages/Employees.tsx:15`
5. `src/features/manager/employees/payslip/PayslipViewer.tsx:11`
6. `src/features/manager/employees/DeductionLoanForm.tsx:13`

### Duplicates Found: 2

| Duplicate File | Location 1 | Location 2 | Status | Action |
|----------------|------------|------------|--------|--------|
| `useLogout.ts` | `src/features/auth/hooks/` | `src/features/owner/hooks/` | **Identical** (100% match) | Consolidate to `@shared/hooks/auth/useLogout.ts` |
| `useFileValidation.ts` | `packages/shared/src/hooks/` | `packages/shared/src/hooks/file-management/` | **Identical** (byte-for-byte) | Remove duplicate from root, keep file-management version |

### Key Findings

| Category | Hooks | Status |
|----------|--------|--------|
| **True Duplicates** | 2 | Missed in initial analysis |
| **Feature-Specific Hooks** | 38 | Intentionally local (keep) |
| **Already Centralized** | 36 | In `packages/shared/src/hooks/` |
| **Re-exports** | 2 | Remove & update consumers |

**Architecture Assessment**: ✅ **GOOD** (with minor cleanup needed)
- Shared hooks mostly centralized (36 files)
- Feature-specific hooks properly separated
- Minimal code duplication (2 files)
- Clear separation of concerns

---

## Migration Plan (REVISED)

### Task 3.1: Remove Re-Exports (15 minutes)

**Steps**:

1. Search for re-export usage:
   ```bash
   grep -r "from '@/features/manager/hooks/use-mobile'" src
   grep -r "from '@/features/manager/hooks/use-toast'" src
   ```

2. Replace imports in 6 files:

   **use-mobile.tsx re-export** (1 file):
   - File: `src/features/manager/employees/payslip/PayslipViewer.tsx:11`
   - Replace: `from '@/features/manager/hooks/use-mobile'`
   - With: `from '@shared/hooks/use-mobile'`

   **use-toast.ts re-export** (5 files):
   - File 1: `src/features/manager/hooks/useSalaryCalculation.ts:11`
   - File 2: `src/features/manager/hooks/useFullscreen.ts:4`
   - File 3: `src/features/manager/hooks/salary/useEmployeeSalaryData.ts:8`
   - File 4: `src/features/manager/pages/Employees.tsx:15`
   - File 5: `src/features/manager/employees/DeductionLoanForm.tsx:13`
   - Replace: `from '@/features/manager/hooks/use-toast'`
   - With: `from '@shared/hooks/use-toast'`

3. Delete re-export files:
   ```bash
   rm src/features/manager/hooks/use-mobile.tsx
   rm src/features/manager/hooks/use-toast.ts
   ```

4. Verify:
   ```bash
   npm run lint
   npm run build
   npx tsc --noEmit
   ```

### Task 3.2: Consolidate Duplicate `useLogout` (15 minutes)

**Steps**:
1. Create shared logout hook: `packages/shared/src/hooks/auth/useLogout.ts`
2. Move common logic from both `useLogout` files to shared version
3. Update auth and owner features to import from `@shared/hooks/auth/useLogout`
4. Delete duplicate files:
   ```bash
   rm src/features/auth/hooks/useLogout.ts
   rm src/features/owner/hooks/useLogout.ts
   ```

### Task 3.3: Remove Duplicate `useFileValidation` (10 minutes)

**Steps**:
1. Remove duplicate from root: `packages/shared/src/hooks/useFileValidation.ts`
2. Update any imports to use file-management version:
   ```bash
   # Check for imports
   grep -r "from '@shared/hooks/useFileValidation'" .
   # Update to: from '@shared/hooks/file-management/useFileValidation'
   ```

### Task 3.4: Clean Up Empty Directories (5 minutes)

1. Remove empty customer hooks directory:
   ```bash
   rm -rf src/features/customer/hooks/
   ```

2. Remove empty auth hooks directory (after consolidation):
   ```bash
   rm -rf src/features/auth/hooks/
   ```

### Task 3.5: Update Documentation (30 minutes)

1. Create `docs/hooks-architecture.md`
2. Document:
   - Which hooks are in shared and why
   - Which hooks are feature-specific and why
   - Import patterns: `@shared/hooks/*` vs `@features/*/hooks/*`
   - Duplicate resolution process

---

## Validation Commands

```powershell
# After removing re-exports
npx tsc --noEmit
npm run lint
npm run build

# Verify no broken imports
grep -r "from '@/features/manager/hooks/use-mobile'" src
grep -r "from '@/features/manager/hooks/use-toast'" src
# Above should return 0 results
```

---

## Completion Criteria

- [x] 3.1 Audit all 7 hook directories
- [x] 3.2 Document duplicates (revised: 2 found)
- [x] 3.3-3.7 Analyze hook relationships
- [x] 3.8 Determine shared hooks (36 files)
- [ ] 3.9 Remove 2 re-export files
- [ ] 3.10 Update 6 import statements
- [ ] 3.11 Consolidate duplicate `useLogout` to shared
- [ ] 3.12 Remove duplicate `useFileValidation` from root
- [ ] 3.13 Clean up empty directories (customer/hooks, auth/hooks)
- [ ] 3.14 Update documentation
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] All manager pages functional

---

## Analysis Report

See [phase3_hook_analysis.md](./phase3_hook_analysis.md) for detailed analysis of:
- All 87 hook files audited
- Hook complexity ratings
- Usage patterns
- Duplication analysis
- Migration recommendations

**Key Metrics**:

| Metric | Value |
|--------|-------|
| Total hook files analyzed | 87 |
| Unique hook implementations | 69 |
| Already centralized | 36 (41%) |
| Feature-specific to keep | 80 (92%) |
| Re-exports to remove | 2 (2%) |
| True duplicates | 2 (2%) |
| Estimated migration time | 1.5 hours (vs 2-3 days planned) |
| Risk level | LOW (vs Medium planned) |

---

*Next Phase*: [05_PHASE4_TYPES.md](./05_PHASE4_TYPES.md) - Skip if not needed
