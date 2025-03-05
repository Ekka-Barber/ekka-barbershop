
import React from 'react';
import { Service } from '@/types/service';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceGridProps {
  services: Service[] | undefined;
  isLoading: boolean;
  isBaseService: (serviceId: string) => boolean;
  isServiceEnabled: (serviceId: string) => boolean;
  onToggleService: (serviceId: string) => void;
}

export const ServiceGrid = ({ 
  services, 
  isLoading,
  isBaseService,
  isServiceEnabled,
  onToggleService
}: ServiceGridProps) => {
  const { language } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-4">
              <div className="animate-pulse flex flex-col">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-10"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!services || services.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-600">No Services Available</h3>
        <p className="text-gray-500 mt-1">
          There are no services to display at this time.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {services.map(service => {
        const isBase = isBaseService(service.id);
        const isEnabled = isServiceEnabled(service.id);
        
        return (
          <Card 
            key={service.id} 
            className={`w-full transition-all ${
              isBase ? 'opacity-50 cursor-not-allowed' : 
              isEnabled ? 'border-primary/30 bg-primary/5' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium truncate">
                  {language === 'ar' ? service.name_ar : service.name_en}
                </h3>
                <div className="flex items-center justify-between">
                  <PriceDisplay 
                    price={service.price}
                    language={language}
                  />
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => !isBase && onToggleService(service.id)}
                    disabled={isBase}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
