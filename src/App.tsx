import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Admin from './pages/Admin';
import Customer from './pages/CustomerRefactored';
import Bookings from './pages/Bookings';

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/customer" />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/bookings" element={<Bookings />} />
      </Routes>
      <Toaster />
    </LanguageProvider>
  );
}

export default App;
