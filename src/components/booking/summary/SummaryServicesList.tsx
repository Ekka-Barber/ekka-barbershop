
import { AnimatePresence } from "framer-motion";
import { SelectedService } from "@/types/service";
import { SummaryServiceItem } from "./SummaryServiceItem";
import { NoServicesSelected } from "./NoServicesSelected";

interface SummaryServicesListProps {
  selectedServices: SelectedService[];
  language: 'en' | 'ar';
  onRemoveService?: (serviceId: string) => void;
  baseServiceId?: string;
}

export const SummaryServicesList = ({ 
  selectedServices, 
  language, 
  onRemoveService,
  baseServiceId = 'a3dbfd63-be5d-4465-af99-f25c21d578a0'
}: SummaryServicesListProps) => {
  const handleServiceRemove = (service: SelectedService) => {
    if (onRemoveService) {
      onRemoveService(service.id);
    }
  };

  return (
    <div className="pb-2">
      <AnimatePresence>
        {selectedServices.length > 0 ? (
          selectedServices.map(service => (
            <SummaryServiceItem 
              key={service.id}
              service={service} 
              language={language} 
              onRemove={onRemoveService ? handleServiceRemove : undefined}
              baseServiceId={baseServiceId}
            />
          ))
        ) : (
          <NoServicesSelected language={language} />
        )}
      </AnimatePresence>
    </div>
  );
};
