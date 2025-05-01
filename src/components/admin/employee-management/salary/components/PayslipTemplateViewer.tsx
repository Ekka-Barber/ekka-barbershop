import React, { useState, useEffect, useRef } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { PayslipDocument } from './PayslipDocument';
import { PayslipData } from '../../../../../types/payslip';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PayslipTemplateViewerProps {
  payslipData: PayslipData;
}

// Simple Error Boundary component
class PDFErrorBoundary extends React.Component<{children: React.ReactNode, onError: () => void}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode, onError: () => void}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const PDFViewerWrapper = ({ data, onError }: { data: PayslipData; onError: () => void }) => {
  return (
    <PDFErrorBoundary onError={onError}>
      <PDFViewer
        width="100%"
        height="100%"
        className="border rounded-md shadow-sm"
        style={{ minHeight: '75vh' }}
      >
        <PayslipDocument data={data} />
      </PDFViewer>
    </PDFErrorBoundary>
  );
};

export const PayslipTemplateViewer: React.FC<PayslipTemplateViewerProps> = ({ payslipData }) => {
  const [isClient, setIsClient] = useState(false);
  const [mountPDF, setMountPDF] = useState(true);
  const [renderError, setRenderError] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const mountCountRef = useRef(0);
  const isMobile = useIsMobile();

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset PDF viewer when payslip data changes
  useEffect(() => {
    if (isClient) {
      // Cleanup function
      const cleanup = () => {
        if (pdfBlob) {
          URL.revokeObjectURL(URL.createObjectURL(pdfBlob));
          setPdfBlob(null);
        }
      };

      // Force remount PDF viewer
      setMountPDF(false);
      setRenderError(false);
      cleanup();

      const timer = setTimeout(() => {
        mountCountRef.current += 1;
        setMountPDF(true);
      }, 100);

      return () => {
        clearTimeout(timer);
        cleanup();
      };
    }
  }, [payslipData, isClient]);

  // Handle error case
  const handleRenderError = () => {
    setRenderError(true);
    setMountPDF(false);
    console.error("Error rendering PDF");
  };

  // Force refresh the component
  const handleForceRefresh = () => {
    mountCountRef.current += 1;
    setMountPDF(false);
    setRenderError(false);
    
    if (pdfBlob) {
      URL.revokeObjectURL(URL.createObjectURL(pdfBlob));
      setPdfBlob(null);
    }

    setTimeout(() => {
      setMountPDF(true);
    }, 100);
  };

  if (!isClient) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col space-y-4 p-4">
        <Skeleton className="h-10 w-1/4 self-end" />
        <Skeleton className="flex-1 w-full" />
      </div>
    );
  }

  const MobilePayslipView = () => (
    <div className="flex flex-col space-y-4 p-4 min-h-[75vh]">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Payslip Preview</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleForceRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <PDFDownloadLink
          key={`download-${mountCountRef.current}`}
          document={<PayslipDocument data={payslipData} />}
          fileName={`payslip-${payslipData.employee.nameAr}-${payslipData.payPeriod}.pdf`}
          className="w-full"
        >
          {({ loading, url }) => {
            if (url && !pdfBlob) {
              fetch(url)
                .then(res => res.blob())
                .then(blob => {
                  if (pdfBlob) {
                    URL.revokeObjectURL(URL.createObjectURL(pdfBlob));
                  }
                  setPdfBlob(blob);
                })
                .catch(console.error);
            }
            return (
              <Button 
                variant="default" 
                disabled={loading} 
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {loading ? 'جار التحميل...' : 'تحميل PDF'}
              </Button>
            );
          }}
        </PDFDownloadLink>

        {pdfBlob && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const url = URL.createObjectURL(pdfBlob);
              window.open(url, '_blank');
              URL.revokeObjectURL(url);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Open PDF in Browser
          </Button>
        )}
      </div>
    </div>
  );

  const DesktopPayslipView = () => (
    <div className="flex flex-col space-y-4 min-h-[75vh] w-full">
      <div className="flex justify-between items-center px-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleForceRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh PDF
        </Button>
        
        {mountPDF && !renderError && (
          <PDFDownloadLink
            key={`download-${mountCountRef.current}`}
            document={<PayslipDocument data={payslipData} />}
            fileName={`payslip-${payslipData.employee.nameAr}-${payslipData.payPeriod}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                {loading ? 'جار التحميل...' : 'تحميل PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </div>
      
      <div className="flex-1 min-h-[calc(75vh-4rem)]">
        {mountPDF ? (
          <div key={mountCountRef.current} className="h-full">
            <PDFViewerWrapper 
              data={payslipData}
              onError={handleRenderError}
            />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center border rounded-md bg-gray-50">
            {renderError ? (
              <div className="text-center p-6">
                <p className="text-red-500 mb-2">Failed to render PDF</p>
                <Button onClick={handleForceRefresh} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </div>
        )}
      </div>
    </div>
  );

  return isMobile ? <MobilePayslipView /> : <DesktopPayslipView />;
};

export default PayslipTemplateViewer; 