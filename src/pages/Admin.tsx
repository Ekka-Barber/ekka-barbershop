import { useState, useMemo, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceManagementHeader } from '@/components/admin/service-management/ServiceManagementHeader';
import ServiceCategoryList from '@/components/admin/ServiceCategoryList';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useOptimizedCategories } from '@/hooks/useOptimizedCategories';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, Package, Calendar, Users, FileText, QrCode, Layout } from 'lucide-react';

// Lazy load components that aren't needed immediately
const FileManagement = lazy(() => import('@/components/admin/FileManagement').then(mod => ({ default: mod.FileManagement })));
const QRCodeManager = lazy(() => import('@/components/admin/QRCodeManager'));
const BookingManagement = lazy(() => import('@/components/admin/booking-management/BookingManagement').then(mod => ({ default: mod.BookingManagement })));
const PackageManagement = lazy(() => import('@/components/admin/package-management/PackageManagement').then(mod => ({ default: mod.PackageManagement })));
const ServiceUpsellManager = lazy(() => import('@/components/admin/service-management/ServiceUpsellManager').then(mod => ({ default: mod.ServiceUpsellManager })));
const EmployeeTab = lazy(() => import('@/components/admin/employee-management/EmployeeTab').then(mod => ({ default: mod.EmployeeTab })));
const UiElementsManager = lazy(() => import('@/components/admin/ui-elements/UiElementsManager').then(mod => ({ default: mod.UiElementsManager })));

// Create a loading component for Suspense
const TabLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

const Admin = () => {
  const [activeTab, setActiveTab] = useState('services');
  const isMobile = useIsMobile();
  
  const {
    categories,
    totalServices,
    setSearchQuery,
    setSortBy
  } = useOptimizedCategories();

  // Memoize the TabsList for mobile and desktop
  const tabNavigation = useMemo(() => {
    if (isMobile) {
      return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <TabsList className="w-full grid grid-cols-7 gap-1 p-2">
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
            <TabsTrigger value="ui-elements" className="flex flex-col items-center py-2 h-auto">
              <Layout className="h-5 w-5 mb-1" />
              <span className="text-xs">UI</span>
            </TabsTrigger>
          </TabsList>
        </div>
      );
    } else {
      return (
        <TabsList className="w-full sm:w-auto grid grid-cols-7 sm:inline-flex">
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
          <TabsTrigger value="ui-elements">
            UI Elements
          </TabsTrigger>
        </TabsList>
      );
    }
  }, [isMobile]);

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
          {tabNavigation}

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
              <Suspense fallback={<TabLoader />}>
                <ServiceUpsellManager />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="packages" className="space-y-4">
            <ErrorBoundary>
              <Suspense fallback={<TabLoader />}>
                <PackageManagement />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <ErrorBoundary>
              <Suspense fallback={<TabLoader />}>
                <BookingManagement />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>
          
          <TabsContent value="employee" className="space-y-4">
            <ErrorBoundary>
              <Suspense fallback={<TabLoader />}>
                <EmployeeTab />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <h2 className="text-2xl font-bold">
              File Management
            </h2>
            <Separator />
            <ErrorBoundary>
              <Suspense fallback={<TabLoader />}>
                <FileManagement />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="qrcodes" className="space-y-4">
            <h2 className="text-2xl font-bold">
              QR Code Management
            </h2>
            <Separator />
            <ErrorBoundary>
              <Suspense fallback={<TabLoader />}>
                <QRCodeManager />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="ui-elements" className="space-y-4">
            <h2 className="text-2xl font-bold">
              UI Elements Management
            </h2>
            <Separator />
            <ErrorBoundary>
              <Suspense fallback={<TabLoader />}>
                <UiElementsManager />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
