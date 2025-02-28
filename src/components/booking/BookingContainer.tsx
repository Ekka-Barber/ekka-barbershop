
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BookingSteps } from "./BookingSteps";
import { BookingProgress } from "./BookingProgress";
import { BookingNavigation } from "./BookingNavigation";
import { BookingHeader } from "./BookingHeader";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBooking } from "@/hooks/useBooking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingConfirmDialog } from "./components/BookingConfirmDialog";
import { trackPageView } from "@/utils/clickTracking";

export const BookingContainer = () => {
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Get branch from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const branchId = searchParams.get('branch');
    if (branchId) {
      setSelectedBranchId(branchId);
    } else {
      // If no branch provided, fetch the first branch
      const fetchFirstBranch = async () => {
        try {
          const { data } = await supabase
            .from('branches')
            .select('id')
            .limit(1)
            .single();
          
          if (data) {
            setSelectedBranchId(data.id);
          }
        } catch (error) {
          console.error('Error fetching first branch:', error);
        }
      };
      
      fetchFirstBranch();
    }
  }, [location.search]);

  // Query branch data
  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ['branch', selectedBranchId],
    queryFn: async () => {
      if (!selectedBranchId) return null;
      
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', selectedBranchId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBranchId,
  });

  const {
    currentStep,
    setCurrentStep,
    selectedServices,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedBarber,
    setSelectedBarber,
    customerDetails,
    handleCustomerDetailsChange,
    categories,
    categoriesLoading,
    employees,
    employeesLoading,
    handleServiceToggle,
    totalPrice
  } = useBooking(branch);

  // Track page view
  useEffect(() => {
    // Using trackPageView utility
    trackPageView({
      pageName: 'Booking',
      pageUrl: window.location.href
    });
  }, []);

  const handleBookingSubmit = async () => {
    setIsBookingInProgress(true);
    try {
      // Booking logic...
      toast.success(language === 'ar' ? 'تم الحجز بنجاح!' : 'Booking confirmed!');
      navigate('/booking-success');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.'
          : 'There was an error with your booking. Please try again.'
      );
      setIsBookingInProgress(false);
    }
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col"
    >
      <div className="app-header">
        <div className="language-switcher-container">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="app-container">
        <div className="content-area pb-24">
          <BookingHeader 
            branchName={branch?.name || branch?.name_ar} 
            branchAddress={branch?.address || branch?.address_ar}
            isLoading={branchLoading}
          />

          <BookingProgress currentStep={currentStep} />

          <BookingSteps
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            selectedServices={selectedServices}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            selectedBarber={selectedBarber}
            setSelectedBarber={setSelectedBarber}
            customerDetails={customerDetails}
            handleCustomerDetailsChange={handleCustomerDetailsChange}
            categories={categories}
            categoriesLoading={categoriesLoading}
            employees={employees}
            employeesLoading={employeesLoading}
            onServiceToggle={handleServiceToggle}
            totalPrice={totalPrice}
            branch={branch}
            branchId={selectedBranchId}
          />
        </div>
      </div>

      <BookingNavigation
        currentStepIndex={steps.indexOf(currentStep)}
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        isNextDisabled={
          (currentStep === 'services' && selectedServices.length === 0) ||
          (currentStep === 'datetime' && (!selectedDate || !selectedTime)) ||
          (currentStep === 'barber' && !selectedBarber) ||
          (currentStep === 'customer' && (!customerDetails.name || !customerDetails.phone || !customerDetails.email))
        }
        customerDetails={customerDetails}
        branch={branch}
        onNextClick={currentStep === 'summary' ? () => setIsConfirmDialogOpen(true) : undefined}
      />

      <BookingConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleBookingSubmit}
        isLoading={isBookingInProgress}
        language={language}
      />
    </div>
  );
};

// Define steps array
const steps: BookingStep[] = ['services', 'datetime', 'barber', 'customer', 'summary'];
