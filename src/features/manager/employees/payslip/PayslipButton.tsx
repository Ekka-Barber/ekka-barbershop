import { FileText } from 'lucide-react';
import { Suspense, useState, type FC, type KeyboardEvent, type ComponentType } from 'react';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/components/button';
import { lazyWithRetry } from '@shared/utils/lazyWithRetry';

import { PayslipButtonProps, PayslipModalProps } from '@/features/manager/types/payslip';

const PayslipModal = lazyWithRetry(() =>
  import('./PayslipModal').then((mod) => ({ default: mod.PayslipModal as ComponentType<PayslipModalProps> }))
);

const PayslipButton: FC<PayslipButtonProps> = ({ employeeData, salaryData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ensure we have valid employee data before opening the modal
  const safeEmployeeData = {
    ...employeeData,
    name: employeeData?.name || 'موظف',
    name_ar: employeeData?.name_ar || employeeData?.name || 'موظف',
    id: employeeData?.id || '0',
    role: employeeData?.role || 'غير محدد',
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenModal();
    }
  };

  return (
    <>
      <Button
        className={cn(
          "w-full relative overflow-hidden group",
          "bg-gradient-to-r from-[#e9b353] to-[#d4921b] hover:from-[#d4921b] hover:to-[#efc780]",
          "text-white shadow hover:shadow-md transition-all"
        )}
        onClick={handleOpenModal}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="عرض وتحميل كشف الراتب"
        type="button"
      >
        <span className="relative z-10 flex items-center justify-center">
          <FileText className="mr-2 h-4 w-4" />
          كشف الراتب
        </span>
        <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
      </Button>

      {isModalOpen && (
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              Loading payslip...
            </div>
          }
        >
          <PayslipModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            employeeData={safeEmployeeData}
            salaryData={salaryData}
          />
        </Suspense>
      )}
    </>
  );
};

export default PayslipButton; 
