
import { memo } from 'react';
import { Service } from '@/types/service';
import { calculateDiscountedPrice } from '@/utils/formatting/price';
import { BaseCard } from '@/components/common/Card/BaseCard';
import { ServiceCardHeader } from './ServiceCardHeader';
import { ServiceCardBody } from './ServiceCardBody';
import { ServiceCardFooter } from './ServiceCardFooter';

interface ServiceCardProps {
  service: Service;
  language: string;
  isSelected: boolean;
  onServiceClick: (service: Service) => void;
  onServiceToggle: (service: Service) => void;
}

export const ServiceCard = memo(({ 
  service, 
  language, 
  isSelected,
  onServiceClick,
  onServiceToggle 
}: ServiceCardProps) => {
  const hasDiscount = service.discount_type && service.discount_value;

  const discountedPrice = hasDiscount ? calculateDiscountedPrice(
    service.price,
    service.discount_type,
    service.discount_value
  ) : null;

  return (
    <BaseCard
      isSelected={isSelected}
      className="cursor-pointer"
      onClick={() => onServiceClick(service)}
    >
      <ServiceCardHeader 
        service={service}
        language={language}
        hasDiscount={!!hasDiscount}
      />
      
      <ServiceCardBody 
        duration={service.duration}
        language={language}
      />
      
      <ServiceCardFooter 
        originalPrice={service.price}
        discountedPrice={discountedPrice}
        language={language}
        isSelected={isSelected}
        onToggle={(e) => {
          e.stopPropagation();
          onServiceToggle(service);
        }}
        hasDiscount={!!hasDiscount}
      />
    </BaseCard>
  );
});

ServiceCard.displayName = 'ServiceCard';
