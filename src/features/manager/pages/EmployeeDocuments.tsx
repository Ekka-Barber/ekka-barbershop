import { ArrowRight, FileCheck, RefreshCw, ShieldAlert, AlertTriangle, FileX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import MainLayout from '@/features/manager/components/layouts/MainLayout';
import { useEmployeeDocumentsData } from '@/features/manager/hooks/useEmployeeDocumentsData';
import { Button } from '@shared/ui/components/button';

import { EmployeeDocumentCard } from './components/EmployeeDocumentCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { employees, isLoading, error, refetch, summary } = useEmployeeDocumentsData();

  const hasAlerts =
    summary.expiredDocuments > 0 ||
    summary.expiringDocuments > 0 ||
    summary.expiredInsurance > 0 ||
    summary.expiringInsurance > 0;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/manager')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">مستندات الموظفين</h1>
              <p className="text-gray-600 text-sm">عرض مستندات وتأمين موظفي الفرع</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-gray-200"
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {hasAlerts && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="mr-3 text-gray-600">جاري تحميل البيانات...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">حدث خطأ في تحميل البيانات</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!isLoading && !error && employees && employees.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <FileCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">لا يوجد موظفين في هذا الفرع</p>
          </div>
        )}

        {!isLoading && !error && employees && employees.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {employees.map((employee) => (
              <EmployeeDocumentCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
