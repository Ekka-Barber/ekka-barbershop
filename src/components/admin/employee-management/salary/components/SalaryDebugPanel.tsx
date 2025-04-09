
import { RefreshCw, Bug, AlertCircle, Wrench, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SalaryCalculationError {
  employeeId: string;
  employeeName: string;
  error: string;
  details?: Record<string, unknown>;
}

interface ZeroSalaryEmployee {
  id: string;
  name: string;
  hasSalaryPlanId: boolean;
  salaryPlanId: string;
}

interface DebugPanelProps {
  calculationErrors: SalaryCalculationError[];
  zeroSalaryEmployees: ZeroSalaryEmployee[];
  isLoading: boolean;
  handleRefresh: () => void;
  onFixEmployee: (employee: { id: string; name: string; salaryPlanId: string | null }) => void;
}

export const SalaryDebugPanel = ({ 
  calculationErrors, 
  zeroSalaryEmployees, 
  isLoading, 
  handleRefresh,
  onFixEmployee
}: DebugPanelProps) => {
  return (
    <Card className="border-dashed border-yellow-500">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium">Salary Calculation Debug</h3>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Refresh Data
          </Button>
        </div>
        
        {/* Calculation Errors Section */}
        {calculationErrors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Calculation Errors</h4>
            <div className="rounded-lg bg-red-50 p-3 space-y-3">
              {calculationErrors.map((error, index) => (
                <div key={index} className="text-sm space-y-1">
                  <p className="font-medium text-red-800">
                    {error.employeeName}: {error.error}
                  </p>
                  {error.details && (
                    <pre className="text-xs bg-white/50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Zero Salary Employees Section */}
        {zeroSalaryEmployees.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Employees with Zero Salary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Employee</th>
                    <th className="text-left py-2 px-2">Has Salary Plan ID</th>
                    <th className="text-left py-2 px-2">Salary Plan ID</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zeroSalaryEmployees.map(emp => (
                    <tr key={emp.id} className="border-b">
                      <td className="py-2 px-2">{emp.name}</td>
                      <td className="py-2 px-2">
                        {emp.hasSalaryPlanId ? 
                          <span className="text-green-600">Yes</span> : 
                          <span className="text-red-600">No</span>
                        }
                      </td>
                      <td className="py-2 px-2">{emp.salaryPlanId}</td>
                      <td className="py-2 px-2 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onFixEmployee({
                            id: emp.id,
                            name: emp.name,
                            salaryPlanId: emp.hasSalaryPlanId ? 
                              String(emp.salaryPlanId) : null
                          })}
                          className="flex items-center gap-1"
                        >
                          <Wrench className="h-3 w-3" />
                          Fix
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 text-sm">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <p className="font-medium text-yellow-800">Troubleshooting Steps:</p>
                  <ol className="list-decimal ml-5 space-y-1 mt-1 text-yellow-700">
                    <li>Click the "Fix" button to assign a valid salary plan to the employee</li>
                    <li>Ensure the salary plan exists in the database</li>
                    <li>Verify the salary plan has the correct configuration (base amount, commission rates, etc.)</li>
                    <li>Check if the correct calculator is being used for the plan type</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        ) : calculationErrors.length === 0 ? (
          <p className="text-sm">
            No issues found. All salary calculations appear to be working correctly.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};
