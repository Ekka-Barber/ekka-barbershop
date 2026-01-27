import { Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useLogout } from "@shared/hooks/auth/useLogout";
import { accessCodeStorage } from '@shared/lib/access-code/storage';
import { Button } from "@shared/ui/components/button";

import { DashboardFooter } from "@/features/manager/components/dashboard/DashboardFooter";
import MainLayout from "@/features/manager/components/layouts/MainLayout";
// removed useQueryClient in favor of centralized logout



const Dashboard = () => {
  const navigate = useNavigate();
  const logout = useLogout();

  // Check authentication
  const accessCode = accessCodeStorage.getManagerAccessCode();
  if (!accessCode) {
    navigate('/customer');
    return null;
  }

  const handleLogout = () => logout();

  // Super-manager access remains available for branch tools

  const pageCards = [
    {
      title: "الموظفين",
      icon: Users,
      path: '/manager/employees',
      onClick: () => navigate('/manager/employees'),
    },
  ] as const;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        {/* Header with logout button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="text-center sm:text-right">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
            <p className="text-gray-600">مرحباً بك في نظام إدارة الفروع</p>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {pageCards.map((card) => (
            <Button
              key={card.path}
              onClick={card.onClick}
              className="h-32 flex flex-col items-center justify-center space-y-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300"
              variant="outline"
            >
              <card.icon className="h-12 w-12 text-gray-600" />
              <span className="font-['Changa'] text-lg font-medium">{card.title}</span>
            </Button>
          ))}

          
        </div>

        {/* Dashboard Footer */}
        <DashboardFooter />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
