# 🚀 PHASE 3 EXECUTION PLAN

> **Execution Date**: January 26, 2026  
> **Estimated Time**: 1.5 hours  
> **Risk Level**: LOW  
> **Status**: COMPLETED

---

## 📋 EXECUTION CHECKLIST

### Phase 3.1: Remove Re-Exports (15 minutes)

#### Step 1.1: Find all imports of re-export files
```bash
# Find use-mobile imports
grep -r "from '@/features/manager/hooks/use-mobile'" src

# Find use-toast imports  
grep -r "from '@/features/manager/hooks/use-toast'" src
```

#### Step 1.2: Update imports in 6 files

**File 1: `src/features/manager/employees/payslip/PayslipViewer.tsx:11`**
- Change: `from '@/features/manager/hooks/use-mobile'`
- To: `from '@shared/hooks/use-mobile'`

**File 2: `src/features/manager/hooks/useSalaryCalculation.ts:11`**
- Change: `from '@/features/manager/hooks/use-toast'`
- To: `from '@shared/hooks/use-toast'`

**File 3: `src/features/manager/hooks/useFullscreen.ts:4`**
- Change: `from '@/features/manager/hooks/use-toast'`
- To: `from '@shared/hooks/use-toast'`

**File 4: `src/features/manager/hooks/salary/useEmployeeSalaryData.ts:8`**
- Change: `from '@/features/manager/hooks/use-toast'`
- To: `from '@shared/hooks/use-toast'`

**File 5: `src/features/manager/pages/Employees.tsx:15`**
- Change: `from '@/features/manager/hooks/use-toast'`
- To: `from '@shared/hooks/use-toast'`

**File 6: `src/features/manager/employees/DeductionLoanForm.tsx:13`**
- Change: `from '@/features/manager/hooks/use-toast'`
- To: `from '@shared/hooks/use-toast'`

#### Step 1.3: Delete re-export files
```bash
rm src/features/manager/hooks/use-mobile.tsx
rm src/features/manager/hooks/use-toast.ts
```

#### Step 1.4: Verify no broken imports
```bash
grep -r "from '@/features/manager/hooks/use-mobile'" src
grep -r "from '@/features/manager/hooks/use-toast'" src
# Should return 0 results
```

---

### Phase 3.2: Consolidate Duplicate `useLogout` (15 minutes)

#### Step 2.1: Create shared auth hooks directory
```bash
mkdir -p packages/shared/src/hooks/auth
```

#### Step 2.2: Create shared `useLogout.ts` file
**File**: `packages/shared/src/hooks/auth/useLogout.ts`
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { logout as sharedLogout } from '@shared/lib/access-code/auth';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async () => {
    try {
      // Clear server-side session variables and local storage
      await sharedLogout();

      // Clear React Query cache
      queryClient.clear();

      // Optionally clear app caches via service worker helper if available
      if (typeof window.clearAppCache === 'function') {
        // Best-effort, do not await
        try {
          window.clearAppCache();
        } catch (_) {
          // ignore
        }
      }
    } finally {
      navigate('/login');
    }
  };
}
```

#### Step 2.3: Update feature imports
**File 1: `src/features/auth/hooks/index.ts`** (or wherever auth imports useLogout)
- Update to import from `@shared/hooks/auth/useLogout`

**File 2: `src/features/owner/hooks/index.ts`** (or wherever owner imports useLogout)
- Update to import from `@shared/hooks/auth/useLogout`

#### Step 2.4: Delete duplicate files
```bash
rm src/features/auth/hooks/useLogout.ts
rm src/features/owner/hooks/useLogout.ts
```

#### Step 2.5: Remove empty auth hooks directory (if empty)
```bash
rmdir src/features/auth/hooks/  # Only if empty after removing useLogout.ts
```

---

### Phase 3.3: Remove Duplicate `useFileValidation` (10 minutes)

#### Step 3.1: Remove duplicate from root
```bash
rm packages/shared/src/hooks/useFileValidation.ts
```

#### Step 3.2: Check for imports that need updating
```bash
grep -r "from '@shared/hooks/useFileValidation'" .
```

#### Step 3.3: Update any imports to use file-management version
- Change: `from '@shared/hooks/useFileValidation'`
- To: `from '@shared/hooks/file-management/useFileValidation'`

---

### Phase 3.4: Clean Up Empty Directories (5 minutes)

#### Step 4.1: Remove empty customer hooks directory
```bash
rm -rf src/features/customer/hooks/
```

#### Step 4.2: Remove empty auth hooks directory (after consolidation)
```bash
rm -rf src/features/auth/hooks/
```

---

### Phase 3.5: Validation (10 minutes)

#### Step 5.1: Run lint check
```bash
npm run lint
```

#### Step 5.2: Run TypeScript type check
```bash
npx tsc --noEmit
```

#### Step 5.3: Build the project
```bash
npm run build
```

#### Step 5.4: Test critical paths
1. Manager employee page
2. Owner employee page  
3. Auth logout functionality
4. File upload validation

---

## 🎯 SUCCESS CRITERIA

### Primary Validation
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run build` succeeds
- [ ] `npx tsc --noEmit` passes with 0 type errors

### File Validation
- [ ] No imports to `@/features/manager/hooks/use-mobile` or `use-toast`
- [ ] `useLogout` only exists in `@shared/hooks/auth/useLogout.ts`
- [ ] `useFileValidation` only exists in `@shared/hooks/file-management/useFileValidation.ts`
- [ ] Empty directories removed: `src/features/customer/hooks/`, `src/features/auth/hooks/`

### Functionality Validation  
- [ ] Manager pages load without errors
- [ ] Owner pages load without errors
- [ ] Logout works for both auth and owner flows
- [ ] File validation works correctly

---

## ⚠️ RISK MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| Broken imports after re-export removal | Medium | Verify imports before deletion, update all found imports |
| Shared `useLogout` not compatible with both auth/owner | Low | Keep identical implementation, test both logout flows |
| Duplicate removal breaks existing imports | Low | Check import paths, update to correct shared location |
| Build failures after changes | Medium | Run lint/build after each major step, revert if issues |

---

## 📊 EXPECTED OUTCOME

### File Count Changes
| Location | Before | After | Change |
|----------|--------|-------|--------|
| `packages/shared/src/hooks/` | 37 | 36 | -1 (remove duplicate useFileValidation) |
| `packages/shared/src/hooks/auth/` | 0 | 1 | +1 (add useLogout) |
| `src/features/auth/hooks/` | 1 | 0 | -1 (consolidate to shared) |
| `src/features/customer/hooks/` | 1 | 0 | -1 (empty directory) |
| `src/features/manager/hooks/` | 10 | 8 | -2 (remove re-exports) |
| `src/features/owner/hooks/` | 2 | 1 | -1 (consolidate useLogout) |

### Architecture Improvements
1. **Eliminated re-exports**: Direct imports from shared hooks
2. **Consolidated duplicates**: Single source of truth for `useLogout` and `useFileValidation`
3. **Cleaned up empty directories**: Removed unnecessary directory structure
4. **Improved import patterns**: All hooks follow `@shared/hooks/*` or `@features/*/hooks/*` pattern

---

## 🔄 ROLLBACK PLAN

If any step fails:

1. **Git status check**: `git status` to see changes
2. **Git stash**: `git stash` to temporarily save changes
3. **Restore original**: `git checkout -- .` to revert all changes
4. **Re-analyze**: Review failure reason, adjust approach

---

*Execution Notes*:
- Run commands in order
- Validate after each major step
- Commit changes after successful validation
- Update `01_CHECKLIST.md` upon completion