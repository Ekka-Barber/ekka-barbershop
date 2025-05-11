import { Button } from "@/components/ui/button";
import { MonthYearPicker } from '../MonthYearPicker';
import { LoaderCircle } from 'lucide-react';

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
    <div className="space-y-4">
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
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="whitespace-nowrap"
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
    </div>
  );
};
