
import { Service, Category } from '@/types/service';
import { ServiceSelection } from '@/components/booking/ServiceSelection';
import { BookingStep } from '../BookingProgress';

interface ServiceStepProps {
  categories: Category[];
  categoriesLoading: boolean;
  selectedServices: Service[];
  handleServiceToggle: (service: Service) => void;
  handleStepChange: (step: BookingStep) => void;
}

export const ServiceStep = ({
  categories,
  categoriesLoading,
  selectedServices,
  handleServiceToggle,
  handleStepChange
}: ServiceStepProps) => {
  return (
    <ServiceSelection
      categories={categories}
      isLoading={categoriesLoading}
      selectedServices={selectedServices}
      onServiceToggle={handleServiceToggle}
      onStepChange={handleStepChange}
    />
  );
};
