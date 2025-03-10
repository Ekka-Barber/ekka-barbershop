
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { Employee, EmployeeSales } from '@/types/employee';

export const useEmployeeSales = (selectedDate: Date, employees: Employee[]) => {
  const [salesInputs, setSalesInputs] = useState<Record<string, string>>({});
  const [existingSales, setExistingSales] = useState<EmployeeSales[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (employees.length > 0) {
      fetchSalesData();
    }
  }, [selectedDate, employees]);

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
      throw error;
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

  const submitSalesData = async () => {
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
      
      // Refresh sales data to show the latest updates
      await fetchSalesData();
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting sales data:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    salesInputs,
    existingSales,
    isSubmitting,
    lastUpdated,
    handleSalesChange,
    submitSalesData
  };
};
