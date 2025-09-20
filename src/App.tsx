import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Customer from "./pages/Customer";
import { OfflineNotification } from "./components/common/OfflineNotification";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";

// Lazy load heavy route components with preloading
const Admin = lazy(() => import("./pages/Admin"));
const Menu = lazy(() => import("./pages/Menu"));
const Offers = lazy(() => import("./pages/Offers"));

// Preloading function for better UX
const preloadComponent = (componentImport: () => Promise<{ default: React.ComponentType<unknown> }>) => {
  const componentImportFn = componentImport;
  componentImportFn();
};

// Preload Menu and Offers components when the app initializes
// This improves navigation performance as these are commonly accessed
if (typeof window !== 'undefined') {
  // Delay preloading to not impact initial load
  setTimeout(() => {
    preloadComponent(() => import("./pages/Menu"));
    preloadComponent(() => import("./pages/Offers"));
  }, 2000);
}

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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const access = searchParams.get('access');

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
      <Route path="/customer" element={<Customer />} />

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
