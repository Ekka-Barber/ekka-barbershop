
import { useState, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthYearPicker } from './MonthYearPicker';
import { EmployeeCard } from './EmployeeCard';
import { Employee, EmployeeSales } from '@/types/employee';
import { LoaderCircle } from 'lucide-react';

export const EmployeeTab = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesInputs, setSalesInputs] = useState<Record<string, string>>({});
  const [existingSales, setExistingSales] = useState<EmployeeSales[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      fetchSalesData();
    }
  }, [selectedDate, employees]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('employees').select('*');
      
      if (error) throw error;
      
      // Explicitly cast the data to Employee[] type
      setEmployees(data as unknown as Employee[]);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const monthString = format(selectedDate, 'yyyy-MM-01');
      
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .eq('month', monthString);
      
      if (error) throw error;
      
      setExistingSales(data);
      
      // Initialize sales inputs with existing data
      const initialSalesInputs: Record<string, string> = {};
      employees.forEach(employee => {
        const existingSale = data.find(sale => sale.id === employee.id);
        initialSalesInputs[employee.id] = existingSale ? existingSale.sales_amount.toString() : '';
      });
      
      setSalesInputs(initialSalesInputs);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive",
      });
    }
  };

  const handleSalesChange = (employeeId: string, value: string) => {
    setSalesInputs(prev => ({
      ...prev,
      [employeeId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const monthString = format(selectedDate, 'yyyy-MM-01');
      
      // Prepare sales data for submission
      const salesData = Object.entries(salesInputs)
        .filter(([_, value]) => value !== '') // Filter out empty values
        .map(([employeeId, salesAmount]) => {
          const employee = employees.find(e => e.id === employeeId);
          return {
            id: employeeId,
            employee_name: employee?.name || 'Unknown',
            month: monthString,
            sales_amount: parseFloat(salesAmount),
          };
        });
      
      // Upsert sales data to the database
      const { error } = await supabase
        .from('employee_sales')
        .upsert(salesData, { onConflict: 'id,month' });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Employee sales data saved successfully",
      });
      
      // Refresh sales data
      fetchSalesData();
    } catch (error) {
      console.error('Error submitting sales data:', error);
      toast({
        title: "Error",
        description: "Failed to save sales data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Employee Sales</h2>
          <p className="text-muted-foreground">Record monthly sales for each employee</p>
        </div>
        
        <div className="flex items-center gap-2">
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
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No employees found. Add employees to record sales.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(employee => (
            <EmployeeCard 
              key={employee.id}
              employee={employee}
              salesValue={salesInputs[employee.id] || ''}
              onSalesChange={(value) => handleSalesChange(employee.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
