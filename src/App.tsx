import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';

import Customer from './pages/Customer';
import Menu from './pages/Menu';
import Bookings from './pages/Bookings';
import Admin from './pages/Admin';
import Offers from './pages/Offers';
import BookingSettings from './pages/BookingSettings';
import { LanguageProvider } from './contexts/LanguageContext';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/" element={<Navigate to="/customer" />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/booking-settings" element={<BookingSettings />} />
            <Route path="/offers" element={<Offers />} />
          </Routes>
          <Toaster position="top-center" richColors closeButton />
        </QueryClientProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
