
import { lazy, Suspense } from "react";
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

// Main App Component
const AppRoutes = () => {
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

// Root App Component with all necessary providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
