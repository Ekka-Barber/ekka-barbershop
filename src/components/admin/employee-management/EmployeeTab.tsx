
import { useState, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthYearPicker } from './MonthYearPicker';
import { EmployeeCard } from './EmployeeCard';
import { Employee, EmployeeSales } from '@/types/employee';
import { LoaderCircle, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const EmployeeTab = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesInputs, setSalesInputs] = useState<Record<string, string>>({});
  const [existingSales, setExistingSales] = useState<EmployeeSales[]>([]);
  const [branches, setBranches] = useState<Array<{id: string, name: string}>>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchEmployees();
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (employees.length > 0) {
      fetchSalesData();
    }
  }, [selectedDate, employees]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase.from('branches').select('id, name');
      
      if (error) throw error;
      
      setBranches(data || []);
      
      // Set first branch as default if any branches exist
      if (data && data.length > 0) {
        setSelectedBranch(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase.from('employees').select('*');
      
      // Add branch filter if a branch is selected
      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }
      
      const { data, error } = await query;
      
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
      // Format date as YYYY-MM-01 to get the first day of the month
      const monthString = format(selectedDate, 'yyyy-MM-01');
      
      // Fetch sales data for the selected month
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .eq('month', monthString);
      
      if (error) throw error;
      
      // Store the fetched sales data
      setExistingSales(data);
      
      // Store the last updated timestamp from the most recent record
      if (data && data.length > 0) {
        // Sort by updated_at in descending order to get the most recent update
        const sortedData = [...data].sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setLastUpdated(format(new Date(sortedData[0].updated_at), 'yyyy-MM-dd HH:mm:ss'));
      } else {
        setLastUpdated(null);
      }
      
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
    // Validate that the input is a valid number
    if (value === '' || !isNaN(Number(value))) {
      setSalesInputs(prev => ({
        ...prev,
        [employeeId]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Format date as YYYY-MM-01 to get the first day of the month
      const monthString = format(selectedDate, 'yyyy-MM-01');
      
      // Validate sales data
      const invalidEntries = Object.entries(salesInputs)
        .filter(([_, value]) => value !== '' && (isNaN(Number(value)) || Number(value) < 0));
      
      if (invalidEntries.length > 0) {
        throw new Error('Invalid sales amounts detected. Please enter valid numbers.');
      }
      
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
      
      if (salesData.length === 0) {
        throw new Error('No sales data to save. Please enter at least one sales amount.');
      }
      
      // Upsert sales data to the database using the composite key of id and month
      const { error } = await supabase
        .from('employee_sales')
        .upsert(salesData, { 
          onConflict: 'id,month', // Use both id and month as the composite key
          ignoreDuplicates: false // Update if there's a conflict
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Employee sales data saved successfully",
      });
      
      // Refresh sales data to show the latest updates
      fetchSalesData();
    } catch (error: any) {
      console.error('Error submitting sales data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save sales data",
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
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Select
            value={selectedBranch || ''}
            onValueChange={setSelectedBranch}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
      
      {lastUpdated && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {selectedBranch 
                ? "No employees found for the selected branch. Add employees to record sales." 
                : "No employees found. Please select a branch or add employees to record sales."}
            </p>
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
