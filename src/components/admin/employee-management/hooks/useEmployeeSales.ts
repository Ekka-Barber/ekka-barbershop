
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { Employee, EmployeeSales } from '@/types/employee';

export const useEmployeeSales = (selectedDate: Date, employees: Employee[]) => {
  const [salesInputs, setSalesInputs] = useState<Record<string, string>>({});
  const [existingSales, setExistingSales] = useState<EmployeeSales[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Reset the form when date or employees change
  useEffect(() => {
    if (employees.length > 0) {
      fetchSalesData();
    } else {
      setSalesInputs({});
      setExistingSales([]);
      setLastUpdated(null);
    }
  }, [selectedDate, employees]);

  const fetchSalesData = async () => {
    try {
      // Format date as YYYY-MM-01 to get the first day of the month
      const monthString = format(selectedDate, 'yyyy-MM-01');
      console.log('Fetching sales data for month:', monthString);
      
      // Fetch sales data for the selected month
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .eq('month', monthString);
      
      if (error) throw error;
      
      console.log('Fetched sales data:', data);
      
      // Initialize sales inputs with existing data
      const initialSalesInputs: Record<string, string> = {};
      
      // First reset inputs for all employees to empty string
      employees.forEach(employee => {
        initialSalesInputs[employee.id] = '';
      });
      
      // Store the fetched sales data
      if (data) {
        setExistingSales(data);
        
        // Store the last updated timestamp from the most recent record
        if (data.length > 0) {
          // Sort by updated_at in descending order to get the most recent update
          const sortedData = [...data].sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
          setLastUpdated(format(new Date(sortedData[0].updated_at), 'yyyy-MM-dd HH:mm:ss'));
          
          // Then populate sales inputs with existing data where available
          data.forEach(sale => {
            // Find the matching employee by ID
            const matchingEmployee = employees.find(emp => emp.id === sale.id);
            if (matchingEmployee) {
              // Ensure we store integers only
              initialSalesInputs[sale.id] = Math.floor(sale.sales_amount).toString();
            }
          });
        } else {
          setLastUpdated(null);
        }
      } else {
        setExistingSales([]);
        setLastUpdated(null);
      }
      
      console.log('Setting initial sales inputs:', initialSalesInputs);
      setSalesInputs(initialSalesInputs);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Still initialize empty inputs for all employees on error
      const emptyInputs: Record<string, string> = {};
      employees.forEach(employee => {
        emptyInputs[employee.id] = '';
      });
      setSalesInputs(emptyInputs);
    }
  };

  const handleSalesChange = (employeeId: string, value: string) => {
    // Only accept whole numbers (no decimals)
    if (value === '' || (/^\d+$/.test(value) && !value.includes('.'))) {
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
        .filter(([_, value]) => value !== '' && !(/^\d+$/.test(value)));
      
      if (invalidEntries.length > 0) {
        throw new Error('Invalid sales amounts detected. Please enter whole numbers only.');
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
            sales_amount: parseInt(salesAmount, 10),
          };
        });
      
      if (salesData.length === 0) {
        throw new Error('No sales data to save. Please enter at least one sales amount.');
      }
      
      console.log('Submitting sales data:', salesData);
      
      // Use upsert instead of delete and insert
      const { error: upsertError } = await supabase
        .from('employee_sales')
        .upsert(salesData, { 
          onConflict: 'id,month',
          ignoreDuplicates: false
        });
      
      if (upsertError) throw upsertError;
      
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
