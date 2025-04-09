
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, isAfter } from 'date-fns';

// Types
import { Employee, EmployeeSales } from '@/types/employee';

export type MetricType = 'sales' | 'appointments' | 'revenue';
export type PeriodType = '1' | '3' | '6' | '12';

export interface EmployeePerformance {
  id: string;
  name: string;
  photoUrl?: string;
  metrics: {
    sales: number;
    appointments: number;
    revenue: number;
  };
}

export interface UseTeamPerformanceDataProps {
  employees: Employee[];
  selectedBranch: string | null;
  selectedMetric: MetricType;
  selectedPeriod: PeriodType;
}

export const useTeamPerformanceData = ({
  employees,
  selectedBranch,
  selectedMetric,
  selectedPeriod
}: UseTeamPerformanceDataProps) => {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter employees by selected branch
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => 
      !selectedBranch || employee.branch_id === selectedBranch
    );
  }, [employees, selectedBranch]);

  // Fetch sales data for all employees in the branch
  const { data: salesData = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['team-performance', selectedBranch, selectedPeriod],
    queryFn: async () => {
      // Calculate the start date based on selected period (in months)
      const startDate = format(subMonths(new Date(), parseInt(selectedPeriod)), 'yyyy-MM-01');
      
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .gte('month', startDate)
        .order('month');
      
      if (error) throw error;
      return data || [];
    },
    enabled: filteredEmployees.length > 0
  });

  // Fetch appointment data (mock for now but would connect to real data)
  const { data: appointmentData = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['team-appointments', selectedBranch, selectedPeriod],
    queryFn: async () => {
      // In a real implementation, this would fetch from an appointments table
      // For now, we'll generate mock data based on employees
      return filteredEmployees.map(employee => ({
        employee_id: employee.id,
        employee_name: employee.name,
        appointment_count: Math.floor(Math.random() * 100) + 20
      }));
    },
    enabled: filteredEmployees.length > 0
  });

  // Process performance data
  const performanceData = useMemo((): EmployeePerformance[] => {
    if (isLoadingSales || isLoadingAppointments || !filteredEmployees.length) {
      return [];
    }

    // Build performance metrics for each employee
    const employeeMetrics: Record<string, EmployeePerformance> = {};
    
    // Initialize with employee details
    filteredEmployees.forEach(employee => {
      employeeMetrics[employee.id] = {
        id: employee.id,
        name: employee.name,
        photoUrl: employee.photo_url,
        metrics: {
          sales: 0,
          appointments: 0,
          revenue: 0
        }
      };
    });
    
    // Add sales data
    salesData.forEach((record: EmployeeSales) => {
      const employee = filteredEmployees.find(e => e.name === record.employee_name);
      if (employee && employeeMetrics[employee.id]) {
        employeeMetrics[employee.id].metrics.sales += record.sales_amount;
        // Estimate revenue (in a real system, this would be actual revenue)
        employeeMetrics[employee.id].metrics.revenue += record.sales_amount * 0.15;
      }
    });
    
    // Add appointment data
    appointmentData.forEach(record => {
      const employee = filteredEmployees.find(e => e.id === record.employee_id);
      if (employee && employeeMetrics[employee.id]) {
        employeeMetrics[employee.id].metrics.appointments += record.appointment_count;
      }
    });
    
    // Convert to array
    return Object.values(employeeMetrics);
  }, [filteredEmployees, salesData, appointmentData, isLoadingSales, isLoadingAppointments]);

  // Sort and filter the performance data
  const sortedPerformanceData = useMemo(() => {
    return [...performanceData].sort((a, b) => {
      const aValue = a.metrics[selectedMetric];
      const bValue = b.metrics[selectedMetric];
      
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    });
  }, [performanceData, selectedMetric, sortDirection]);

  // Find top performer for the selected metric
  const topPerformer = useMemo(() => {
    if (!sortedPerformanceData.length) return null;
    
    return sortDirection === 'desc' 
      ? sortedPerformanceData[0] 
      : sortedPerformanceData[sortedPerformanceData.length - 1];
  }, [sortedPerformanceData, sortDirection]);

  // Calculate the highest value for the selected metric (for progress bars)
  const highestValue = useMemo(() => {
    if (!performanceData.length) return 0;
    
    return Math.max(...performanceData.map(p => p.metrics[selectedMetric]));
  }, [performanceData, selectedMetric]);

  const isLoading = isLoadingSales || isLoadingAppointments;

  return {
    sortDirection,
    setSortDirection,
    filteredEmployees,
    performanceData,
    sortedPerformanceData,
    topPerformer,
    highestValue,
    isLoading
  };
};
