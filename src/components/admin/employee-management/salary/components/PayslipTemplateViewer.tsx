import React, { useState, useEffect } from 'react';
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

export const PayslipTemplateViewer: React.FC<PayslipTemplateViewerProps> = ({ payslipData }) => {
  const [isClient, setIsClient] = useState(false);
  const [key, setKey] = useState(Date.now());
  const [showPDF, setShowPDF] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const isMobile = useIsMobile();

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Force remount PDF when payslip data changes
  useEffect(() => {
    if (isClient) {
      setShowPDF(false);
      setRenderError(false);
      setPdfBlob(null);
      
      // Use timeout to ensure clean unmounting before remounting
      const timer = setTimeout(() => {
        setKey(Date.now());
        setShowPDF(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [payslipData, isClient]);

  // Handle error case
  const handleRenderError = () => {
    setRenderError(true);
    console.error("Error rendering PDF");
  };

  // Force refresh the component
  const handleForceRefresh = () => {
    setShowPDF(false);
    setRenderError(false);
    setPdfBlob(null);
    setTimeout(() => {
      setKey(Date.now());
      setShowPDF(true);
    }, 300);
  };

  if (!isClient) {
    return (
      <div className="w-full h-[70vh] flex flex-col space-y-4 p-4">
         <Skeleton className="h-10 w-1/4 self-end" />
         <Skeleton className="h-full w-full" />
      </div>
    );
  }

  // Create a unique ID for this payslip
  const payslipId = `${payslipData.employee.nameAr}-${payslipData.payPeriod}-${key}`;

  const MobilePayslipView = () => (
    <div className="flex flex-col space-y-4 p-4">
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
          key={`download-${payslipId}`}
          document={<PayslipDocument data={payslipData} />}
          fileName={`payslip-${payslipData.employee.nameAr}-${payslipData.payPeriod}.pdf`}
          className="w-full"
        >
          {({ loading, url }) => {
            if (url && !pdfBlob) {
              // Store the blob URL for viewing
              fetch(url)
                .then(res => res.blob())
                .then(blob => setPdfBlob(blob))
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
    <div className="w-full h-[70vh] flex flex-col space-y-4">
      <div className="flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleForceRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh PDF
        </Button>
        
        {showPDF && !renderError && (
          <PDFDownloadLink
            key={`download-${payslipId}`}
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
      
      {showPDF && !renderError ? (
        <PDFErrorBoundary onError={handleRenderError}>
          <PDFViewer
            key={`viewer-${payslipId}`}
            width="100%"
            height="100%"
            className="border rounded-md"
          >
            <PayslipDocument data={payslipData} />
          </PDFViewer>
        </PDFErrorBoundary>
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
            <Skeleton className="h-4/5 w-4/5" />
          )}
        </div>
      )}
    </div>
  );

  return isMobile ? <MobilePayslipView /> : <DesktopPayslipView />;
};

export default PayslipTemplateViewer; 