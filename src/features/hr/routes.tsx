import { ReactNode, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useRoleSession } from '@shared/hooks/useRoleSession';
import { ensureHRSession } from '@shared/lib/access-code/auth';
import { ErrorBoundary } from '@shared/ui/components/common/ErrorBoundary';
import { PageLoader } from '@shared/ui/components/shared/loaders/PageLoader';
import { lazyWithRetry } from '@shared/utils/lazyWithRetry';

import { HRLayout } from './components/HRLayout';

import { AppInitializer } from '@/app/providers/AppInitializer';

const HRManagement = lazyWithRetry(() =>
  import('./pages/HRManagement').then((module) => ({
    default: module.HRManagement,
  }))
);

const LazyRoute = <T extends Record<string, unknown>>({
  component: Component,
  props,
  loadingMessage,
}: {
  component: React.ComponentType<T>;
  props?: T;
  loadingMessage?: string;
}) => (
  <ErrorBoundary componentName={Component.displayName || Component.name}>
    <Suspense fallback={<PageLoader message={loadingMessage} />}>
      <Component {...(props as T)} />
    </Suspense>
  </ErrorBoundary>
);

const HRAppRoutes = () => {
  return (
    <Routes>
      <Route
        index
        element={
          <LazyRoute
            component={HRManagement}
            loadingMessage="جاري تحميل لوحة الموارد البشرية..."
          />
        }
      />
      <Route path="*" element={<Navigate to="/hr" replace />} />
    </Routes>
  );
};

const HRGuard = ({ children }: { children: ReactNode }) => {
  const status = useRoleSession(ensureHRSession);

  if (status === 'checking') {
    return <PageLoader message="جاري التحقق من صلاحيات الموارد البشرية..." />;
  }

  if (status === 'denied') {
    return <Navigate to="/customer" replace />;
  }

  return <>{children}</>;
};

const HRShell = () => (
  <HRGuard>
    <AppInitializer>
      <HRLayout>
        <HRAppRoutes />
      </HRLayout>
    </AppInitializer>
  </HRGuard>
);

export const HRRoutes = () => (
  <Routes>
    <Route path="*" element={<HRShell />} />
  </Routes>
);
