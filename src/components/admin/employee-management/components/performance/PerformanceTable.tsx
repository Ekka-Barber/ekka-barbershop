
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeePerformance } from '@/hooks/team-performance/useTeamPerformanceData';

interface PerformanceTableProps {
  sortedPerformanceData: EmployeePerformance[];
}

export const PerformanceTable = ({ sortedPerformanceData }: PerformanceTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Sales</TableHead>
          <TableHead>Appointments</TableHead>
          <TableHead>Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedPerformanceData.map(employee => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell>{employee.metrics.sales.toLocaleString()} SAR</TableCell>
            <TableCell>{employee.metrics.appointments}</TableCell>
            <TableCell>{employee.metrics.revenue.toLocaleString()} SAR</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
