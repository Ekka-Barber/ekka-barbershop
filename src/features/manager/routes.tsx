import { ReactNode, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useRoleSession } from '@shared/hooks/useRoleSession';
import { ensureManagerSession } from '@shared/lib/access-code/auth';
import { PageLoader } from '@shared/ui/components/shared/loaders/PageLoader';
import { lazyWithRetry } from '@shared/utils/lazyWithRetry';

const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Employees = lazyWithRetry(() => import('./pages/Employees'));
const PayslipTest = lazyWithRetry(() => import('./pages/PayslipTest'));


const ManagerGuard = ({ children }: { children: ReactNode }) => {
  const status = useRoleSession(ensureManagerSession);

  if (status === 'checking') {
    return <PageLoader message="Validating manager access..." />;
  }

  if (status === 'denied') {
    return <Navigate to="/customer" replace />;
  }

  return <>{children}</>;
};

export const ManagerRoutes = () => (
  <Routes>
    <Route
      index
      element={
        <ManagerGuard>
          <Suspense fallback={<PageLoader message="Loading dashboard..." />}>
            <Dashboard />
          </Suspense>
        </ManagerGuard>
      }
    />
    <Route
      path="employees"
      element={
        <ManagerGuard>
          <Suspense
            fallback={<PageLoader message="Loading employee tools..." />}
          >
            <Employees />
          </Suspense>
        </ManagerGuard>
      }
    />
    <Route
      path="payslip-test"
      element={
        <ManagerGuard>
          <Suspense fallback={<PageLoader message="Loading payslip..." />}>
            <PayslipTest />
          </Suspense>
        </ManagerGuard>
      }
    />
    <Route path="*" element={<Navigate to="/manager" replace />} />
  </Routes>
);
