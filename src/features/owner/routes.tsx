import { ReactNode, Suspense } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';

import { useRoleSession } from '@shared/hooks/useRoleSession';
import { ensureOwnerSession } from '@shared/lib/access-code/auth';
import { ErrorBoundary } from '@shared/ui/components/common/ErrorBoundary';
import Layout from '@shared/ui/components/shared/Layout';
import { PageLoader } from '@shared/ui/components/shared/loaders/PageLoader';
import { lazyWithRetry } from '@shared/utils/lazyWithRetry';

import { AppInitializer } from '@/app/providers/AppInitializer';

const Dashboard = lazyWithRetry(() => import('@/features/owner/pages/Dashboard'));
const Employees = lazyWithRetry(() => import('@/features/owner/pages/Employees').then(mod => ({ default: mod.Employees })));
const Admin = lazyWithRetry(() => import('@/features/owner/pages/Admin/Admin'));

interface OwnerAppRoutesProps {
  selectedBranch: string;
}

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

const OwnerAppRoutes: React.FC<OwnerAppRoutesProps> = ({ selectedBranch }) => {
  return (
    <Routes>
      <Route
        index
        element={
          <LazyRoute
            component={Dashboard}
            props={{ selectedBranch }}
            loadingMessage="Loading dashboard..."
          />
        }
      />
      <Route
        path="employees"
        element={
          <LazyRoute
            component={Employees}
            props={{ selectedBranch }}
            loadingMessage="Loading employee management..."
          />
        }
      />
      <Route
        path="settings"
        element={<Navigate to="/owner/admin?tab=general" replace />}
      />
      <Route
        path="admin"
        element={
          <LazyRoute
            component={Admin}
            props={{ selectedBranch }}
            loadingMessage="Loading admin..."
          />
        }
      />
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="section-title mb-2">Page Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The page you&apos;re looking for doesn&apos;t exist.
              </p>
              <Link to="/owner" className="text-primary hover:underline">
                Go back to dashboard
              </Link>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

const OwnerGuard = ({ children }: { children: ReactNode }) => {
  const status = useRoleSession(ensureOwnerSession);

  if (status === 'checking') {
    return <PageLoader message="Validating owner access..." />;
  }

  if (status === 'denied') {
    return <Navigate to="/customer" replace />;
  }

  return <>{children}</>;
};

const OwnerShell = () => (
  <OwnerGuard>
    <AppInitializer>
      <Layout>
        {({ selectedBranch }) => (
          <OwnerAppRoutes selectedBranch={selectedBranch} />
        )}
      </Layout>
    </AppInitializer>
  </OwnerGuard>
);

export const OwnerRoutes = () => (
  <Routes>
    <Route path="*" element={<OwnerShell />} />
  </Routes>
);
