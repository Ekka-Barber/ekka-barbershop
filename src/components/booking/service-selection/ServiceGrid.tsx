
import React, { useMemo } from "react";
import { ServiceCard } from "./ServiceCard";
import { Service } from "@/types/service";
import { useIsMobile } from "@/hooks/use-mobile";

interface ServiceGridProps {
  services: Service[];
  selectedServices: Array<{ id: string; name: string; price: number; duration: number; }>;
  onServiceClick: (service: Service) => void;
  onServiceToggle: (service: Service) => void;
  baseServiceId?: string;
  isLoading?: boolean;
}

export const ServiceGrid = ({
  services,
  selectedServices,
  onServiceClick,
  onServiceToggle,
  baseServiceId,
  isLoading = false
}: ServiceGridProps) => {
  const isMobile = useIsMobile();

  // Memoize service cards to prevent unnecessary re-renders
  const serviceCards = useMemo(() => {
    return services.map((service: Service) => (
      <ServiceCard
        key={service.id}
        service={service}
        isSelected={selectedServices.some(s => s.id === service.id)}
        onSelect={onServiceToggle}
        isBasePackageService={service.id === baseServiceId}
        className="h-full" // Ensure consistent height
      />
    ));
  }, [services, selectedServices, onServiceToggle, baseServiceId]);

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-1 md:grid-cols-2'}`}>
      {serviceCards}
    </div>
  );
};
