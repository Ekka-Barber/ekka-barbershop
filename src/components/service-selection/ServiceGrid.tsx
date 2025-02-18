
import { Service } from '@/types/service';
import { ServiceCard } from './ServiceCard';
import { Button } from '@/components/ui/button';
import { LazyLoadComponent } from '@/components/common/LazyLoadComponent';
import { ServiceCardSkeleton } from '../booking/service-selection/ServiceCardSkeleton';
import { Grid } from '@/components/common/Layout/Grid';

interface ServiceGridProps {
  services: Service[];
  selectedServices: Service[];
  onServiceClick: (service: Service) => void;
  onServiceToggle: (service: Service) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  language: string;
}

export const ServiceGrid = ({
  services,
  selectedServices,
  onServiceClick,
  onServiceToggle,
  hasMore,
  onLoadMore,
  language
}: ServiceGridProps) => {
  return (
    <>
      <Grid cols={2} gap={4}>
        {services.map((service) => (
          <LazyLoadComponent
            key={service.id}
            threshold={100}
            placeholder={<ServiceCardSkeleton />}
          >
            <ServiceCard
              service={service}
              language={language}
              isSelected={selectedServices.some(s => s.id === service.id)}
              onServiceClick={onServiceClick}
              onServiceToggle={onServiceToggle}
            />
          </LazyLoadComponent>
        ))}
      </Grid>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            className="w-full max-w-md"
          >
            {language === 'ar' ? 'تحميل المزيد' : 'Load More'}
          </Button>
        </div>
      )}
    </>
  );
};
