
import { useState } from "react";
import { ServiceSelectionContainer } from "../service-selection/ServiceSelectionContainer";
import { useServiceAvailability } from "@/hooks/useServiceAvailability";
import { BookingStep } from "../BookingProgress";
import { SelectedService, Service } from "@/types/service";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceStepProps {
  selectedServices: SelectedService[];
  onServiceToggle: (service: any) => void;
}

const ServiceStep: React.FC<ServiceStepProps> = ({
  selectedServices,
  onServiceToggle
}) => {
  const { language } = useLanguage();
  const [totalDuration, setTotalDuration] = useState(
    selectedServices.reduce((sum, service) => sum + service.duration, 0)
  );
  const [totalPrice, setTotalPrice] = useState(
    selectedServices.reduce((sum, service) => sum + service.price, 0)
  );

  // Update totals when services change
  useState(() => {
    setTotalDuration(selectedServices.reduce((sum, service) => sum + service.duration, 0));
    setTotalPrice(selectedServices.reduce((sum, service) => sum + service.price, 0));
  });

  return (
    <div className="space-y-6">
      {selectedServices.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">
            {language === 'ar' ? 'لم يتم اختيار خدمات' : 'No services selected'}
          </h3>
          <p className="text-gray-500">
            {language === 'ar' 
              ? 'يرجى اختيار خدمة واحدة على الأقل للمتابعة' 
              : 'Please select at least one service to continue'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">
            {language === 'ar' ? 'الخدمات المختارة' : 'Selected Services'}
          </h3>
          <ul className="space-y-2">
            {selectedServices.map(service => (
              <li 
                key={service.id}
                className="flex justify-between p-3 bg-white border rounded-md shadow-sm"
              >
                <span>{language === 'ar' ? service.name_ar : service.name_en}</span>
                <span className="font-medium">{service.price} SAR</span>
              </li>
            ))}
          </ul>
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between font-medium">
              <span>{language === 'ar' ? 'المجموع' : 'Total'}</span>
              <span>{totalPrice} SAR</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{language === 'ar' ? 'المدة الإجمالية' : 'Total Duration'}</span>
              <span>{totalDuration} {language === 'ar' ? 'دقيقة' : 'min'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceStep;
