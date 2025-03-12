
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Customer from "./pages/Customer";
import Menu from "./pages/Menu";
import Offers from "./pages/Offers";
import Bookings from "./pages/Bookings";
import { OfflineNotification } from "./components/common/OfflineNotification";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { registerServiceWorker } from "./services/offlineSupport";
import { updateManifestLink } from "./utils/manifestUtils";

// Lazy load Admin component
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient();

// Updated Protected route component that uses our auth context
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Switch to admin manifest for PWA when on admin page
    updateManifestLink(location.pathname.includes('/admin') ? 'admin-manifest.json' : 'manifest.json');
  }, [location]);

  if (!isAuthenticated) {
    return <Navigate to="/customer?redirected=true" replace />;
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
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Check if user should be redirected to admin based on authentication
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/customer' && !location.search.includes('redirected=true')) {
      // This handles the case where the user is on the customer page but should be on admin
      console.log('Authenticated user detected on customer page, redirecting to admin');
    }
  }, [isAuthenticated, location]);
  
  // Set the appropriate manifest based on the current route
  useEffect(() => {
    updateManifestLink(location.pathname.includes('/admin') ? 'admin-manifest.json' : 'manifest.json');
  }, [location.pathname]);
  
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
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <ServiceWorkerRegistration />
              <AppRoutes />
              <Toaster />
              <Sonner />
              <OfflineNotification />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
