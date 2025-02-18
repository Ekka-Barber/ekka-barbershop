
import { Service, Category } from '@/types/service';
import { ServiceSelection } from '@/components/booking/ServiceSelection';

interface ServiceStepProps {
  categories: Category[];
  isLoading: boolean;
  selectedServices: Service[];
  onServiceToggle: (service: Service) => void;
  onStepChange: (step: string) => void;
}

export const ServiceStep = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange
}: ServiceStepProps) => {
  return (
    <ServiceSelection
      categories={categories}
      isLoading={isLoading}
      selectedServices={selectedServices}
      onServiceToggle={onServiceToggle}
      onStepChange={onStepChange}
    />
  );
};
