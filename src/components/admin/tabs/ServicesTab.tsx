
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Separator } from '@/components/ui/separator';
import { ServiceManagementHeader } from '@/components/admin/service-management/ServiceManagementHeader';
import ServiceCategoryList from '@/components/admin/ServiceCategoryList';
import { useOptimizedCategories } from '@/hooks/useOptimizedCategories';

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
    </div>
  );
};
