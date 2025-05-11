
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Employee } from '@/types/employee';

interface EmployeeCardProps {
  employee: Employee;
  onClose: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onClose }) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Employee Details</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-3">
            {employee.photo_url ? (
              <img
                src={employee.photo_url}
                alt={employee.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-lg font-medium">
                  {employee.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-medium">{employee.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{employee.role}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Email</h3>
              <p className="text-sm">{employee.email || 'Not available'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Start Date</h3>
              <p className="text-sm">{employee.start_date || 'Not available'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Nationality</h3>
              <p className="text-sm">{employee.nationality || 'Not available'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Status</h3>
              <p className="text-sm">
                {employee.is_archived ? (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    Archived
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    Active
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
