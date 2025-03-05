
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Service } from '@/types/service';
import { PriceDisplay } from "@/components/ui/price-display";
import { Lock } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";

interface BaseServiceCardProps {
  service: Service | null;
  isLoading: boolean;
}

export const BaseServiceCard = ({ service, isLoading }: BaseServiceCardProps) => {
  const { language } = useLanguage();
  
  if (isLoading) {
    return (
      <Card className="w-full shadow-md">
        <CardContent className="p-4">
          <div className="animate-pulse flex flex-col">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!service) {
    return (
      <Card className="w-full shadow-md border-red-300 bg-red-50">
        <CardContent className="p-4">
          <div className="text-red-600 font-medium">
            Base service not found. Please check configuration.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-md border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold flex items-center">
              {language === 'ar' ? service.name_ar : service.name_en}
              <Lock className="h-4 w-4 ml-2 text-muted-foreground" />
            </h3>
            <p className="text-sm text-muted-foreground">
              Base package service (not discountable)
            </p>
          </div>
          <div className="flex items-center">
            <PriceDisplay 
              price={service.price}
              language={language}
              size="lg"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
