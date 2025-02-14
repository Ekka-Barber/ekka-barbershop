
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { trackClick } from "@/utils/clickTracking";
import Customer from "./pages/Customer";
import Menu from "./pages/Menu";
import Offers from "./pages/Offers";
import Admin from "./pages/Admin";
import Bookings from "./pages/Bookings";

const queryClient = new QueryClient();

// List of public routes that customers can access
const PUBLIC_ROUTES = ['/customer', '/menu', '/offers', '/preview', '/bookings'];

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

const App = () => {
  useEffect(() => {
    // Add click tracking
    window.addEventListener('click', trackClick);
    return () => window.removeEventListener('click', trackClick);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Redirect root to customer page */}
              <Route path="/" element={<Navigate to="/customer" replace />} />
              
              {/* Public routes */}
              <Route path="/customer" element={<Customer />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/preview" element={<Customer />} />
              <Route path="/bookings" element={<Bookings />} />
              
              {/* Protected routes */}
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              
              {/* Catch all other routes and redirect to customer page */}
              <Route path="*" element={<Navigate to="/customer" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
