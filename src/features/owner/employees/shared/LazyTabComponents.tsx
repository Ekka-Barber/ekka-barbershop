// Lazy load heavy tab components for better performance
import { lazy } from 'react';

export const BonusesTab = lazy(() =>
  import('@/features/owner/employees/tabs/BonusesTab').then((module) => ({
    default: module.BonusesTab,
  }))
);

export const DeductionsTab = lazy(() =>
  import('@/features/owner/employees/tabs/DeductionsTab').then((module) => ({
    default: module.DeductionsTab,
  }))
);

export const LoansTab = lazy(() =>
  import('@/features/owner/employees/tabs/LoansTab').then((module) => ({
    default: module.LoansTab,
  }))
);

export const SalariesTab = lazy(() =>
  import('@/features/owner/employees/tabs/SalariesTab').then((module) => ({
    default: module.SalariesTab,
  }))
);

export const SalesTab = lazy(() =>
  import('@/features/owner/employees/tabs/SalesTab').then((module) => ({
    default: module.SalesTab,
  }))
);

export const LeaveTab = lazy(() =>
  import('@/features/owner/employees/tabs/LeaveTab').then((module) => ({
    default: module.LeaveTab,
  }))
);
