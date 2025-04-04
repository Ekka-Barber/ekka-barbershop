
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Customer from "./pages/Customer";
import Menu from "./pages/Menu";
import Offers from "./pages/Offers";
import Bookings from "./pages/Bookings";
import { OfflineNotification } from "./components/common/OfflineNotification";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { registerServiceWorker } from "./services/offlineSupport";
import { logger } from "@/utils/logger";

// Configure logger based on environment
logger.configure({
  minLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enabled: true
});

// Lazy load Admin component
const Admin = lazy(() => import("./pages/Admin"));

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
const App = () => {
  // Log initialization in production (only useful warnings/errors) and more verbose in development
  logger.info(`App initializing in ${process.env.NODE_ENV} mode`);
  
  return (
    <LanguageProvider>
      <TooltipProvider>
        <ServiceWorkerRegistration />
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
        <Toaster />
        <Sonner />
        <OfflineNotification />
      </TooltipProvider>
    </LanguageProvider>
  );
};

export default App;
