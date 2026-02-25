import { AlertTriangle, FileCheck, FileX, LogOut, RefreshCw, ShieldAlert, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useLogout } from "@shared/hooks/auth/useLogout";
import { accessCodeStorage } from '@shared/lib/access-code/storage';
import { Button } from "@shared/ui/components/button";

import {
  DashboardFooter,
  DocumentInsuranceStatus,
  EmployeeCountCards,
  MetricsSkeleton,
  TopPerformers,
} from "@/features/manager/components/dashboard";
import MainLayout from "@/features/manager/components/layouts/MainLayout";
import { useDashboardMetrics } from "@/features/manager/hooks/useDashboardMetrics";

const Dashboard = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  const { metrics, isLoading, error, refetch } = useDashboardMetrics();

  const accessCode = accessCodeStorage.getManagerAccessCode();
  if (!accessCode) {
    navigate('/customer');
    return null;
  }

  const handleLogout = () => logout();

  const hasAlerts =
    !isLoading &&
    metrics &&
    (metrics.documents.expired > 0 || metrics.insurance.expired > 0);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="text-center sm:text-right">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">لوحة التحكم</h1>
            <p className="text-gray-600 text-sm">مرحباً بك في نظام إدارة الفروع</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              className="border-gray-200"
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">حدث خطأ في تحميل البيانات</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              إعادة المحاولة
            </Button>
          </div>
        )}

        {isLoading && <MetricsSkeleton />}

        {!isLoading && metrics && (
          <div className="space-y-6">
            <EmployeeCountCards
              total={metrics.employees.total}
              active={metrics.employees.active}
              onLeave={metrics.employees.onLeave}
            />

            <DocumentInsuranceStatus
              documents={metrics.documents}
              insurance={metrics.insurance}
              onClick={() => navigate('/manager/employee-documents')}
            />

            {metrics.topPerformers.length > 0 && (
              <TopPerformers performers={metrics.topPerformers} />
            )}

            {hasAlerts && (
              <div
                className="bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => navigate('/manager/employee-documents')}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">تنبيهات انتهاء الصلاحية</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {metrics.documents.expired > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-red-200">
                      <div className="flex items-center gap-2">
                        <FileX className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800 font-medium">
                          {metrics.documents.expired} مستند منتهي
                        </span>
                      </div>
                    </div>
                  )}
                  {metrics.documents.expiring > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-800 font-medium">
                          {metrics.documents.expiring} ينتهي قريباً
                        </span>
                      </div>
                    </div>
                  )}
                  {metrics.insurance.expired > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-red-200">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800 font-medium">
                          {metrics.insurance.expired} تأمين منتهي
                        </span>
                      </div>
                    </div>
                  )}
                  {metrics.insurance.expiring > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-800 font-medium">
                          {metrics.insurance.expiring} تأمين ينتهي قريباً
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">الوصول السريع</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pageCards.map((card) => (
                  <Button
                    key={card.path}
                    onClick={card.onClick}
                    className="h-24 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300"
                    variant="outline"
                  >
                    <card.icon className="h-8 w-8 text-gray-600" />
                    <span className="font-medium">{card.title}</span>
                  </Button>
                ))}
              </div>
            </div>

            <DashboardFooter />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
