
import { ServiceCard } from "./ServiceCard";
import { Service } from "@/types/service";

interface ServicesListProps {
  services: any[];
  selectedServices: { id: string; name: string; price: number; duration: number; }[];
  onServiceToggle: (service: any) => void;
  isServiceAvailable: (serviceId: string) => boolean;
  language: string;
}

export const ServicesList = ({
  services,
  selectedServices,
  onServiceToggle,
  isServiceAvailable,
  language
}: ServicesListProps) => {
  // Check if service is selected
  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some((service) => service.id === serviceId);
  };

  // Sort services by display order
  const sortedServices = [...services].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-4">
      {sortedServices.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          isSelected={isServiceSelected(service.id)}
          onSelect={() => onServiceToggle(service)}
          isAvailable={isServiceAvailable(service.id)}
          language={language}
        />
      ))}
    </div>
  );
};
