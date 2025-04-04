
import React, { useMemo } from "react";
import { ServiceCard } from "./ServiceCard";
import { Service } from "@/types/service";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingState } from "@/components/booking/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { logger } from "@/utils/logger";
import { ValidationOverlay } from "@/components/booking/steps/components/ValidationOverlay";
import { cn } from "@/lib/utils";

/**
 * Interface for ServiceGrid component props
 * @interface ServiceGridProps
 */
interface ServiceGridProps {
  services: Service[];
  selectedServices: Array<{ id: string; name: string; price: number; duration: number; }>;
  onServiceClick: (service: Service) => void;
  onServiceToggle: (service: Service) => void;
  baseServiceId?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Displays a responsive grid of service cards
 * Handles loading states, errors, and empty states
 * 
 * @param {ServiceGridProps} props - Component props
 * @returns {JSX.Element} The ServiceGrid component
 */
export const ServiceGrid = ({
  services,
  selectedServices,
  onServiceClick,
  onServiceToggle,
  baseServiceId,
  isLoading = false,
  error = null,
  onRetry
}: ServiceGridProps) => {
  const isMobile = useIsMobile();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  
  // Log errors using the logger utility
  React.useEffect(() => {
    if (error) {
      logger.error("Error loading services:", error);
    }
  }, [error]);

  // Memoize service cards to prevent unnecessary re-renders
  const serviceCards = useMemo(() => {
    if (services.length === 0 && !isLoading && !error) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">
            {isRTL ? 'لا توجد خدمات متاحة' : 'No services available'}
          </p>
        </div>
      );
    }
    
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
  }, [services, selectedServices, onServiceToggle, baseServiceId, isLoading, error, onRetry, isRTL]);

  return (
    <div className="relative">
      {isLoading && (
        <ValidationOverlay 
          isValidating={true} 
          message={t('services.loading')} 
        />
      )}
      
      {error && (
        <ValidationOverlay 
          isValidating={false}
          hasError={true} 
          errorMessage={error.message || t('services.error')} 
          onRetry={onRetry} 
        />
      )}
      
      <div 
        className={cn(
          `grid gap-4 
          ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-1 md:grid-cols-2'}
          animate-fade-in`,
          isRTL ? "rtl" : "ltr"
        )}
      >
        {!isLoading && !error ? serviceCards : Array(4).fill(0).map((_, index) => (
          <div 
            key={`skeleton-${index}`} 
            className="border rounded-lg p-4 h-[120px] animate-pulse bg-gray-100"
          />
        ))}
      </div>
    </div>
  );
};
