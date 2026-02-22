import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { PageLoader } from '@shared/ui/components/shared/loaders/PageLoader';

import { routeLoaders } from './routeLoaders';

const { Component: Login } = routeLoaders.login;
const { Component: CustomerRoutes } = routeLoaders.customer;
const { Component: HRRoutes } = routeLoaders.hr;
const { Component: ManagerRoutes } = routeLoaders.manager;
const { Component: OwnerRoutes } = routeLoaders.owner;

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
