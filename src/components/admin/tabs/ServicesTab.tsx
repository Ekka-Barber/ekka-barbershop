
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Separator } from '@/components/ui/separator';
import { ServiceManagementHeader } from '@/components/admin/service-management/ServiceManagementHeader';
import ServiceCategoryList from '@/components/admin/ServiceCategoryList';
import { lazy, Suspense } from 'react';
import { useOptimizedCategories } from '@/hooks/useOptimizedCategories';

const ServiceUpsellManager = lazy(() => 
  import('@/components/admin/service-management/ServiceUpsellManager').then(mod => ({ default: mod.ServiceUpsellManager }))
);

// Loading component for Suspense
const TabLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
        <ServiceCategoryList />
      </ErrorBoundary>
      <Separator className="my-8" />
      <ErrorBoundary>
        <Suspense fallback={<TabLoader />}>
          <ServiceUpsellManager />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
