import React from 'react';
import { EmployeeListProps } from '../../types';
import { Employee } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  isLoading,
  pagination,
  onEmployeeSelect,
  selectedEmployee,
  onPageChange
}) => {
  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>A list of your employees.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Render skeleton rows while loading
            [...Array(pagination.pageSize)].map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
              </TableRow>
            ))
          ) : employees.length > 0 ? (
            // Render employee rows when data is available
            employees.map((employee) => (
              <TableRow
                key={employee.id}
                onClick={() => onEmployeeSelect(employee.id)}
                className={cn("cursor-pointer", selectedEmployee === employee.id ? "bg-muted" : "")}
              >
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={employee.photo_url} />
                      <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{employee.name}</span>
                  </div>
                </TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell className="text-right">
                  {employee.is_archived ? (
                    <Badge variant="outline">Archived</Badge>
                  ) : (
                    <Badge>Active</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            // Render a message when there are no employees
            <TableRow>
              <TableCell colSpan={3} className="text-center">No employees found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      {employees.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default EmployeeList;
