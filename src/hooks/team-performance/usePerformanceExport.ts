
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { EmployeePerformance } from './useTeamPerformanceData';

export const usePerformanceExport = (sortedPerformanceData: EmployeePerformance[]) => {
  const { toast } = useToast();

  const handleExportData = () => {
    try {
      // Create CSV content
      const headers = ['Employee Name', 'Sales (SAR)', 'Appointments', 'Revenue (SAR)'];
      const rows = sortedPerformanceData.map(p => [
        p.name,
        p.metrics.sales.toString(),
        p.metrics.appointments.toString(),
        p.metrics.revenue.toFixed(2)
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `team_performance_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Team performance data has been exported as CSV",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the performance data",
        variant: "destructive",
      });
    }
  };

  return { handleExportData };
};
