import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { PageLoader } from '@shared/ui/components/shared/loaders/PageLoader';
import { lazyWithRetry } from '@shared/utils/lazyWithRetry';

const Menu = lazyWithRetry(() => import('@/features/customer/pages/Menu/Menu'));
const Offers = lazyWithRetry(() => import('@/features/customer/pages/Offers/Offers'));
const Customer1 = lazyWithRetry(() => import('@/features/customer/pages/Customer1/Customer1'));
const PrivacyPolicy = lazyWithRetry(() => import('@/features/customer/pages/legal/PrivacyPolicy'));
const TermsOfService = lazyWithRetry(() => import('@/features/customer/pages/legal/TermsOfService'));
const RefundPolicy = lazyWithRetry(() => import('@/features/customer/pages/legal/RefundPolicy'));
const Contact = lazyWithRetry(() => import('@/features/customer/pages/legal/Contact'));

export const CustomerRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/customer" replace />} />
    <Route
      path="/customer"
      element={
        <Suspense fallback={<PageLoader message="Preparing Ekka experience..." />}>
          <Customer1 />
        </Suspense>
      }
    />
    <Route
      path="/menu"
      element={
        <Suspense fallback={<PageLoader message="Loading menu..." />}>
          <Menu />
        </Suspense>
      }
    />
    <Route
      path="/offers"
      element={
        <Suspense fallback={<PageLoader message="Loading offers..." />}>
          <Offers />
        </Suspense>
      }
    />
    <Route
      path="/privacy"
      element={
        <Suspense fallback={<PageLoader message="Loading privacy policy..." />}>
          <PrivacyPolicy />
        </Suspense>
      }
    />
    <Route
      path="/terms"
      element={
        <Suspense fallback={<PageLoader message="Loading terms of service..." />}>
          <TermsOfService />
        </Suspense>
      }
    />
    <Route
      path="/refund"
      element={
        <Suspense fallback={<PageLoader message="Loading refund policy..." />}>
          <RefundPolicy />
        </Suspense>
      }
    />
    <Route
      path="/contact"
      element={
        <Suspense fallback={<PageLoader message="Loading contact page..." />}>
          <Contact />
        </Suspense>
      }
    />
    <Route path="*" element={<Navigate to="/customer" replace />} />
  </Routes>
);
