# 📂 TARGET STRUCTURE

> **Purpose**: Final folder structure after all phases complete

---

## Folder Tree (Post-Consolidation)

```
ekka-app/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── turbo.json
│
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts                    # Main barrel export
│   │       ├── constants/
│   │       │   ├── index.ts
│   │       │   ├── branches.ts
│   │       │   ├── routes.ts
│   │       │   ├── design-tokens.ts        # NEW
│   │       │   └── ... (4 more)
│   │       ├── hooks/
│   │       │   ├── index.ts                # Updated barrel
│   │       │   ├── employee/               # NEW directory
│   │       │   │   ├── index.ts
│   │       │   │   ├── useEmployeeForm.ts
│   │       │   │   ├── useEmployeeList.ts
│   │       │   │   ├── useDeductions.ts
│   │       │   │   └── useLoans.ts
│   │       │   ├── payslip/                # NEW directory
│   │       │   │   ├── index.ts
│   │       │   │   └── usePayslipGenerator.ts
│   │       │   ├── salary/                 # NEW directory
│   │       │   │   ├── index.ts
│   │       │   │   └── useSalaryData.ts
│   │       │   ├── file-management/
│   │       │   ├── qr-analytics/
│   │       │   └── ... (standalone hooks)
│   │       ├── lib/
│   │       │   ├── index.ts
│   │       │   ├── access-code/
│   │       │   ├── form-validation/
│   │       │   ├── pdf/
│   │       │   ├── salary/
│   │       │   ├── supabase/
│   │       │   ├── employee/               # NEW directory
│   │       │   │   ├── index.ts
│   │       │   │   ├── utils.ts
│   │       │   │   └── constants.ts
│   │       │   ├── query-client.ts
│   │       │   └── query-keys.ts
│   │       ├── services/
│   │       │   └── ... (7 files)
│   │       ├── types/
│   │       │   ├── index.ts                # Updated barrel
│   │       │   ├── domains/
│   │       │   │   ├── index.ts
│   │       │   │   ├── employee.ts         # Consolidated
│   │       │   │   ├── branch.ts
│   │       │   │   ├── salary.ts
│   │       │   │   ├── deduction.ts        # NEW
│   │       │   │   └── document.ts
│   │       │   ├── business/
│   │       │   │   ├── index.ts
│   │       │   │   ├── calculations.ts
│   │       │   │   └── payslip.ts
│   │       │   ├── api/
│   │       │   │   ├── index.ts
│   │       │   │   └── supabase.ts
│   │       │   ├── ui/
│   │       │   │   ├── index.ts
│   │       │   │   ├── navigation.ts
│   │       │   │   └── dialog.ts
│   │       │   └── common/
│   │       │       ├── index.ts
│   │       │       └── language.ts
│   │       └── utils/
│   │           └── ... (14 files)
│   │
│   └── ui/
│       ├── package.json
│       └── src/
│           ├── index.ts
│           └── components/
│               ├── common/
│               ├── shared/
│               │   └── loaders/
│               │       └── PageLoader.tsx   # Single source
│               └── ... (66 more)
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css                           # Design tokens here
│   ├── vite-env.d.ts
│   ├── STRUCTURE.md                        # Updated
│   │
│   ├── app/
│   │   ├── components/
│   │   ├── providers/
│   │   │   └── AppInitializer.tsx          # Cleaned up
│   │   ├── router/
│   │   │   └── AppRouter.tsx               # ONLY file (ownerRoutes.tsx deleted)
│   │   └── stores/
│   │
│   ├── assets/
│   │
│   ├── contexts/
│   │   └── LanguageContext.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/                      # Feature-specific only
│   │   │   ├── pages/
│   │   │   ├── types/                      # Feature-specific only
│   │   │   └── utils/
│   │   │
│   │   ├── customer/
│   │   │   ├── components/
│   │   │   │   └── (NO nested hooks/)      # Flattened
│   │   │   ├── hooks/                      # Feature-specific only
│   │   │   ├── pages/
│   │   │   ├── routes.tsx                  # Uses PageLoader
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── manager/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── employees/                  # Simplified
│   │   │   │   ├── payslip/
│   │   │   │   ├── salary/
│   │   │   │   └── (imports from @shared)
│   │   │   ├── hooks/                      # Manager-specific only
│   │   │   ├── pages/
│   │   │   ├── routes.tsx                  # ManagerGuard renamed
│   │   │   ├── types/                      # Manager-specific only
│   │   │   └── utils/
│   │   │
│   │   ├── owner/
│   │   │   ├── admin/
│   │   │   ├── branches/
│   │   │   ├── components/
│   │   │   ├── employees/                  # Core logic extracted
│   │   │   │   └── (imports from @shared)
│   │   │   ├── hooks/                      # Owner-specific only
│   │   │   ├── pages/
│   │   │   ├── routes.tsx                  # All owner routes here
│   │   │   ├── settings/
│   │   │   ├── types/                      # Owner-specific only
│   │   │   └── utils/
│   │   │
│   │   └── shared-features/
│   │       ├── qr-code/
│   │       └── ui-elements/
│   │
│   ├── i18n/
│   │   └── translations.ts
│   │
│   └── styles/
│       └── ... (additional styles)
│
└── (DELETED)
    ├── src/types/                          # Removed (was empty)
    └── src/app/router/ownerRoutes.tsx      # Merged into owner/routes.tsx
```

---

## File Count Summary

| Directory | Before | After | Change |
|-----------|--------|-------|--------|
| `packages/shared/src/hooks/` | 33 | ~45 | +12 (consolidated) |
| `packages/shared/src/types/` | 14 | ~20 | +6 (merged) |
| `features/*/hooks/` | ~45 total | ~15 total | -30 (moved to shared) |
| `features/*/types/` | ~18 total | ~8 total | -10 (moved to shared) |
| `app/router/` | 2 | 1 | -1 (merged) |

---

## Import Path Reference

| What | Import From |
|------|-------------|
| Employee types | `@shared/types` |
| Employee hooks | `@shared/hooks/employee` |
| Salary hooks | `@shared/hooks/salary` |
| UI components | `@shared/ui/*` |
| Utilities | `@shared/utils/*` |
| Constants | `@shared/constants/*` |
| Supabase | `@shared/lib/supabase/*` |

---

*Reference*: [09_SINGLE_SOURCE_TRUTH.md](./09_SINGLE_SOURCE_TRUTH.md)
