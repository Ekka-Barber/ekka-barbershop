
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ServiceManagementHeader } from '@/components/admin/service-management/ServiceManagementHeader';
import ServiceCategoryList from '@/components/admin/ServiceCategoryList';
import { FileManagement } from '@/components/admin/FileManagement';
import URLManager from '@/components/admin/URLManager';
import QRCodeManager from '@/components/admin/QRCodeManager';
import { AdsMetrics } from '@/components/admin/ads-metrics/AdsMetrics';
import { useOptimizedCategories } from '@/hooks/useOptimizedCategories';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const Admin = () => {
  const location = useLocation();
  const [activePage, setActivePage] = useState('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const {
    categories,
    totalServices,
    setSearchQuery: setCategorySearchQuery,
    setSortBy,
    setFilterBy
  } = useOptimizedCategories();

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'admin') {
      setActivePage(path);
    } else {
      setActivePage('services');
    }
  }, [location]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (activePage === 'services') {
      setCategorySearchQuery(query);
    }
    // Handle search for other sections as they're implemented
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    // Simulating URL update
    setTimeout(() => {
      setIsUpdating(false);
      setNewUrl('');
    }, 1000);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'services':
        return (
          <div className="space-y-4">
            <ServiceManagementHeader 
              totalCategories={categories?.length || 0}
              totalServices={totalServices}
              onSearch={setCategorySearchQuery}
              onSort={setSortBy}
              onFilter={setFilterBy}
            />
            <Separator />
            <ErrorBoundary>
              <ServiceCategoryList />
            </ErrorBoundary>
          </div>
        );
      case 'files':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">File Management</h2>
            <Separator />
            <ErrorBoundary>
              <FileManagement />
            </ErrorBoundary>
          </div>
        );
      case 'urls':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">URL Management</h2>
            <Separator />
            <ErrorBoundary>
              <URLManager 
                currentUrl="https://example.com"
                newUrl={newUrl}
                setNewUrl={setNewUrl}
                handleSubmit={handleSubmitUrl}
                isUpdating={isUpdating}
              />
            </ErrorBoundary>
          </div>
        );
      case 'qrcodes':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">QR Code Management</h2>
            <Separator />
            <ErrorBoundary>
              <QRCodeManager />
            </ErrorBoundary>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <Separator />
            <ErrorBoundary>
              <AdsMetrics />
            </ErrorBoundary>
          </div>
        );
      case 'bookings':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Booking Management</h2>
            <Separator />
            <p>Booking management interface coming soon.</p>
          </div>
        );
      case 'customers':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Customer Management</h2>
            <Separator />
            <p>Customer management interface coming soon.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Settings</h2>
            <Separator />
            <p>Settings interface coming soon.</p>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <Separator />
            <p>Select an option from the sidebar to manage your salon.</p>
          </div>
        );
    }
  };

  return <AdminLayout onSearch={handleSearch}>{renderContent()}</AdminLayout>;
};

export default Admin;
