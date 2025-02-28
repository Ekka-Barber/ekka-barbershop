
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
  // Log for debugging
  console.log('ServicesList rendering with category:', category?.name_en);
  
  if (!category) {
    console.log('ServicesList received undefined category');
    return (
      <div className="p-4 text-center text-gray-500">
        {language === 'ar' ? 'لم يتم تحديد فئة' : 'No category selected'}
      </div>
    );
  }
  
  if (!category.services || category.services.length === 0) {
    console.log('ServicesList: No services in category', category.name_en);
    return (
      <div className="p-4 text-center text-gray-500">
        {language === 'ar' ? 'لا توجد خدمات متاحة في هذه الفئة' : 'No services available in this category'}
      </div>
    );
  }

  console.log('ServicesList: Rendering', category.services.length, 'services for category', category.name_en);

  return (
    <div className="space-y-4 px-4">
      {category.services.map((service) => {
        const isSelected = selectedServices.some(s => s.id === service.id);
        // Services are pre-filtered for availability in useBookingServices
        const isAvailable = isServiceAvailable(service.id);
        
        return (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={isSelected}
            isAvailable={isAvailable}
            onSelect={() => onServiceToggle(service)}
            language={language}
          />
        );
      })}
    </div>
  );
};
