
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceManagementHeader } from '@/components/admin/service-management/ServiceManagementHeader';
import { ServiceCategoryList } from '@/components/admin/ServiceCategoryList';
import { FileManagement } from '@/components/admin/FileManagement';
import { URLManager } from '@/components/admin/URLManager';
import { QRCodeManager } from '@/components/admin/QRCodeManager';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AdsMetrics } from '@/components/admin/ads-metrics/AdsMetrics';
import { useLanguage } from '@/contexts/LanguageContext';

const Admin = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('services');

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-background">
      <header className="border-b p-4 bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button
              variant="outline"
              onClick={() => window.location.href = '/customer'}
            >
              {language === 'ar' ? 'العودة للموقع' : 'Back to Site'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex lg:grid-cols-6">
            <TabsTrigger value="services">
              {language === 'ar' ? 'الخدمات' : 'Services'}
            </TabsTrigger>
            <TabsTrigger value="files">
              {language === 'ar' ? 'الملفات' : 'Files'}
            </TabsTrigger>
            <TabsTrigger value="urls">
              {language === 'ar' ? 'الروابط' : 'URLs'}
            </TabsTrigger>
            <TabsTrigger value="qrcodes">
              {language === 'ar' ? 'رموز QR' : 'QR Codes'}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              {language === 'ar' ? 'التحليلات' : 'Analytics'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <ServiceManagementHeader />
            <Separator />
            <ErrorBoundary>
              <ServiceCategoryList />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <h2 className="text-2xl font-bold">
              {language === 'ar' ? 'إدارة الملفات' : 'File Management'}
            </h2>
            <Separator />
            <ErrorBoundary>
              <FileManagement />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="urls" className="space-y-4">
            <h2 className="text-2xl font-bold">
              {language === 'ar' ? 'إدارة الروابط' : 'URL Management'}
            </h2>
            <Separator />
            <ErrorBoundary>
              <URLManager />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="qrcodes" className="space-y-4">
            <h2 className="text-2xl font-bold">
              {language === 'ar' ? 'إدارة رموز QR' : 'QR Code Management'}
            </h2>
            <Separator />
            <ErrorBoundary>
              <QRCodeManager />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl font-bold">
              {language === 'ar' ? 'تحليلات الإعلانات' : 'Ads Analytics'}
            </h2>
            <Separator />
            <ErrorBoundary>
              <AdsMetrics />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
