import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Customer from "./pages/Customer";
import Menu from "./pages/Menu";
import Offers from "./pages/Offers";
import Admin from "./pages/Admin";
import Bookings from "./pages/Bookings";

const queryClient = new QueryClient();

// List of public routes that customers can access
const PUBLIC_ROUTES = ['/customer', '/menu', '/offers', '/preview', '/bookings'];

// Owner access code - you can change this to any value you prefer
const OWNER_ACCESS_CODE = 'owner123';

const App = () => {
  // Function to check if owner access is granted via URL parameter
  const hasOwnerAccess = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('access') === OWNER_ACCESS_CODE;
  };

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
              
              {/* Protected routes - only accessible with owner access */}
              <Route 
                path="/admin" 
                element={
                  hasOwnerAccess() ? <Admin /> : <Navigate to="/customer" replace />
                } 
              />
              <Route
                path="/index"
                element={
                  hasOwnerAccess() ? <Index /> : <Navigate to="/customer" replace />
                }
              />
              
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