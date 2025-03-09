
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { EmployeeCard } from './EmployeeCard';
import { MonthYearPicker } from './MonthYearPicker';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

export const EmployeeTab = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [salesInputs, setSalesInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format the selected date for database queries
  const selectedMonth = format(selectedDate, 'yyyy-MM-01');

  // Fetch employees
  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Employee[];
    }
  });

  // Fetch existing sales data for the selected month
  const { data: existingSales, isLoading: loadingSales } = useQuery({
    queryKey: ['employee-sales', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .eq('month', selectedMonth);
      
      if (error) throw error;
      return data;
    }
  });

  // Initialize sales inputs when existing data is loaded
  useEffect(() => {
    if (existingSales && existingSales.length > 0) {
      const newSalesInputs: Record<string, string> = {};
      existingSales.forEach(sale => {
        newSalesInputs[sale.employee_name] = sale.sales_amount.toString();
      });
      setSalesInputs(newSalesInputs);
    } else if (employees) {
      // Initialize with empty values if no existing data
      const newSalesInputs: Record<string, string> = {};
      employees.forEach(employee => {
        newSalesInputs[employee.name] = '';
      });
      setSalesInputs(newSalesInputs);
    }
  }, [existingSales, employees, selectedMonth]);

  const handleSalesChange = (employeeName: string, value: string) => {
    setSalesInputs(prev => ({
      ...prev,
      [employeeName]: value
    }));
  };

  const validateInputs = (): boolean => {
    let isValid = true;
    const newInputs: Record<string, string> = { ...salesInputs };

    Object.keys(newInputs).forEach(name => {
      const value = newInputs[name];
      if (value && isNaN(Number(value))) {
        isValid = false;
        toast({
          title: "Invalid input",
          description: `Sales amount for ${name} must be a number`,
          variant: "destructive"
        });
      }
    });

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create upsert operations for each employee
      const upsertPromises = Object.entries(salesInputs).map(([employeeName, salesAmount]) => {
        // Skip if no sales amount is provided
        if (!salesAmount) return Promise.resolve();
        
        return supabase
          .from('employee_sales')
          .upsert({
            employee_name: employeeName,
            month: selectedMonth,
            sales_amount: Number(salesAmount)
          }, {
            onConflict: 'employee_name,month'
          });
      });
      
      await Promise.all(upsertPromises);
      
      toast({
        title: "Success",
        description: "Employee sales data saved successfully",
      });
    } catch (error) {
      console.error('Error saving employee sales:', error);
      toast({
        title: "Error",
        description: "Failed to save employee sales data",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingEmployees || loadingSales) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center">Loading employee data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Employee Sales
          </h2>
          <p className="text-muted-foreground">
            Record monthly sales for each employee
          </p>
        </div>
        <MonthYearPicker 
          selectedDate={selectedDate} 
          onChange={setSelectedDate} 
        />
      </div>
      
      <Separator className="my-4" />
      
      {employees && employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map(employee => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              salesValue={salesInputs[employee.name] || ''}
              onSalesChange={(value) => handleSalesChange(employee.name, value)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg bg-muted/30">
          <p>No employees found.</p>
        </div>
      )}
      
      <div className="flex justify-end mt-6 sticky bottom-0 bg-background p-4 border-t">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? 'Saving...' : 'Save All Sales Data'}
        </Button>
      </div>
    </div>
  );
};
