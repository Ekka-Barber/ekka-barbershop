
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Customer from "./pages/Customer";
import Menu from "./pages/Menu";
import Offers from "./pages/Offers";
import Bookings from "./pages/Bookings";
import { OfflineNotification } from "./components/common/OfflineNotification";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { registerServiceWorker } from "./services/offlineSupport";

// Lazy load Admin component
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient();

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
        
        {/* Public routes */}
        <Route path="/customer" element={<Customer />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/bookings" element={<Bookings />} />
        
        {/* Protected routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
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
