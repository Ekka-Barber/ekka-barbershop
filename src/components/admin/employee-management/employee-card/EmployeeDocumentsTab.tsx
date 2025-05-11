import React from 'react';
import { Employee } from '@/types/employee';
import { DocumentList } from '../components/employee-list/documents/DocumentList';
import { TabsContent } from '@/components/ui/tabs';

// DO NOT CHANGE API LOGIC
interface EmployeeDocumentsTabProps {
  employee: Employee;
  tabValue: string;
}

export const EmployeeDocumentsTab: React.FC<EmployeeDocumentsTabProps> = ({ 
  employee, 
  tabValue 
}) => {
  return (
    <TabsContent value={tabValue} className="space-y-4 pt-2">
      <DocumentList employeeId={employee.id} />
    </TabsContent>
  );
}; 