import { useState, useCallback } from 'react';

import { useToast } from '@shared/hooks/use-toast';
import { SalaryCalculation } from '@shared/types/business';

import { useSalaryPDFGenerator } from '@/features/owner/employees/hooks/useSalaryPDFGenerator';

// Constants for UI behavior
const CALCULATION_BUTTON_TIMEOUT_MS = 500;

interface UseSalariesTabProps {
  calculations: SalaryCalculation[];
  selectedMonth: string;
  employees?: Array<{
    id: string;
    name: string;
    name_ar?: string | undefined;
    branches?: { name: string; name_ar?: string | undefined } | null;
    sponsor_id?: string | null;
    sponsors?: { name_ar?: string | undefined } | null;
  }>;
  sponsors?: Array<{ id: string; name_ar: string } | null> | undefined;
  isSponsorsLoading?: boolean;
  onCalculate: () => void;
  onRecalculate?: () => void;
}

export const useSalariesTab = ({
  calculations,
  selectedMonth,
  employees = [],
  sponsors = [],
  isSponsorsLoading = false,
  onCalculate,
  onRecalculate,
}: UseSalariesTabProps) => {
  // Use onRecalculate if provided, otherwise fall back to onCalculate
  const effectiveOnRecalculate = onRecalculate || onCalculate;
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGrossPreview, setIsGrossPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingGrossPDF, setIsGeneratingGrossPDF] = useState(false);

  const { toast } = useToast();
  const { generatePDF, generateGrossPDF, generatePDFBlob, generateGrossPDFBlob } = useSalaryPDFGenerator();

  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    try {
      await onCalculate();
    } finally {
      setTimeout(() => setIsCalculating(false), CALCULATION_BUTTON_TIMEOUT_MS);
    }
  }, [onCalculate]);

  const handleRecalculate = useCallback(async () => {
    setIsRecalculating(true);
    try {
      await effectiveOnRecalculate();
    } finally {
      setTimeout(() => setIsRecalculating(false), CALCULATION_BUTTON_TIMEOUT_MS);
    }
  }, [effectiveOnRecalculate]);

  const handlePreviewPDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true);
      setIsGrossPreview(false);
      const blob = await generatePDFBlob(calculations, selectedMonth, employees);
      setPdfBlob(blob);
      setIsPreviewOpen(true);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate PDF preview. Please try again.',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [calculations, selectedMonth, employees, generatePDFBlob, toast]);

  const handlePreviewGrossPDF = useCallback(async () => {
    if (isSponsorsLoading) {
      toast({
        variant: 'destructive',
        title: 'Please wait',
        description: 'Sponsors are still loading. Try again in a moment.',
      });
      return;
    }

    try {
      setIsGeneratingGrossPDF(true);
      setIsGrossPreview(true);
      const blob = await generateGrossPDFBlob(calculations, selectedMonth, employees, sponsors);
      setPdfBlob(blob);
      setIsPreviewOpen(true);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate gross salary PDF preview. Please try again.',
      });
    } finally {
      setIsGeneratingGrossPDF(false);
    }
  }, [calculations, selectedMonth, employees, sponsors, generateGrossPDFBlob, toast, isSponsorsLoading]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      if (isGrossPreview) {
        await generateGrossPDF(calculations, selectedMonth, employees, sponsors);
      } else {
        await generatePDF(calculations, selectedMonth, employees);
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download PDF. Please try again.',
      });
    }
  }, [calculations, selectedMonth, employees, sponsors, generateGrossPDF, generatePDF, toast, isGrossPreview]);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setPdfBlob(null);
    setIsGrossPreview(false);
  }, []);

  return {
    // State
    isCalculating,
    isRecalculating,
    isPreviewOpen,
    pdfBlob,
    isGeneratingPDF,
    isGeneratingGrossPDF,

    // Handlers
    handleCalculate,
    handleRecalculate,
    handlePreviewPDF,
    handlePreviewGrossPDF,
    handleDownloadPDF,
    handleClosePreview,
  };
};
