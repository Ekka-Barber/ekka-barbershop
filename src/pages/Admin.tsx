
import { useState, useEffect } from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, Package, Calendar, Users, FileText, QrCode } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('services');
  const isMobile = useIsMobile();
  
  useEffect(() => {
    console.log("Admin component - isMobile state:", isMobile);
  }, [isMobile]);
  
  const {
    categories,
    totalServices,
    setSearchQuery,
    setSortBy
  } = useOptimizedCategories();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b p-4 bg-white">
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

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {isMobile ? (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
              <TabsList className="w-full grid grid-cols-6 gap-1 p-2">
                <TabsTrigger value="services" className="flex flex-col items-center py-2 h-auto">
                  <Home className="h-5 w-5 mb-1" />
                  <span className="text-xs">Services</span>
                </TabsTrigger>
                <TabsTrigger value="packages" className="flex flex-col items-center py-2 h-auto">
                  <Package className="h-5 w-5 mb-1" />
                  <span className="text-xs">Packages</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex flex-col items-center py-2 h-auto">
                  <Calendar className="h-5 w-5 mb-1" />
                  <span className="text-xs">Bookings</span>
                </TabsTrigger>
                <TabsTrigger value="employee" className="flex flex-col items-center py-2 h-auto">
                  <Users className="h-5 w-5 mb-1" />
                  <span className="text-xs">Employee</span>
                </TabsTrigger>
                <TabsTrigger value="files" className="flex flex-col items-center py-2 h-auto">
                  <FileText className="h-5 w-5 mb-1" />
                  <span className="text-xs">Files</span>
                </TabsTrigger>
                <TabsTrigger value="qrcodes" className="flex flex-col items-center py-2 h-auto">
                  <QrCode className="h-5 w-5 mb-1" />
                  <span className="text-xs">QR</span>
                </TabsTrigger>
              </TabsList>
            </div>
          ) : (
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
          )}

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
