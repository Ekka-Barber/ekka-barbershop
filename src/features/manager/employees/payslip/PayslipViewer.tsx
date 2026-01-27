import { Download, RefreshCw, FileText, AlertCircle, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useIsMobile } from '@shared/hooks/use-mobile';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/components/button';
import { buttonVariants } from '@shared/ui/components/button-variants';
import { Skeleton } from '@shared/ui/components/skeleton';

import { LazyPDFViewer, LazyPDFDownloadLink, generatePDFBlob } from './LazyPDFWrapper';

import { PayslipViewerProps } from '@/features/manager/types/payslip';
import { mapSalaryToPayslipData } from '@/features/manager/types/payslip';


// Simple Error Boundary component
class PDFErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error, context: string) => void; context: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(
    props: { children: React.ReactNode; onError: (error: Error, context: string) => void; context: string }
  ) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`PDF Error caught in boundary (${this.props.context}):`, error, info);
    this.props.onError(error, this.props.context);
  }

  render() {
    if (this.state.hasError) {
      // The parent component (PayslipViewer) will display the error message based on its own state
      return null; 
    }
    return this.props.children;
  }
}

const PDFViewerWrapper = ({ data, onError }: { data: ReturnType<typeof mapSalaryToPayslipData>; onError: (error: Error, context: string) => void }) => {
  console.log("[PDFViewerWrapper] Rendering with data length:", data ? Object.keys(data).length : 0);
  return (
    <PDFErrorBoundary onError={onError} context="PDFViewerWrapper">
      <LazyPDFViewer data={data} />
    </PDFErrorBoundary>
  );
};

const PayslipViewer: React.FC<PayslipViewerProps> = ({ 
  employeeData, 
  salaryData,
  payPeriod, // Accept payPeriod prop
  onError // Prop for external error handling
}) => {
  // Data validation
  
  const [isClient, setIsClient] = useState(false);
  const [mountPDF, setMountPDF] = useState(true); 
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingBlob, setIsGeneratingBlob] = useState(false);
  const [downloadLinkError, setDownloadLinkError] = useState<Error | null>(null);

  const payslipDataRef = useRef<ReturnType<typeof mapSalaryToPayslipData> | null>(null);
  const isMobile = useIsMobile();
  const uniquePdfKeyRef = useRef(Date.now()); // Used to force re-render of PDF components

  const getCurrentPayPeriod = useCallback((): string => {
    // Use provided payPeriod if available, otherwise fall back to current date
    if (payPeriod) {
      console.log("[PayslipViewer] Using provided payPeriod:", payPeriod);
      return payPeriod;
    }
    
    console.log("[PayslipViewer] No payPeriod provided, falling back to current date");
    const date = new Date();
    // Use Arabic locale with Gregorian calendar for consistency
    return new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: 'long',
      calendar: 'gregory'
    }).format(date);
  }, [payPeriod]);

  // Memoize payslipData to prevent unnecessary recalculations unless inputs change
  useEffect(() => {
    payslipDataRef.current = mapSalaryToPayslipData(
      employeeData,
      salaryData,
      getCurrentPayPeriod()
    );
    // Update payslip data reference
    uniquePdfKeyRef.current = Date.now(); // Change key to force re-render of PDF components
    setRenderError(null); // Clear previous errors on data change
    setPdfBlob(null); // Clear old blob
    setMountPDF(true); // Attempt to mount PDF viewer with new data
  }, [employeeData, salaryData, payPeriod, getCurrentPayPeriod]); // Add payPeriod to dependencies

  useEffect(() => {
    setIsClient(true);
    console.log("[PayslipViewer] Component mounted, isClient set to true.");
    console.log("[PayslipViewer] Browser info:", {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      pdfViewerEnabled: navigator.pdfViewerEnabled,
    });

    // Font check removed for lazy loading - will be checked when PDF components load
    console.log("[PayslipViewer] Font check deferred for lazy loading.");

    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        console.log('[PayslipViewer] All browser document fonts loaded and ready');
        const fontAvailable = document.fonts.check('12px "IBM Plex Sans Arabic"');
        console.log('[PayslipViewer] Browser check for "IBM Plex Sans Arabic" available:', fontAvailable);
      }).catch(err => console.error('[PayslipViewer] Error with document.fonts.ready:', err));
    } else {
      console.warn('[PayslipViewer] document.fonts API not available.');
    }
  }, []);

  const internalHandleError = (error: Error, context: string) => {
    console.error(`[PayslipViewer] Internal error caught from ${context}:`, error);
    setRenderError(error);
    setMountPDF(false); 
    if (onError) {
      console.log("[PayslipViewer] Calling external onError callback.");
      onError(error); 
    }
  };
  
  const generatePdfBlob = async (context: string): Promise<Blob | null> => {
    if (!payslipDataRef.current) {
      console.error(`[PayslipViewer] Cannot generate PDF blob, payslipData is null. Context: ${context}`);
      internalHandleError(new Error("Payslip data is not available for PDF generation."), `generatePdfBlob (${context}) - data missing`);
      return null;
    }
    console.log(`[PayslipViewer] Attempting to generate PDF blob. Context: ${context}`);
    setIsGeneratingBlob(true);
    setRenderError(null); 
    try {
      const blob = await generatePDFBlob(payslipDataRef.current);
      console.log(`[PayslipViewer] PDF blob generated successfully. Context: ${context}. Size:`, blob.size);
      setPdfBlob(blob);
      setIsGeneratingBlob(false);
      return blob;
    } catch (error) {
      console.error(`[PayslipViewer] Error generating PDF blob. Context: ${context}:`, error);
      internalHandleError(error instanceof Error ? error : new Error(String(error)), `generatePdfBlob (${context})`);
      setIsGeneratingBlob(false);
      return null;
    }
  };

  const handleForceRefresh = () => {
    console.log("[PayslipViewer] Force refreshing PDF viewer manually.");
    uniquePdfKeyRef.current = Date.now();
    setRenderError(null);
    setPdfBlob(null);
    setIsGeneratingBlob(false);
    setDownloadLinkError(null);
    // Ensure PDFViewer attempts to re-render
    setMountPDF(false); 
    setTimeout(() => setMountPDF(true), 50);
  };

  if (!isClient || !payslipDataRef.current) {
    console.log("[PayslipViewer] Not client-side, or payslipData not ready. Showing skeleton.");
    return (
      <div className="w-full min-h-[75vh] flex flex-col space-y-4 p-4">
        <Skeleton className="h-10 w-1/4 self-end" />
        <Skeleton className="flex-1 w-full" />
      </div>
    );
  }

  const currentPayslipData = payslipDataRef.current;

  const MobilePayslipView = () => (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">كشف الراتب</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleForceRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
        
        {pdfBlob && !renderError ? (
          <a
            href={URL.createObjectURL(pdfBlob)}
            download={`${currentPayslipData.employee.nameAr}_${currentPayslipData.payPeriod}_Payslip.pdf`}
            className={cn(buttonVariants({ variant: 'outline' }), "w-full flex items-center justify-center gap-2")}
          >
            <Download className="h-4 w-4" />
            تحميل كشف الراتب (مُنشأ)
          </a>
        ) : (
          <Button 
            onClick={() => generatePdfBlob('MobileDownloadClick')}
            disabled={isGeneratingBlob}
            className="w-full flex items-center justify-center gap-2"
          >
            {isGeneratingBlob ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isGeneratingBlob ? 'جاري إنشاء الملف...' : 'إنشاء وتحميل كشف الراتب'}
          </Button>
        )}

        {(renderError || downloadLinkError) && (
          <div className="text-red-500 p-3 bg-red-100 border border-red-500 rounded-md flex items-center gap-2 mt-2">
            <AlertCircle className="h-5 w-5" />
            <span>{(renderError || downloadLinkError)?.message || 'حدث خطأ أثناء إنشاء كشف الراتب. يرجى المحاولة مرة أخرى.'}</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-2">
          إذا لم يبدأ التنزيل، حاول تحديث العارض أو استخدم زر الإنشاء.
        </p>
      </div>
    </div>
  );

  const DesktopPayslipView = () => (
    <div className="flex flex-col space-y-6 min-h-[85vh]">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-semibold">عرض كشف الراتب</h2>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleForceRefresh}
            disabled={isGeneratingBlob}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث العارض
          </Button>
          <LazyPDFDownloadLink
            key={`download-link-${uniquePdfKeyRef.current}`}
            data={currentPayslipData}
            fileName={`${currentPayslipData.employee.nameAr}_${currentPayslipData.payPeriod}_Payslip.pdf`}
            className={cn(buttonVariants({variant: 'default'}), "flex items-center gap-2")}
            onClick={() => {
                console.log("[PayslipViewer] PDFDownloadLink clicked.");
                setDownloadLinkError(null); // Clear previous errors before attempting new download
            }}
          >
            {({ loading, error }) => {
              if (error && !downloadLinkError) { // Avoid state update loop
                console.error("[PayslipViewer] PDFDownloadLink error state:", error);
                // Use a timeout to prevent React state update errors during render
                setTimeout(() => setDownloadLinkError(error instanceof Error ? error : new Error(String(error))),0);
              }
              if (loading || isGeneratingBlob) {
                return (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> جاري التحضير...
                  </>
                );
              }
              if (downloadLinkError) {
                 return (
                  <>
                    <AlertCircle className="h-4 w-4" /> خطأ بالتحميل
                  </>
                );               
              }
              return (
                <>
                  <Download className="h-4 w-4" /> تحميل PDF
                </>
              );
            }}
           </LazyPDFDownloadLink>
        </div>
      </div>

      {(renderError || downloadLinkError) && (
        <div className="text-red-600 p-4 bg-red-100 border border-red-600 rounded-md flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8" />
          <p className="font-semibold text-lg">حدث خطأ أثناء عرض أو إنشاء كشف الراتب.</p>
          <p className="text-sm">الرسالة: {(renderError || downloadLinkError)?.message}</p>
          <p className="text-xs text-muted-foreground mt-1">الرجاء محاولة تحديث العارض. إذا استمرت المشكلة، قد تكون هناك مشكلة في بيانات الكشف أو إعدادات الخطوط.</p>
          <pre className="mt-2 p-2 bg-red-50 text-xs text-left w-full max-h-32 overflow-auto rounded border text-red-800">
            {(renderError || downloadLinkError)?.stack}
          </pre>
        </div>
      )}

      {!renderError && !downloadLinkError && mountPDF && (
        <div key={uniquePdfKeyRef.current} className="flex-1 h-[75vh] w-full">
          <PDFViewerWrapper data={currentPayslipData} onError={internalHandleError} />
        </div>
      )}
       {(!renderError && !downloadLinkError && !mountPDF) && (
        <div className="flex-1 h-[75vh] w-full flex flex-col items-center justify-center bg-gray-50 rounded-md border p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500">عارض PDF غير مُحمّل حاليًا.</p>
            <p className="text-sm text-gray-400 mt-1">قد يكون هذا بسبب خطأ سابق أو تحديث يدوي.</p>
            <Button onClick={handleForceRefresh} className="mt-6" size="sm" variant="outline">محاولة تحميل العارض</Button>
        </div>
      )}
    </div>
  );

  return isMobile ? <MobilePayslipView /> : <DesktopPayslipView />;
};

export default PayslipViewer; 
