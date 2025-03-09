
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceManagementHeader } from '@/components/admin/service-management/ServiceManagementHeader';
import ServiceCategoryList from '@/components/admin/ServiceCategoryList';
import { FileManagement } from '@/components/admin/FileManagement';
import QRCodeManager from '@/components/admin/QRCodeManager';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useOptimizedCategories } from '@/hooks/useOptimizedCategories';
import { BookingManagement } from '@/components/admin/booking-management/BookingManagement';
import { PackageManagement } from '@/components/admin/package-management/PackageManagement';
import { ServiceUpsellManager } from '@/components/admin/service-management/ServiceUpsellManager';
import { EmployeeTab } from '@/components/admin/employee-management/EmployeeTab';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('services');
  
  const {
    categories,
    totalServices,
    setSearchQuery,
    setSortBy
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
          <TabsList className="w-full sm:w-auto grid grid-cols-6 sm:inline-flex">
            <TabsTrigger value="services">
              Services
            </TabsTrigger>
            <TabsTrigger value="packages">
              Packages
            </TabsTrigger>
            <TabsTrigger value="bookings">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="employee">
              Employee
            </TabsTrigger>
            <TabsTrigger value="files">
              Files
            </TabsTrigger>
            <TabsTrigger value="qrcodes">
              QR Codes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <ServiceManagementHeader 
              totalCategories={categories?.length || 0}
              totalServices={totalServices}
              onSearch={setSearchQuery}
              onSort={setSortBy}
            />
            <Separator />
            <ErrorBoundary>
              <ServiceCategoryList />
            </ErrorBoundary>
            <Separator className="my-8" />
            <ErrorBoundary>
              <ServiceUpsellManager />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="packages" className="space-y-4">
            <ErrorBoundary>
              <PackageManagement />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <ErrorBoundary>
              <BookingManagement />
            </ErrorBoundary>
          </TabsContent>
          
          <TabsContent value="employee" className="space-y-4">
            <ErrorBoundary>
              <EmployeeTab />
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
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
