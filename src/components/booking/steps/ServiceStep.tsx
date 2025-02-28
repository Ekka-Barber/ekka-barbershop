
import { ServiceSelectionContainer } from "../service-selection/ServiceSelectionContainer";
import { BookingStep } from "../BookingProgress";
import { SelectedService } from "@/types/service";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceStepProps {
  selectedServices: SelectedService[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: BookingStep) => void;
  branchId?: string;
  categories?: any[];
  categoriesLoading?: boolean;
  categoriesError?: Error;
  totalPrice?: number;
  totalDuration?: number;
}

const ServiceStep: React.FC<ServiceStepProps> = ({
  selectedServices,
  onServiceToggle,
  onStepChange,
  categories,
  categoriesLoading,
  categoriesError,
  totalPrice,
  totalDuration
}) => {
  const { language } = useLanguage();
  
  // Calculate total duration and price from selected services if not provided as props
  const calculatedTotalDuration = totalDuration || selectedServices.reduce((sum, service) => sum + service.duration, 0);
  const calculatedTotalPrice = totalPrice || selectedServices.reduce((sum, service) => sum + service.price, 0);

  // Check if we're still loading categories or have an error
  if (categoriesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  // Handle error state
  if (categoriesError) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-xl font-medium text-red-600 mb-2">
          {language === 'ar' ? 'حدث خطأ' : 'Error Loading Services'}
        </h3>
        <p className="text-gray-600">
          {language === 'ar' 
            ? 'لم نتمكن من تحميل قائمة الخدمات. يرجى المحاولة مرة أخرى لاحقًا.' 
            : 'We could not load the services list. Please try again later.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#C4A484] text-white rounded-lg hover:bg-[#b3957b]"
        >
          {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  // Handle missing categories
  if (!categories || categories.length === 0) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-xl font-medium text-gray-700 mb-2">
          {language === 'ar' ? 'لا توجد خدمات متاحة' : 'No Services Available'}
        </h3>
        <p className="text-gray-600">
          {language === 'ar' 
            ? 'لا توجد خدمات متاحة حاليًا. يرجى المحاولة مرة أخرى لاحقًا.' 
            : 'There are no services available at the moment. Please try again later.'}
        </p>
      </div>
    );
  }

  // Helper function to check if a service is selected
  const isServiceSelected = (serviceId: string): boolean => {
    return selectedServices.some(service => service.id === serviceId);
  };

  return (
    <div className="h-[calc(100vh-16rem)]">
      <ServiceSelectionContainer
        categories={categories}
        selectedServices={selectedServices}
        onServiceToggle={onServiceToggle}
        onNextStep={(step) => onStepChange?.(step)}
        isServiceAvailable={() => true} // Services are pre-filtered by availability in useBookingServices
        language={language}
        totalDuration={calculatedTotalDuration}
        totalPrice={calculatedTotalPrice}
      />
    </div>
  );
};

export default ServiceStep;
