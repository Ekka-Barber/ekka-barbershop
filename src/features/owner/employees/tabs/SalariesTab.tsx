import { SalaryCalculation } from '@shared/types/business';
import {
  EmployeeDeduction,
  EmployeeLoan,
  EmployeeBonus,
} from '@shared/types/domains';

import { PDFPreviewModal } from '../components/PDFPreviewModal';
import { SalaryCalculationCards } from '../components/SalaryCalculationCards';

import { SalariesTabButtons } from './SalariesTabButtons';
import { SalariesTabHeader } from './SalariesTabHeader';

import { useSalariesTab } from '@/features/owner/employees/hooks/useSalariesTab';

interface SalariesTabProps {
  calculations: SalaryCalculation[];
  onCalculate: () => void;
  selectedMonth: string;
  monthlyDeductions: EmployeeDeduction[];
  monthlyLoans: EmployeeLoan[];
  monthlyBonuses: EmployeeBonus[];
  employees?: Array<{
    id: string;
    name: string;
    name_ar?: string | null;
    branches?: { id: string; name: string; name_ar?: string | null } | null;
    sponsor_id?: string | null;
    sponsors?: { name_ar?: string | null } | null;
  }>;
  // sponsors table only has name_ar, not name
  sponsors?: Array<{ id: string; name_ar: string }> | null;
  isSponsorsLoading?: boolean;
}

export const SalariesTab = ({
  calculations,
  onCalculate,
  selectedMonth,
  monthlyDeductions = [],
  monthlyLoans = [],
  monthlyBonuses = [],
  employees = [],
  sponsors,
  isSponsorsLoading = false,
}: SalariesTabProps) => {
  // Transform employees to convert null values to undefined for type compatibility
  const transformedEmployees = employees?.map(emp => ({
    ...emp,
    name_ar: emp.name_ar ?? undefined,
    branches: emp.branches ? {
      ...emp.branches,
      name_ar: emp.branches.name_ar ?? undefined,
    } : null,
    sponsors: emp.sponsors ? {
      name_ar: emp.sponsors.name_ar ?? undefined,
    } : null,
  }));

  const {
    isCalculating,
    isRecalculating,
    isPreviewOpen,
    pdfBlob,
    isGeneratingPDF,
    isGeneratingGrossPDF,
    handleCalculate,
    handleRecalculate,
    handlePreviewPDF,
    handlePreviewGrossPDF,
    handleDownloadPDF,
    handleClosePreview,
  } = useSalariesTab({
    calculations,
    selectedMonth,
    employees,
    sponsors,
    isSponsorsLoading,
    onCalculate,
  });

  return (
    <div className="space-y-6">
      <SalariesTabHeader
        selectedMonth={selectedMonth}
        calculations={calculations}
      />

      <SalariesTabButtons
        calculations={calculations}
        isCalculating={isCalculating}
        isRecalculating={isRecalculating}
        onCalculate={handleCalculate}
        onRecalculate={handleRecalculate}
        onPreviewPDF={handlePreviewPDF}
        onPreviewGrossPDF={handlePreviewGrossPDF}
        isPreviewLoading={isGeneratingPDF}
        isGrossPreviewLoading={isGeneratingGrossPDF}
        isPreviewDisabled={isSponsorsLoading}
      />

      <SalaryCalculationCards
        calculations={calculations}
        selectedMonth={selectedMonth}
        monthlyDeductions={monthlyDeductions}
        monthlyLoans={monthlyLoans}
        monthlyBonuses={monthlyBonuses}
        employees={transformedEmployees}
      />

      <PDFPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        pdfBlob={pdfBlob}
        selectedMonth={selectedMonth}
        onDownload={handleDownloadPDF}
      />
    </div>
  );
};
