import { Route, Routes } from 'react-router-dom';

import Login from '@/features/auth/pages/Login/Login';
import { CustomerRoutes } from '@/features/customer/routes';
import { ManagerRoutes } from '@/features/manager/routes';
import { OwnerRoutes } from '@/features/owner/routes';

export const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/owner/*" element={<OwnerRoutes />} />
    <Route path="/manager/*" element={<ManagerRoutes />} />
    <Route path="/*" element={<CustomerRoutes />} />
  </Routes>
);
