
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';

interface AdminLayoutProps {
  onSearch?: (searchTerm: string) => void;
  children?: React.ReactNode; // Add children prop
}

export const AdminLayout = ({ onSearch, children }: AdminLayoutProps) => {
  const { language } = useLanguage();

  return (
    <div 
      className="min-h-screen flex flex-col md:flex-row bg-background"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onSearch={onSearch} />
        
        <main className="flex-1 overflow-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
};
