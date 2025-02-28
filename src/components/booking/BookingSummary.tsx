
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BookingSummaryProps {
  selectedServices: any[];
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  selectedBarberName: string | undefined;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
  totalPrice: number;
  branch: any;
}

export const BookingSummary = ({
  selectedServices,
  selectedDate,
  selectedTime,
  selectedBarberName,
  customerDetails,
  totalPrice,
  branch
}: BookingSummaryProps) => {
  const { language, t } = useLanguage();
  
  const formatDateForDisplay = (date: Date) => {
    if (!date) return '';
    
    return format(date, 'EEEE, MMMM d, yyyy', {
      locale: language === 'ar' ? ar : undefined
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-center mb-4">{t('booking.summary')}</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">{t('services')}</h3>
            <div className="space-y-2">
              {selectedServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-700">
                      {language === 'ar' ? service.name_ar : service.name_en}
                    </span>
                    {service.isUpsellItem && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {language === 'ar' ? 'مخفّض' : 'Discounted'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    {service.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {service.originalPrice} SAR
                      </span>
                    )}
                    <span className={service.originalPrice ? "text-green-600 font-medium" : ""}>
                      {service.price} SAR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">{t('appointment.details')}</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('date')}:</span>
                <span className="font-medium">{selectedDate ? formatDateForDisplay(selectedDate) : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('time')}:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('barber')}:</span>
                <span className="font-medium">{selectedBarberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('branch')}:</span>
                <span className="font-medium">
                  {language === 'ar' ? branch?.name_ar || branch?.name : branch?.name}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">{t('customer.details')}</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('name')}:</span>
                <span className="font-medium">{customerDetails.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('phone')}:</span>
                <span className="font-medium">{customerDetails.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('email')}:</span>
                <span className="font-medium">{customerDetails.email}</span>
              </div>
              {customerDetails.notes && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('notes')}:</span>
                  <span className="font-medium">{customerDetails.notes}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">{t('total')}:</span>
              <span className="text-xl font-bold text-[#C4A36F]">{totalPrice} SAR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
