import { AlertTriangle, FileCheck, FileX, LogOut, ShieldAlert, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useLogout } from "@shared/hooks/auth/useLogout";
import { accessCodeStorage } from '@shared/lib/access-code/storage';
import { Button } from "@shared/ui/components/button";

import { DashboardFooter } from "@/features/manager/components/dashboard/DashboardFooter";
import MainLayout from "@/features/manager/components/layouts/MainLayout";
import { useEmployeeDocumentsData } from "@/features/manager/hooks/useEmployeeDocumentsData";

const Dashboard = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  const { summary, isLoading } = useEmployeeDocumentsData();

  const accessCode = accessCodeStorage.getManagerAccessCode();
  if (!accessCode) {
    navigate('/customer');
    return null;
  }

  const handleLogout = () => logout();

  const hasAlerts =
    !isLoading &&
    (summary.expiredDocuments > 0 ||
      summary.expiringDocuments > 0 ||
      summary.expiredInsurance > 0 ||
      summary.expiringInsurance > 0);

  const pageCards = [
    {
      title: "الموظفين",
      icon: Users,
      path: '/manager/employees',
      onClick: () => navigate('/manager/employees'),
    },
    {
      title: "مستندات الموظفين",
      icon: FileCheck,
      path: '/manager/employee-documents',
      onClick: () => navigate('/manager/employee-documents'),
    },
  ] as const;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12" dir="rtl">
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

        {hasAlerts && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => navigate('/manager/employee-documents')}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">تنبيهات انتهاء الصلاحية</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {summary.expiredDocuments > 0 && (
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex items-center gap-2">
                    <FileX className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800 font-medium">
                      {summary.expiredDocuments} مستند منتهي
                    </span>
                  </div>
                </div>
              )}
              {summary.expiringDocuments > 0 && (
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-800 font-medium">
                      {summary.expiringDocuments} ينتهي قريباً
                    </span>
                  </div>
                </div>
              )}
              {summary.expiredInsurance > 0 && (
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800 font-medium">
                      {summary.expiredInsurance} تأمين منتهي
                    </span>
                  </div>
                </div>
              )}
              {summary.expiringInsurance > 0 && (
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-800 font-medium">
                      {summary.expiringInsurance} تأمين ينتهي قريباً
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <DashboardFooter />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
