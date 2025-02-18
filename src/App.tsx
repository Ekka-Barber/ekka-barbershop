
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Customer from "./pages/Customer";
import Menu from "./pages/Menu";
import Offers from "./pages/Offers";
import Bookings from "./pages/Bookings";

// Lazy load Admin component
const Admin = lazy(() => import("./pages/Admin"));

// List of public routes that customers can access
const PUBLIC_ROUTES = ['/customer', '/menu', '/offers', '/bookings'];

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

const AppContent = () => {
  const { trackPageView } = useTracking();
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  return (
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
  );
};

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider delayDuration={0}>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
