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

const queryClient = new QueryClient();

// List of public routes that customers can access
const PUBLIC_ROUTES = ['/customer', '/menu', '/offers', '/preview'];

const App = () => {
  // Function to check if the current path is allowed
  const isPublicRoute = (path: string) => {
    return PUBLIC_ROUTES.includes(path);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
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
              
              {/* Protected route */}
              <Route path="/admin" element={
                <Navigate to="/customer" replace />
              } />
              
              {/* Catch all other routes and redirect to customer page */}
              <Route path="*" element={<Navigate to="/customer" replace />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;