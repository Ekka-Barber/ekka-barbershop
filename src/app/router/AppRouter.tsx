import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { PageLoader } from '@shared/ui/components/shared/loaders/PageLoader';
import { lazyWithRetry } from '@shared/utils/lazyWithRetry';

// Lazy load route shells — only the matching role's code loads (saves ~200KB+ on customer visit)
const Login = lazyWithRetry(() => import('@/features/auth/pages/Login/Login').then((m) => ({ default: m.default })));
const CustomerRoutes = lazyWithRetry(() => import('@/features/customer/routes').then((m) => ({ default: m.CustomerRoutes })));
const HRRoutes = lazyWithRetry(() => import('@/features/hr/routes').then((m) => ({ default: m.HRRoutes })));
const ManagerRoutes = lazyWithRetry(() => import('@/features/manager/routes').then((m) => ({ default: m.ManagerRoutes })));
const OwnerRoutes = lazyWithRetry(() => import('@/features/owner/routes').then((m) => ({ default: m.OwnerRoutes })));

const RouteFallback = () => <PageLoader message="Loading..." />;

export const AppRouter = () => {
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.style.removeProperty('overflow');
    root.style.removeProperty('touch-action');
    body.style.removeProperty('overflow');
    body.style.removeProperty('padding-right');
    body.style.removeProperty('touch-action');
    root.removeAttribute('data-scroll-locked');
    body.removeAttribute('data-scroll-locked');
  }, [location.pathname]);

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/hr/*" element={<HRRoutes />} />
        <Route path="/owner/*" element={<OwnerRoutes />} />
        <Route path="/manager/*" element={<ManagerRoutes />} />
        <Route path="/*" element={<CustomerRoutes />} />
      </Routes>
    </Suspense>
  );
};
