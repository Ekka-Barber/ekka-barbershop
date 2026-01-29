import { useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { accessCodeStorage } from '@shared/lib/access-code/storage';
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

  const isDashboard =
    location.pathname === '/manager' || location.pathname === '/manager/';

  // Load manager and branch info from database
  useEffect(() => {
    const loadUserInfo = async () => {
      const accessCode = accessCodeStorage.getManagerAccessCode();
      if (!accessCode) return;

      try {
        // Super admin: show global header not tied to a specific branch
        if (accessCode === 'ma225') {
          setManagerName('Super Admin');
          setBranchName('كل الفروع');
          return;
        }

        const { data, error } = await supabase
          .from("branch_managers")
          .select(`
            name,
            branches (
              name_ar,
              name
            )
          `)
          .eq("access_code", accessCode)
          .maybeSingle();

        if (error || !data) {
          console.error("Error loading branch details:", error);
          return;
        }

        const branch = Array.isArray(data.branches)
          ? data.branches[0]
          : data.branches;
        setManagerName(data.name);
        setBranchName(branch?.name_ar || branch?.name || '');
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    };

    loadUserInfo();
  }, []);

  // Auto-refresh data for PWA - invalidate cache every time app comes into focus
  useEffect(() => {
    let lastRefreshedAt = 0;
    const keysToInvalidate = [['employees'], ['branch'], ['current-manager']] as const;

    const maybeRefresh = () => {
      const now = Date.now();
      const THROTTLE_MS = 120_000; // 2 minutes
      if (now - lastRefreshedAt < THROTTLE_MS) return;
      lastRefreshedAt = now;
      keysToInvalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: key as unknown as string[] }));
    };

    const handleFocus = () => maybeRefresh();
    const handleVisibilityChange = () => { if (!document.hidden) maybeRefresh(); };

    // Listen for focus and visibility changes
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  const menuItems = [
    {
      title: "الموظفين",
      icon: Users,
      path: '/manager/employees',
      onClick: () => navigate('/manager/employees'),
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
                     '/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png';
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
      <main className="flex-1 min-h-0 overflow-y-auto momentum-scroll touch-action-pan-y pb-24">
        {children}
      </main>

      {/* Bottom Navigation Menu - Show on all pages EXCEPT Dashboard */}
      {!isDashboard && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="grid grid-cols-3 gap-1 p-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                onClick={item.onClick}
                className="h-16 flex flex-col items-center justify-center space-y-1 bg-white hover:bg-gray-50 text-gray-700 border-0 rounded-lg transition-all duration-200"
                variant="ghost"
              >
                <item.icon className="h-5 w-5 text-gray-600" />
                 <span className="text-xs font-medium">{item.title}</span>
              </Button>
            ))}
          </div>
        </nav>
      )}

      {/* Add bottom padding when navigation is visible */}
      {!isDashboard && null}
    </div>
  );
};

export default MainLayout;
