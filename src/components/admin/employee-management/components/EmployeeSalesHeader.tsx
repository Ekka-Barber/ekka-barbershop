import { Button } from "@/components/ui/button";
import { MonthYearPicker } from '../MonthYearPicker';
import { LoaderCircle, Save } from 'lucide-react';

interface EmployeeSalesHeaderProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
}

export const EmployeeSalesHeader = ({
  selectedDate,
  setSelectedDate,
  handleSubmit,
  isSubmitting
}: EmployeeSalesHeaderProps) => {
  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Employee Sales</h2>
          <p className="text-muted-foreground">Record monthly sales for each employee</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <MonthYearPicker 
            selectedDate={selectedDate} 
            onChange={setSelectedDate} 
          />
          {/* Desktop save button */}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="whitespace-nowrap hidden sm:flex"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Sales'}
          </Button>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg sm:hidden flex items-center justify-center"
        size="icon"
        aria-label="Save Sales"
      >
        {isSubmitting ? (
          <LoaderCircle className="h-6 w-6 animate-spin" />
        ) : (
          <Save className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};
