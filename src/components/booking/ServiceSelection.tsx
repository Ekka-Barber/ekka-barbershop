
import { ServiceSelectionContainer } from '../service-selection/ServiceSelectionContainer';
import type { Service, Category } from '@/types/service';

interface ServiceSelectionProps {
  categories: Category[] | undefined;
  isLoading: boolean;
  selectedServices: Service[];
  onServiceToggle: (service: Service) => void;
  onStepChange?: (step: string) => void;
}

export const ServiceSelection = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange
}: ServiceSelectionProps) => {
  return (
    <ServiceSelectionContainer
      categories={categories}
      isLoading={isLoading}
      selectedServices={selectedServices}
      onServiceToggle={onServiceToggle}
      onStepChange={onStepChange}
    />
  );
};
