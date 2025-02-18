
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranchManagement } from "@/hooks/booking/useBranchManagement";
import { BookingLayout } from "./layout/BookingLayout";
import { BookingLoadingState } from "./layout/BookingLoadingState";
import { BookingErrorState } from "./layout/BookingErrorState";
import { NoBranchState } from "./layout/NoBranchState";
import { BookingContent } from "./containers/BookingContent";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const BookingContainer = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { branch, isLoading, error, branchId } = useBranchManagement();

  useEffect(() => {
    if (!branchId) {
      navigate('/customer');
    }
  }, [branchId, navigate]);

  if (!branchId) {
    return (
      <BookingLayout>
        <NoBranchState />
      </BookingLayout>
    );
  }

  if (error) {
    return (
      <BookingLayout>
        <BookingErrorState />
      </BookingLayout>
    );
  }

  if (isLoading || !branch) {
    return (
      <BookingLayout>
        <BookingLoadingState />
      </BookingLayout>
    );
  }

  return (
    <ErrorBoundary>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <BookingLayout>
          <BookingContent branch={branch} isLoading={isLoading} />
        </BookingLayout>
      </div>
    </ErrorBoundary>
  );
};
