import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeePerformance } from '@/hooks/team-performance/useTeamPerformanceData';
import { Award, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface PerformanceTableProps {
  sortedPerformanceData: EmployeePerformance[];
}

export const PerformanceTable = ({ sortedPerformanceData }: PerformanceTableProps) => {
  return (
    <>
      {/* Mobile Performance Cards */}
      <div className="block sm:hidden space-y-4">
        {sortedPerformanceData.map((employee, index) => (
          <div 
            key={employee.id}
            className={`rounded-lg border p-4 space-y-3 ${
              index === 0 ? 'bg-primary/5 border-primary/20' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {index === 0 && <Award className="h-4 w-4 text-primary" />}
                <h3 className="font-medium">{employee.name}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                index < 3 ? 'bg-green-100 text-green-800' : 
                index < 6 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                #{index + 1}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 flex flex-col">
                <span className="text-xs text-muted-foreground flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Sales
                </span>
                <span className="font-medium">
                  {employee.metrics.sales.toLocaleString()} SAR
                </span>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3 flex flex-col">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Appointments
                </span>
                <span className="font-medium">
                  {employee.metrics.appointments}
                </span>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3 flex flex-col col-span-2">
                <span className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Revenue
                </span>
                <span className="font-medium">
                  {employee.metrics.revenue.toLocaleString()} SAR
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
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
      </div>
    </>
  );
};
