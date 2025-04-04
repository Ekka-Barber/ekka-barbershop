
import React, { useMemo } from "react";
import { ServiceCard } from "./ServiceCard";
import { Service } from "@/types/service";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingState } from "@/components/booking/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { logger } from "@/utils/logger";

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
    if (isLoading) {
      return Array(4).fill(0).map((_, index) => (
        <div 
          key={`skeleton-${index}`} 
          className="border rounded-lg p-4 h-[120px] animate-pulse bg-gray-100"
        />
      ));
    }
    
    if (error) {
      return (
        <div className="col-span-full">
          <LoadingState 
            error={true}
            errorMessage={error.message}
            onRetry={onRetry}
          />
        </div>
      );
    }
    
    if (services.length === 0) {
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

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        <LoadingState size="sm" message={isRTL ? 'جاري تحميل الخدمات...' : 'Loading services...'} />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        `grid gap-4 
        ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-1 md:grid-cols-2'}
        animate-fade-in`,
        isRTL ? "rtl" : "ltr"
      )}
      style={{
        opacity: isLoading ? 0.6 : 1,
        transition: 'opacity 0.3s ease'
      }}
    >
      {serviceCards}
    </div>
  );
};

// Add the import for cn utility that was missing
import { cn } from "@/lib/utils";
