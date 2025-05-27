
import { Service } from '@/types/service';
import { Category } from '@/types/service';
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { BasicServiceInfo } from './service-form/BasicServiceInfo';
import { ServiceDescriptions } from './service-form/ServiceDescriptions';
import { PricingSection } from './service-form/PricingSection';

import { useIsMobile } from '@/hooks/use-mobile';

type ServiceFormProps = {
  categories: Category[] | undefined;
  service: Partial<Service>;
  onChange: (service: Partial<Service>) => void;
};

export const ServiceForm = ({ 
  categories, 
  service, 
  onChange
}: ServiceFormProps) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  
  return (
    <Card className="border-none shadow-none">
      <CardContent className={`space-y-${isMobile ? '4' : '6'} p-0`}>
        <BasicServiceInfo
          service={service}
          categories={categories}
          onChange={onChange}
          isMobile={isMobile}
        />
        
        <ServiceDescriptions
          service={service}
          onChange={onChange}
          isMobile={isMobile}
        />
        
        <PricingSection
          service={service}
          onChange={onChange}
          language={language}
          isMobile={isMobile}
        />
        

      </CardContent>
    </Card>
  );
};
