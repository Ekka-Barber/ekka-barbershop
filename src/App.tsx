
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { OfflineNotification } from "./components/common/OfflineNotification";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { registerServiceWorker } from "./services/offlineSupport";

// Lazy load all page components for better code splitting
const Customer = lazy(() => import("./pages/Customer"));
const Menu = lazy(() => import("./pages/Menu"));
const Offers = lazy(() => import("./pages/Offers"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Admin = lazy(() => import("./pages/Admin"));

// Create loading component for suspense fallback
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-primary">Loading...</div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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

// Register service worker
const ServiceWorkerRegistration = () => {
  useEffect(() => {
    const registerSW = async () => {
      await registerServiceWorker();
    };
    registerSW();
  }, []);

  return null;
};

// Main App Component
const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Redirect root to customer page */}
        <Route path="/" element={<Navigate to="/customer" replace />} />
        
        {/* Public routes with Suspense */}
        <Route path="/customer" element={
          <Suspense fallback={<PageLoading />}>
            <Customer />
          </Suspense>
        } />
        <Route path="/menu" element={
          <Suspense fallback={<PageLoading />}>
            <Menu />
          </Suspense>
        } />
        <Route path="/offers" element={
          <Suspense fallback={<PageLoading />}>
            <Offers />
          </Suspense>
        } />
        <Route path="/bookings" element={
          <Suspense fallback={<PageLoading />}>
            <Bookings />
          </Suspense>
        } />
        
        {/* Protected routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoading />}>
                <Admin />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all other routes and redirect to customer page */}
        <Route path="*" element={<Navigate to="/customer" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

// Root App Component with all necessary providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <BrowserRouter>
            <ServiceWorkerRegistration />
            <AppRoutes />
            <Toaster />
            <Sonner />
            <OfflineNotification />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
