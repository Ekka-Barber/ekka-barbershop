
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceManagementHeader } from '@/components/admin/service-management/ServiceManagementHeader';
import ServiceCategoryList from '@/components/admin/ServiceCategoryList';
import { FileManagement } from '@/components/admin/FileManagement';
import QRCodeManager from '@/components/admin/QRCodeManager';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AdsMetrics } from '@/components/admin/ads-metrics/AdsMetrics';
import BookingSettings from '@/components/admin/booking-settings/BookingSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOptimizedCategories } from '@/hooks/useOptimizedCategories';

const Admin = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('services');
  
  const {
    categories,
    totalServices
  } = useOptimizedCategories();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4 bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/customer'}
            >
              Back to Site
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex lg:grid-cols-5">
            <TabsTrigger value="services">
              Services
            </TabsTrigger>
            <TabsTrigger value="files">
              Files
            </TabsTrigger>
            <TabsTrigger value="qrcodes">
              QR Codes
            </TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="booking-settings">
              Booking Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <ServiceManagementHeader 
              totalCategories={categories?.length || 0}
              totalServices={totalServices}
            />
            <Separator />
            <ErrorBoundary>
              <ServiceCategoryList />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <h2 className="text-2xl font-bold">
              File Management
            </h2>
            <Separator />
            <ErrorBoundary>
              <FileManagement />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="qrcodes" className="space-y-4">
            <h2 className="text-2xl font-bold">
              QR Code Management
            </h2>
            <Separator />
            <ErrorBoundary>
              <QRCodeManager />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl font-bold">
              Ads Analytics
            </h2>
            <Separator />
            <ErrorBoundary>
              <AdsMetrics />
            </ErrorBoundary>
          </TabsContent>
          
          <TabsContent value="booking-settings" className="space-y-4">
            <ErrorBoundary>
              <BookingSettings />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
