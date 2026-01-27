import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Download, X, AlertTriangle, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as React from "react";

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/components/button';
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@shared/ui/components/dialog';

import { generatePDFBlob } from './LazyPDFWrapper';
import PayslipViewer from './PayslipViewer';

import { useMonthContext } from "@/features/manager/hooks/useMonthContext";
import { PayslipModalProps } from '@/features/manager/types/payslip';
import { mapSalaryToPayslipData } from '@/features/manager/types/payslip';



// Custom DialogContent without the default close button
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {/* No default close button */}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  employeeData,
  salaryData,
}) => {
  const [viewerError, setViewerError] = useState<Error | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingFallback, setIsGeneratingFallback] = useState(false);
  const { selectedMonth, getMonthDisplay } = useMonthContext();

  // Get the payslip period based on selected month
  const getCurrentPayPeriod = (): string => {
    return getMonthDisplay(selectedMonth);
  };

  // Generate payslip data from employee and salary data
  const payslipData = mapSalaryToPayslipData(
    employeeData,
    salaryData,
    getCurrentPayPeriod()
  );
  
  // For debugging - log the generated payslip data
  console.log("PayslipModal generated data for month:", selectedMonth, payslipData);

  // Handle viewer error by generating a direct PDF as fallback
  const handleViewerError = (error: Error) => {
    console.error("PayslipModal: PDF viewer error detected:", error);
    setViewerError(error);
    
    if (!pdfBlob && !isGeneratingFallback) {
      generateFallbackPdf();
    }
  };
  
  // Generate PDF directly without viewer as fallback
  const generateFallbackPdf = async () => {
    setIsGeneratingFallback(true);
    
    try {
      console.log("Generating fallback PDF...");
      const blob = await generatePDFBlob(payslipData);
      console.log("Fallback PDF generated successfully");
      setPdfBlob(blob);
    } catch (error) {
      console.error("Failed to generate fallback PDF:", error);
    } finally {
      setIsGeneratingFallback(false);
    }
  };
  
  // Clean up when modal closes or month changes
  useEffect(() => {
    if (!isOpen && pdfBlob) {
      URL.revokeObjectURL(URL.createObjectURL(pdfBlob));
      setPdfBlob(null);
      setViewerError(null);
    }
  }, [isOpen, pdfBlob]);

  // Reset PDF blob when month changes to ensure fresh data
  useEffect(() => {
    if (pdfBlob) {
      URL.revokeObjectURL(URL.createObjectURL(pdfBlob));
      setPdfBlob(null);
      setViewerError(null);
    }
  }, [selectedMonth, pdfBlob]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-4xl w-[90vw] p-0 overflow-hidden",
          "border-[#e9b353] border-2"
        )}
        onEscapeKeyDown={onClose}
        onInteractOutside={onClose}
      >
        {/* Custom header with gold gradient */}
        <div className="bg-gradient-to-r from-[#e9b353] to-[#d4921b] p-4 text-white">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">كشف الراتب</DialogTitle>
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-white hover:text-white hover:bg-white/10 rounded-full"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
          <DialogDescription className="text-white/90 mt-1">
            {getCurrentPayPeriod()} | {employeeData.name_ar || employeeData.name}
          </DialogDescription>
        </div>
        
        {/* Content area with the PayslipViewer */}
        <div className="p-2 max-h-[80vh] overflow-auto">
          {viewerError && pdfBlob ? (
            <div className="p-6 text-center">
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 inline-flex items-center">
                <AlertTriangle className="text-amber-500 mr-2 h-5 w-5" />
                <span className="text-amber-700">
                  لم نتمكن من عرض كشف الراتب مباشرة، ولكن يمكنك تنزيله أو فتحه في المتصفح.
                </span>
              </div>
              
              <div className="flex flex-col gap-3 max-w-md mx-auto">
                <Button
                  variant="outline"
                  className="w-full border-[#e9b353] text-[#e9b353] hover:bg-[#e9b353]/10"
                  onClick={() => {
                    if (pdfBlob) {
                      const url = URL.createObjectURL(pdfBlob);
                      window.open(url, '_blank');
                    }
                  }}
                >
                  <FileText className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
                  فتح PDF في المتصفح
                </Button>
                
                <a 
                  href={pdfBlob ? URL.createObjectURL(pdfBlob) : '#'}
                  download={`payslip-${payslipData.employee.nameAr}-${payslipData.payPeriod}.pdf`}
                  className="w-full"
                >
                  <Button 
                    className={cn(
                      "w-full",
                      "bg-gradient-to-r from-[#e9b353] to-[#d4921b] hover:from-[#d4921b] hover:to-[#efc780]",
                      "text-white relative overflow-hidden group"
                    )}
                    disabled={!pdfBlob}
                  >
                    <span className="relative z-10 flex items-center">
                      <Download className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
                      تحميل كشف الراتب
                    </span>
                    <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <PayslipViewer 
              employeeData={employeeData} 
              salaryData={salaryData}
              payPeriod={getCurrentPayPeriod()}
              onError={handleViewerError}
            />
          )}
        </div>
        
        {/* Footer with actions */}
        <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between">
          <div className="flex flex-row-reverse sm:flex-row gap-2 w-full justify-end">
            <Button 
              variant="outline" 
              className="border-[#e9b353] text-[#e9b353] hover:bg-[#e9b353]/10"
              onClick={onClose}
            >
              إغلاق
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { PayslipModal }; 
