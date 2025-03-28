
import { useState } from 'react';
import { ServiceWithUpsells } from './types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UpsellServiceTable } from './UpsellServiceTable';
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface UpsellServiceListProps {
  servicesWithUpsells: ServiceWithUpsells[];
  onUpdateDiscount: (id: string, discount: number) => void;
  onDeleteUpsell: (id: string) => void;
}

export const UpsellServiceList = ({ 
  servicesWithUpsells,
  onUpdateDiscount,
  onDeleteUpsell
}: UpsellServiceListProps) => {
  const { language } = useLanguage();
  const [editingUpsell, setEditingUpsell] = useState<{
    id: string;
    discount: number;
  } | null>(null);

  return (
    <Accordion type="multiple" className="space-y-2">
      {servicesWithUpsells.map(service => (
        <AccordionItem key={service.id} value={service.id} className="border rounded-lg overflow-hidden bg-white">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex justify-between items-center w-full">
              <div className="text-left">
                <h3 className="font-medium">
                  {language === 'ar' ? service.name_ar : service.name_en}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Has {service.upsells?.length || 0} upsell option{service.upsells?.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Badge variant="outline" className="ml-2">
                {service.upsells?.length || 0} upsell{service.upsells?.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <UpsellServiceTable 
              upsells={service.upsells || []}
              editingUpsell={editingUpsell}
              setEditingUpsell={setEditingUpsell}
              onUpdateDiscount={onUpdateDiscount}
              onDeleteUpsell={onDeleteUpsell}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
