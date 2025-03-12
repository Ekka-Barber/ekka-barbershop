
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MonthYearPicker } from '../MonthYearPicker';
import { LoaderCircle, Save } from 'lucide-react';

interface EmployeeSalesHeaderProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedBranch: string | null;
  setSelectedBranch: (branchId: string) => void;
  branches: Array<{id: string, name: string}>;
  handleSubmit: () => void;
  isSubmitting: boolean;
}

export const EmployeeSalesHeader = ({
  selectedDate,
  setSelectedDate,
  selectedBranch,
  setSelectedBranch,
  branches,
  handleSubmit,
  isSubmitting
}: EmployeeSalesHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
      <div>
        <h2 className="text-2xl font-bold text-primary">Employee Sales</h2>
        <p className="text-muted-foreground">Record monthly sales for each employee</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <Select
          value={selectedBranch || ''}
          onValueChange={setSelectedBranch}
        >
          <SelectTrigger className="w-full sm:w-[180px] border-primary/20 focus:ring-primary/20">
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <MonthYearPicker 
          selectedDate={selectedDate} 
          onChange={setSelectedDate} 
        />
        
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="whitespace-nowrap hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Sales
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
