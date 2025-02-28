
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDuration, formatNumber } from "@/utils/formatters";
import { CustomerDetails } from "@/types/booking";
import { SelectedService } from "@/types/service";
import { Language } from "@/types/language";

export interface BookingSummaryProps {
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarber?: any;
  customerDetails: CustomerDetails;
  totalPrice: number;
  totalDuration: number;
  branch?: any;
  language: Language;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedServices,
  selectedDate,
  selectedTime,
  selectedBarber,
  customerDetails,
  totalPrice,
  totalDuration,
  branch,
  language
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {t('booking.summary')}
          </h3>
        </div>
        
        <div className="px-4 py-5 sm:p-6 space-y-6">
          {/* Services */}
          <div>
            <h4 className="font-medium mb-3">{t('step.services')}</h4>
            <ul className="space-y-2">
              {selectedServices.map((service) => (
                <li key={service.id} className="flex justify-between text-sm">
                  <span>{language === 'ar' ? service.name_ar : service.name_en}</span>
                  <span>{formatNumber(service.price, language)} SAR</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 pt-2 border-t flex justify-between font-medium">
              <span>{t('total')}</span>
              <span>{formatNumber(totalPrice, language)} SAR</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              <span>{t('total.duration')}</span>
              <span>{formatDuration(totalDuration, language)}</span>
            </div>
          </div>
          
          {/* Date & Time */}
          {selectedDate && selectedTime && (
            <div>
              <h4 className="font-medium mb-2">{t('date.time')}</h4>
              <p className="text-sm">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')} - {selectedTime}
              </p>
            </div>
          )}
          
          {/* Barber */}
          {selectedBarber && (
            <div>
              <h4 className="font-medium mb-2">{t('barber')}</h4>
              <p className="text-sm">{language === 'ar' && selectedBarber.name_ar ? selectedBarber.name_ar : selectedBarber.name}</p>
            </div>
          )}
          
          {/* Customer Details */}
          <div>
            <h4 className="font-medium mb-2">{language === 'ar' ? 'معلومات العميل' : 'Customer Details'}</h4>
            <div className="space-y-1 text-sm">
              <p><strong>{t('name')}:</strong> {customerDetails.name}</p>
              <p><strong>{t('phone')}:</strong> {customerDetails.phone}</p>
              <p><strong>{t('email')}:</strong> {customerDetails.email}</p>
              {customerDetails.notes && (
                <p><strong>{t('notes')}:</strong> {customerDetails.notes}</p>
              )}
            </div>
          </div>
          
          {/* Branch Info */}
          {branch && (
            <div>
              <h4 className="font-medium mb-2">{language === 'ar' ? 'الفرع' : 'Branch'}</h4>
              <p className="text-sm">{language === 'ar' && branch.name_ar ? branch.name_ar : branch.name}</p>
              <p className="text-sm text-gray-500">
                {language === 'ar' && branch.address_ar ? branch.address_ar : branch.address}
              </p>
            </div>
          )}
          
          {/* Booking Status Notice */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
            <p className="flex items-center">
              <span className="mr-1">{t('booking.unconfirmed')}</span>
              <span className="font-bold">{t('booking.unconfirmed.status')}</span>
            </p>
            <p className="mt-1 text-xs">
              {language === 'ar' 
                ? 'سنتواصل معك قريباً عبر الواتساب لتأكيد الحجز'
                : 'We will contact you soon via WhatsApp to confirm your booking'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
