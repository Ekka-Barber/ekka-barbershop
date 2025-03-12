
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
import { Package, Calendar, Users, FileText, QrCode, Layers } from 'lucide-react';

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
      <header className="border-b p-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/customer'}
            className="hover:bg-primary/10"
          >
            Back to Site
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white p-2 rounded-lg shadow-sm border">
            <TabsList className="w-full grid grid-cols-3 md:grid-cols-6 gap-2">
              <TabsTrigger value="services" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Layers className="h-4 w-4" />
                <span className="hidden md:inline">Services</span>
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Package className="h-4 w-4" />
                <span className="hidden md:inline">Packages</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="employee" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Employee</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Files</span>
              </TabsTrigger>
              <TabsTrigger value="qrcodes" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <QrCode className="h-4 w-4" />
                <span className="hidden md:inline">QR Codes</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="services" className="space-y-6 bg-white p-6 rounded-lg shadow-sm border animate-in fade-in-50">
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

          <TabsContent value="packages" className="space-y-6 bg-white p-6 rounded-lg shadow-sm border animate-in fade-in-50">
            <ErrorBoundary>
              <PackageManagement />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6 bg-white p-6 rounded-lg shadow-sm border animate-in fade-in-50">
            <ErrorBoundary>
              <BookingManagement />
            </ErrorBoundary>
          </TabsContent>
          
          <TabsContent value="employee" className="space-y-6 bg-white p-6 rounded-lg shadow-sm border animate-in fade-in-50">
            <ErrorBoundary>
              <EmployeeTab />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="files" className="space-y-6 bg-white p-6 rounded-lg shadow-sm border animate-in fade-in-50">
            <h2 className="text-2xl font-bold text-primary">
              File Management
            </h2>
            <Separator />
            <ErrorBoundary>
              <FileManagement />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="qrcodes" className="space-y-6 bg-white p-6 rounded-lg shadow-sm border animate-in fade-in-50">
            <h2 className="text-2xl font-bold text-primary">
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
