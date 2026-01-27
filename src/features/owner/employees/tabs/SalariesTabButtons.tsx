import { RefreshCw, Calculator, Loader2, Eye } from 'lucide-react';

import { SalaryCalculation } from '@shared/types/business';
import { Button } from '@shared/ui/components/button';

interface SalariesTabButtonsProps {
  calculations: SalaryCalculation[];
  isCalculating: boolean;
  isRecalculating: boolean;
  onCalculate: () => void;
  onRecalculate: () => void;
  onPreviewPDF?: () => void;
  onPreviewGrossPDF?: () => void;
  isPreviewLoading?: boolean;
  isGrossPreviewLoading?: boolean;
  isPreviewDisabled?: boolean;
}

export const SalariesTabButtons = ({
  calculations,
  isCalculating,
  isRecalculating,
  onCalculate,
  onRecalculate,
  onPreviewPDF,
  onPreviewGrossPDF,
  isPreviewLoading = false,
  isGrossPreviewLoading = false,
  isPreviewDisabled = false,
}: SalariesTabButtonsProps) => (
  <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={onCalculate}
        className="w-full sm:w-auto"
        variant="outline"
        disabled={isCalculating || isRecalculating}
      >
        {isCalculating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Salaries
          </>
        )}
      </Button>
      {calculations.length > 0 && (
        <Button
          onClick={onRecalculate}
          disabled={isRecalculating || isCalculating}
          className="w-full sm:w-auto bg-success text-success-foreground hover:bg-success/90 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`}
          />
          {isRecalculating ? 'Recalculating...' : 'Recalculate'}
        </Button>
      )}
    </div>

    {calculations.length > 0 && (
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onPreviewPDF}
          disabled={isPreviewLoading || isGrossPreviewLoading || isPreviewDisabled}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {isPreviewLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Preview PDF
            </>
          )}
        </Button>
        <Button
          onClick={onPreviewGrossPDF}
          disabled={isGrossPreviewLoading || isPreviewLoading || isPreviewDisabled}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {isGrossPreviewLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Preview Gross PDF
            </>
          )}
        </Button>
      </div>
    )}
  </div>
);
