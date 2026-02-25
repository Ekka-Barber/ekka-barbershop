import { useQueryClient } from "@tanstack/react-query";
import { FileCheck, Home, Users } from "lucide-react";
import { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useVisibilityChange } from "@shared/hooks/useVisibilityChange";
import { accessCodeStorage, sessionAuth } from '@shared/lib/access-code/storage';
import { supabase } from "@shared/lib/supabase/client";
import { Button } from "@shared/ui/components/button";


interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [branchName, setBranchName] = useState("");
  const [managerName, setManagerName] = useState("");
  const lastRefreshedAtRef = useRef(0);

  const isDashboard =
    location.pathname === '/manager' || location.pathname === '/manager/';

  const maybeRefresh = useCallback(() => {
    const now = Date.now();
    const THROTTLE_MS = 120_000;
    if (now - lastRefreshedAtRef.current < THROTTLE_MS) return;
    lastRefreshedAtRef.current = now;
    const keysToInvalidate = [['employees'], ['branch'], ['current-manager']] as const;
    keysToInvalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: key as unknown as string[] }));
  }, [queryClient]);

  useVisibilityChange(maybeRefresh);

  useEffect(() => {
    const handleFocus = () => maybeRefresh();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [maybeRefresh]);

  useEffect(() => {
    const loadUserInfo = async () => {
      const accessCode = accessCodeStorage.getManagerAccessCode();
      if (!accessCode) return;

      try {
        if (sessionAuth.getRole() === 'super_manager') {
          setManagerName('Super Admin');
          setBranchName('كل الفروع');
          return;
        }

        const { data, error } = await supabase
          .rpc('get_current_manager_branch')
          .maybeSingle();

        if (error || !data) {
          return;
        }

        const managerInfo = data as {
          manager_name: string;
          branch_name: string;
          branch_id: string;
          is_super_manager: boolean;
        };
        setManagerName(managerInfo.manager_name || '');
        setBranchName(managerInfo.branch_name || '');
      } catch {
        return;
      }
    };

    loadUserInfo();
  }, []);

  const menuItems = [
    {
      title: "الرئيسية",
      icon: Home,
      path: '/manager',
      onClick: () => navigate('/manager'),
    },
    {
      title: "الموظفين",
      icon: Users,
      path: '/manager/employees',
      onClick: () => navigate('/manager/employees'),
    },
    {
      title: "المستندات",
      icon: FileCheck,
      path: '/manager/employee-documents',
      onClick: () => navigate('/manager/employee-documents'),
    },
  ];

  return (
      <div className="h-[100dvh] min-h-[100dvh] flex flex-col overflow-hidden bg-gradient-to-br from-[#fdf8ef] via-white to-[#f1e3d1]" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
               <img
                  src="/logo_Header/logo12.svg"
                 alt="Ekka Barbershop Logo"
                 className="h-10"
                 onError={(event) => {
                   event.currentTarget.onerror = null;
                   event.currentTarget.src =
                     '/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.webp';
                 }}
               />
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {branchName}
                </h1>
                <p className="text-sm text-gray-600">
                  مرحباً، {managerName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isDashboard && (
                <Button
                  onClick={() => navigate('/manager')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  الرئيسية
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-full overflow-y-auto momentum-scroll touch-action-pan-y pb-24">
        {children}
      </main>

      {/* Bottom Navigation Menu */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-3 gap-1 p-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              onClick={item.onClick}
              className={`h-16 flex flex-col items-center justify-center space-y-1 border-0 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
              variant="ghost"
            >
              <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-primary' : 'text-gray-600'}`} />
               <span className="text-xs font-medium">{item.title}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
