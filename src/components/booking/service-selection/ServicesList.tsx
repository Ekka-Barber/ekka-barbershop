
import { ServiceCard } from "./ServiceCard";
import { Service } from "@/types/service";

interface ServicesListProps {
  services: Service[];
  selectedServices: Service[];
  onServiceToggle: (service: Service) => void;
}

export const ServicesList = ({ services, selectedServices, onServiceToggle }: ServicesListProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          isSelected={selectedServices.some(s => s.id === service.id)}
          onSelect={onServiceToggle}
        />
      ))}
    </div>
  );
};
