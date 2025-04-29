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
        // Filter out sales records where employee_id is null and cast to EmployeeSales[]
        const validSalesData = (data as EmployeeSales[]).filter(
          (sale): sale is EmployeeSales & { employee_id: string } => 
          sale.employee_id !== null && sale.employee_id !== undefined
        );
        
        setExistingSales(validSalesData);
        
        // Store the last updated timestamp from the most recent record
        if (validSalesData.length > 0) {
          // Sort by updated_at in descending order to get the most recent update
          const sortedData = [...validSalesData].sort((a, b) => 
            new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime()
          );
          
          if (sortedData[0].updated_at) {
            setLastUpdated(format(new Date(sortedData[0].updated_at), 'yyyy-MM-dd HH:mm:ss'));
          }
          
          // Then populate sales inputs with existing data where available
          validSalesData.forEach(sale => {
            // We know employee_id exists because of the type guard in filter
            initialSalesInputs[sale.employee_id] = Math.floor(sale.sales_amount).toString();
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
        .filter(([, value]) => value !== '' && !(/^\d+$/.test(value)));
      
      if (invalidEntries.length > 0) {
        throw new Error('Invalid sales amounts detected. Please enter whole numbers only.');
      }
      
      // Filter out empty values and prepare sales data
      const salesDataEntries = Object.entries(salesInputs)
        .filter(([, value]) => value !== '');
      
      if (salesDataEntries.length === 0) {
        throw new Error('No sales data to save. Please enter at least one sales amount.');
      }
      
      // Find existing sales entries by employee_id and month
      const existingEmployeeSalesById = new Map<string, EmployeeSales>();
      
      // Only add sales with valid employee_id to the map
      existingSales.forEach(sale => {
        if (sale.employee_id) {
          existingEmployeeSalesById.set(sale.employee_id, sale);
        }
      });
      
      // Prepare data for upsert (both inserts and updates)
      const upsertData = [];
      
      // Process each sales entry
      for (const [employeeId, salesAmount] of salesDataEntries) {
        const existingSale = existingEmployeeSalesById.get(employeeId);
        
        // Find the employee to get their name
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) continue; // Skip if employee not found
        
        const salesRecord = {
          employee_id: employeeId,
          employee_name: employee.name, // Keep employee_name for backward compatibility
          month: monthString,
          sales_amount: parseInt(salesAmount, 10),
        };

        if (existingSale) {
          // Include id for updates
          upsertData.push({
            id: existingSale.id,
            ...salesRecord
          });
        } else {
          // No id for inserts
          upsertData.push(salesRecord);
        }
      }
      
      console.log('Data to upsert:', upsertData);
      
      // Perform bulk upsert operation
      if (upsertData.length > 0) {
        const { error } = await supabase
          .from('employee_sales')
          .upsert(upsertData, { 
            onConflict: 'id',
            ignoreDuplicates: false // We want to update if there's a conflict
          });
        
        if (error) throw error;
      }
      
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
