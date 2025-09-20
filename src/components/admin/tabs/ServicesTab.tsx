
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Separator } from '@/components/ui/separator';
import { ServiceManagementHeader } from '@/components/admin/service-management/ServiceManagementHeader';
import { useOptimizedCategories } from '@/hooks/useOptimizedCategories';

// Lazy load heavy service management components
const ServiceCategoryList = lazy(() => import('@/components/admin/ServiceCategoryList'));

// Loading component for service management
const ServiceLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p className="text-sm text-muted-foreground">Loading service management...</p>
    </div>
  </div>
);

export const ServicesTab = () => {
  const {
    categories,
    totalServices,
    setSearchQuery,
    setSortBy
  } = useOptimizedCategories();

  return (
    <div className="space-y-6">
      <ServiceManagementHeader 
        totalCategories={categories?.length || 0}
        totalServices={totalServices}
        onSearch={setSearchQuery}
        onSort={setSortBy}
      />
      <Separator />
      <ErrorBoundary>
        <Suspense fallback={<ServiceLoader />}>
          <ServiceCategoryList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
