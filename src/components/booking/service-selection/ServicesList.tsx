
import { ServiceCard } from './ServiceCard';
import { Service, SelectedService, Category } from '@/types/service';
import { Language } from '@/types/language';

interface ServicesListProps {
  category?: Category;
  selectedServices: SelectedService[];
  onServiceToggle: (service: Service) => void;
  isServiceAvailable: (serviceId: string) => boolean;
  language: Language;
}

export const ServicesList = ({
  category,
  selectedServices,
  onServiceToggle,
  isServiceAvailable,
  language
}: ServicesListProps) => {
  if (!category || !category.services || category.services.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        {language === 'ar' ? 'لا توجد خدمات متاحة في هذه الفئة' : 'No services available in this category'}
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      {category.services.map((service) => {
        const isSelected = selectedServices.some(s => s.id === service.id);
        const isAvailable = isServiceAvailable(service.id);
        
        return (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={isSelected}
            isAvailable={isAvailable}
            onSelect={() => isAvailable && onServiceToggle(service)}
            language={language}
          />
        );
      })}
    </div>
  );
};
