import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { OfflineNotification } from "./components/common/OfflineNotification";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";

// Lazy load heavy route components with preloading
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const Menu = lazyWithRetry(() => import("./pages/Menu"));
const Offers = lazyWithRetry(() => import("./pages/Offers"));
const Customer1 = lazyWithRetry(() => import("./pages/customer1/Customer1"));

// Note: Components are lazy-loaded and will be loaded on-demand
// Preloading removed to improve initial load performance

// Enhanced loading component with better UX
const RouteLoader = ({ pageName }: { pageName: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#C4A36F]/20 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-[#C4A36F] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-[#222222] font-medium">{pageName}</p>
      <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#C4A36F] rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Protected route component - SECURITY ISSUE: This is a basic implementation
// TODO: Replace with proper authentication system
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const access = searchParams.get('access');

  // WARNING: This is not secure authentication - replace with proper auth
  if (access !== 'owner123') {
    return <Navigate to="/customer" replace />;
  }

  return <>{children}</>;
};

// Inner component that uses router hooks
const AppRouter = () => {

  return (
    <Routes>
      {/* Redirect root to customer page */}
      <Route path="/" element={<Navigate to="/customer" replace />} />

      {/* Public routes with lazy loading */}
      <Route
        path="/customer"
        element={
          <Suspense fallback={<RouteLoader pageName="Preparing Ekka experience..." />}>
            <Customer1 />
          </Suspense>
        }
      />
      <Route
        path="/customer1"
        element={
          <Suspense fallback={<RouteLoader pageName="Preparing Ekka experience..." />}>
            <Customer1 />
          </Suspense>
        }
      />

      <Route
        path="/menu"
        element={
          <Suspense fallback={<RouteLoader pageName="Loading menu..." />}>
            <Menu />
          </Suspense>
        }
      />

      <Route
        path="/offers"
        element={
          <Suspense fallback={<RouteLoader pageName="Loading offers..." />}>
            <Offers />
          </Suspense>
        }
      />

      {/* Protected routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteLoader pageName="Loading admin panel..." />}>
              <Admin />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Catch all other routes and redirect to customer page */}
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  );
};

// App component
const App = () => {
  return (
    <LanguageProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
        <Toaster />
        <Sonner />
        <OfflineNotification />
        <ServiceWorkerRegistration />
      </TooltipProvider>
    </LanguageProvider>
  );
};

export default App;
