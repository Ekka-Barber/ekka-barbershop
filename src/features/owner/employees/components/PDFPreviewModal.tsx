import { Download, Eye } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from '@shared/ui/components/dialog';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  selectedMonth: string;
  onDownload: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfBlob,
  selectedMonth,
  onDownload,
}) => {
  const pdfUrl = React.useMemo(
    () => (pdfBlob ? URL.createObjectURL(pdfBlob) : null),
    [pdfBlob]
  );

  const handleOpenInNewTab = React.useCallback(() => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [pdfBlob]);

  // Cleanup blob URL when component unmounts or modal closes
  React.useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            PDF Preview - {selectedMonth ? new Date(selectedMonth).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            }) : 'Current Month'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview and download the monthly PDF report.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* PDF Preview */}
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full min-h-[600px]"
                title="PDF Preview"
              />
            ) : (
              <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Loading PDF preview...</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            {pdfBlob && (
              <Button variant="outline" onClick={handleOpenInNewTab}>
                Open in New Tab
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
            <Button onClick={onDownload} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
