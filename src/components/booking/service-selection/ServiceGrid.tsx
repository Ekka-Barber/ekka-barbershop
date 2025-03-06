
import { ServiceCard } from "./ServiceCard";
import { Service } from "@/types/service";

interface ServiceGridProps {
  services: Service[];
  selectedServices: Array<{ id: string; name: string; price: number; duration: number; }>;
  onServiceClick: (service: Service) => void;
  onServiceToggle: (service: Service) => void;
  baseServiceId?: string;
}

export const ServiceGrid = ({
  services,
  selectedServices,
  onServiceClick,
  onServiceToggle,
  baseServiceId
}: ServiceGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {services.map((service: Service) => (
        <ServiceCard
          key={service.id}
          service={service}
          isSelected={selectedServices.some(s => s.id === service.id)}
          onSelect={onServiceToggle}
          isBasePackageService={service.id === baseServiceId}
          className=""
        />
      ))}
    </div>
  );
};
