
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EmployeeCardProps {
  employeeId: string;
  onClose: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employeeId, onClose }) => {
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
        <p className="text-sm text-muted-foreground">
          Viewing employee with ID: {employeeId}
        </p>
        
        {/* Employee details content would be rendered here */}
        <div className="mt-4 space-y-4">
          <p>Employee details are loading...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
