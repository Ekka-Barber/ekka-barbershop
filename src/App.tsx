
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

// Implement lazy loading for all page components
const Customer = lazy(() => import("./pages/Customer"));
const Menu = lazy(() => import("./pages/Menu"));
const Offers = lazy(() => import("./pages/Offers"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Admin = lazy(() => import("./pages/Admin"));

// Loading fallback component with optimized animation
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 border-4 border-[#C4A36F] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[#4A4A4A] font-medium">Loading...</p>
    </div>
  </div>
);

// Configure Query Client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
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
  // Prefetch data for commonly accessed routes
  useEffect(() => {
    // Preload Customer component after initial render
    const timer = setTimeout(() => {
      import("./pages/Customer");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        {/* Redirect root to customer page */}
        <Route path="/" element={<Navigate to="/customer" replace />} />
        
        {/* Public routes with Suspense for code splitting */}
        <Route path="/customer" element={
          <Suspense fallback={<PageLoadingFallback />}>
            <Customer />
          </Suspense>
        } />
        
        <Route path="/menu" element={
          <Suspense fallback={<PageLoadingFallback />}>
            <Menu />
          </Suspense>
        } />
        
        <Route path="/offers" element={
          <Suspense fallback={<PageLoadingFallback />}>
            <Offers />
          </Suspense>
        } />
        
        <Route path="/bookings" element={
          <Suspense fallback={<PageLoadingFallback />}>
            <Bookings />
          </Suspense>
        } />
        
        {/* Protected routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingFallback />}>
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
