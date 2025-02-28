
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookingHeader } from "./BookingHeader";
import { BookingNavigation } from "./BookingNavigation";
import { BookingProgress, BookingStep } from "./BookingProgress";
import { BookingConfirmDialog } from "./components/BookingConfirmDialog";
import { WhatsAppIntegration } from "./WhatsAppIntegration";
import { useToast } from "@/hooks/use-toast";
import { useBooking } from "@/hooks/useBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCachedServices } from "@/utils/serviceCache";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StepRenderer from "./steps/StepRenderer";
import { trackPageView } from "@/utils/clickTracking";

export const BookingContainer = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const branchId = queryParams.get("branch") || localStorage.getItem("selectedBranch");

  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>("idle");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>("services");

  // Fetch branch information
  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ["branch", branchId],
    queryFn: async () => {
      if (!branchId) return null;
      
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .single();
        
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!branchId,
  });

  const {
    selectedServices,
    selectedDate,
    selectedTime,
    selectedBarber,
    customerDetails,
    handleCustomerDetailsChange,
    categories,
    categoriesLoading,
    employees,
    employeesLoading,
    handleServiceToggle,
    totalPrice,
    canProceedToNextStep,
    createBooking,
    clearBookingData,
    setSelectedDate,
    setSelectedTime,
    setSelectedBarber,
    termsAccepted,
    setTermsAccepted
  } = useBooking(branch);

  // Load cached services on mount
  useEffect(() => {
    const cachedServices = getCachedServices();
    if (cachedServices && cachedServices.length > 0) {
      cachedServices.forEach(service => {
        handleServiceToggle(service);
      });
    }
    
    // Track page view for analytics
    trackPageView({
      page: "booking",
      source: document.referrer,
      branch: branchId,
    });
  }, []);

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    setBookingStatus("submitting");
    try {
      await createBooking({
        branchId: branchId || "",
        employeeId: selectedBarber,
      });
      setBookingStatus("success");
      setIsConfirmDialogOpen(false);
      
      toast({
        title: language === "ar" ? "تم تأكيد الحجز بنجاح" : "Booking Confirmed",
        description: language === "ar" 
          ? "سنتواصل معك قريباً لتأكيد موعدك" 
          : "We'll contact you soon to confirm your appointment",
      });
      
      // Navigate back to home after successful booking
      setTimeout(() => {
        clearBookingData();
        navigate("/");
      }, 3000);
      
    } catch (error) {
      console.error("Booking error:", error);
      setBookingStatus("error");
      
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ في الحجز" : "Booking Error",
        description: language === "ar"
          ? "حدث خطأ أثناء تأكيد الحجز. يرجى المحاولة مرة أخرى."
          : "There was an error confirming your booking. Please try again.",
      });
    }
  };

  if (!branchId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === "ar" ? "يرجى اختيار فرع أولاً" : "Please select a branch first"}
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#C4A484] text-white rounded-md"
          >
            {language === "ar" ? "العودة للصفحة الرئيسية" : "Return to Home"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 mb-24">
      <BookingHeader 
        branchName={branch?.name}
        branchAddress={branch?.address}
        isLoading={branchLoading}
      />
      
      <BookingProgress currentStep={currentStep} />
      
      <div className="mt-6">
        <StepRenderer
          currentStep={currentStep}
          // Services step props
          categories={categories}
          categoriesLoading={categoriesLoading}
          selectedServices={selectedServices}
          onServiceToggle={handleServiceToggle}
          onStepChange={setCurrentStep}
          branchId={branchId}
          // DateTime step props
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          // Barber step props
          selectedBarber={selectedBarber}
          onBarberSelect={setSelectedBarber}
          setSelectedBarber={setSelectedBarber}
          employees={employees}
          employeesLoading={employeesLoading}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          // Customer step props
          customerDetails={customerDetails}
          onCustomerDetailsChange={handleCustomerDetailsChange}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          onTermsAcceptanceChange={setTermsAccepted}
          // Shared props
          branch={branch}
          totalPrice={totalPrice()}
          totalDuration={selectedServices.reduce((sum, service) => sum + service.duration, 0)}
        />
      </div>
      
      <BookingNavigation 
        currentStep={currentStep} 
        setCurrentStep={setCurrentStep}
        onConfirm={() => setIsConfirmDialogOpen(true)} 
        canProceed={canProceedToNextStep(currentStep)}
      />
      
      <BookingConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmBooking}
        isLoading={bookingStatus === "submitting"}
      />
      
      <WhatsAppIntegration 
        branch={branch} 
        selectedServices={selectedServices}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        customerDetails={customerDetails}
        totalPrice={totalPrice()}
        language={language}
      />
    </div>
  );
};
