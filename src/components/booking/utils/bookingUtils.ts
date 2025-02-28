
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { NavigateFunction } from "react-router-dom";

interface CreateBookingWithFeedbackParams {
  createBooking: (params: { branchId: string; employeeId?: string }) => Promise<any>;
  branchId: string;
  selectedBarber?: string;
  setBookingStatus: (status: 'idle' | 'submitting' | 'success' | 'error') => void;
  setIsConfirmDialogOpen: (isOpen: boolean) => void;
  clearBookingData: () => void;
  navigate: NavigateFunction;
}

export const createBookingWithFeedback = async ({
  createBooking,
  branchId,
  selectedBarber,
  setBookingStatus,
  setIsConfirmDialogOpen,
  clearBookingData,
  navigate
}: CreateBookingWithFeedbackParams) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  
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
