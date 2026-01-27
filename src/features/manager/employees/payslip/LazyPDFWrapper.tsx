import { Download, AlertCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { payslipPDFGenerator } from '@shared/lib/pdf/payslip-pdf-generator';
import { Button } from '@shared/ui/components/button';
import { Skeleton } from '@shared/ui/components/skeleton';

import type { PayslipData } from '@/features/manager/types/payslip';

/* eslint-disable react-refresh/only-export-components */

interface LazyPDFViewerProps {
  data: PayslipData;
}

interface LazyPDFDownloadLinkProps {
  data: PayslipData;
  fileName: string;
  className?: string;
  children: (props: { loading: boolean; error?: Error }) => React.ReactNode;
  onClick?: () => void;
}

export const LazyPDFViewer: React.FC<LazyPDFViewerProps> = ({ data }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let mounted = true;

    const generateAndDisplayPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Generate PDF blob
        const blob = await payslipPDFGenerator.generatePayslipPDFBlob(data);
        
        if (!mounted) return;
        
        // Create object URL for the blob
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to generate PDF:', err);
        setError(err instanceof Error ? err : new Error('Failed to generate PDF'));
        setLoading(false);
      }
    };

    generateAndDisplayPDF();

    return () => {
      mounted = false;
      // Clean up object URL when component unmounts
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [data]);

  if (loading) {
    return <Skeleton className="w-full h-[75vh]" />;
  }

  if (error) {
    return (
      <div className="w-full h-[75vh] border rounded-md shadow-sm flex flex-col items-center justify-center gap-4 bg-red-50/50 p-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <p className="text-lg font-semibold text-red-800">Failed to load PDF</p>
          <p className="text-sm text-red-600 mt-2">{error.message}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <iframe
          ref={iframeRef}
          src={pdfUrl ? `${pdfUrl}#toolbar=1&navpanes=1` : undefined}
          width="100%"
          height="100%"
          className="border rounded-md shadow-sm"
          style={{ minHeight: '75vh' }}
          title="Payslip PDF"
        />
      </div>
    </div>
  );
};

export const LazyPDFDownloadLink: React.FC<LazyPDFDownloadLinkProps> = ({
  data,
  fileName,
  className,
  children,
  onClick,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    
    try {
      setLoading(true);
      setError(undefined);
      await payslipPDFGenerator.generatePayslipPDF(data, fileName);
    } catch (err) {
      console.error('Failed to generate/download PDF:', err);
      setError(err instanceof Error ? err : new Error('Failed to generate PDF'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      disabled={loading}
      type="button"
    >
      {children({ loading, error })}
    </button>
  );
};

// Utility function to generate PDF blob
export const generatePDFBlob = async (data: PayslipData): Promise<Blob> => {
  return await payslipPDFGenerator.generatePayslipPDFBlob(data);
};

// Utility function for preview (lower quality, faster)
export const generatePDFPreviewBlob = async (data: PayslipData): Promise<Blob> => {
  // For now, use the same as full quality
  // In future, we could implement a lower quality preview
  return await payslipPDFGenerator.generatePayslipPDFBlob(data);
};

// Simple download button component for convenience
interface PDFDownloadButtonProps {
  data: PayslipData;
  fileName?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  data,
  fileName,
  variant = 'default',
  size = 'default',
  className,
  icon = <Download className="h-4 w-4" />,
  children = 'Download Payslip',
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      await payslipPDFGenerator.generatePayslipPDF(data, fileName);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Generating...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );
};