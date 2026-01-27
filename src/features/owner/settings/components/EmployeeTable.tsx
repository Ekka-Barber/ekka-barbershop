import React from 'react';

import { useIsMobile } from '@shared/hooks/use-mobile';
import { Employee } from '@shared/types/domains';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/components/table';

import { EmployeeRow } from './EmployeeRow';
import { useEmployeeRealtime } from './useEmployeeRealtime';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  editingEmployee: Employee | null;
  editForm: React.ReactNode;
}

export const EmployeeTable = ({
  employees,
  onEdit,
  onDelete,
  editingEmployee,
  editForm,
}: EmployeeTableProps) => {
  const { localEmployees } = useEmployeeRealtime(employees);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-0">
        {localEmployees.map((employee) => (
          <React.Fragment key={employee.id}>
            <EmployeeRow
              employee={employee}
              onEdit={onEdit}
              onDelete={onDelete}
            />
            {editingEmployee?.id === employee.id && (
              <div className="border rounded-lg p-4 mb-3 shadow-sm bg-card overflow-x-auto">
                {editForm}
              </div>
            )}
          </React.Fragment>
        ))}
        {localEmployees.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No employees found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Role</TableHead>
            <TableHead className="hidden md:table-cell">Branch</TableHead>
            <TableHead className="hidden lg:table-cell">Sponsor</TableHead>
            <TableHead className="w-[100px] text-right pr-3">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localEmployees.map((employee) => (
            <React.Fragment key={employee.id}>
              <EmployeeRow
                employee={employee}
                onEdit={onEdit}
                onDelete={onDelete}
                forceDesktop={true}
              />
              {editingEmployee?.id === employee.id && (
                <TableRow>
                  <TableCell colSpan={5}>{editForm}</TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
          {localEmployees.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10">
                No employees found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
