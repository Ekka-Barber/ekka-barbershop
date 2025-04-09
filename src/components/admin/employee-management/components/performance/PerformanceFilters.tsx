
import { ArrowUpDown, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MetricType, PeriodType } from '@/hooks/team-performance/useTeamPerformanceData';

interface PerformanceFiltersProps {
  selectedMetric: MetricType;
  setSelectedMetric: (value: MetricType) => void;
  selectedPeriod: PeriodType;
  setSelectedPeriod: (value: PeriodType) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc') => void;
  handleExportData: () => void;
  isLoading: boolean;
  performanceDataLength: number;
}

export const PerformanceFilters = ({
  selectedMetric,
  setSelectedMetric,
  selectedPeriod,
  setSelectedPeriod,
  sortDirection,
  setSortDirection,
  handleExportData,
  isLoading,
  performanceDataLength
}: PerformanceFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={selectedMetric}
        onValueChange={(value: MetricType) => setSelectedMetric(value)}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Select metric" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sales">Sales</SelectItem>
          <SelectItem value="appointments">Appointments</SelectItem>
          <SelectItem value="revenue">Revenue</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={selectedPeriod}
        onValueChange={(value: PeriodType) => setSelectedPeriod(value)}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Time period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Last Month</SelectItem>
          <SelectItem value="3">Last 3 Months</SelectItem>
          <SelectItem value="6">Last 6 Months</SelectItem>
          <SelectItem value="12">Last Year</SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
        title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline"
        size="sm"
        onClick={handleExportData}
        disabled={isLoading || !performanceDataLength}
      >
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  );
};
