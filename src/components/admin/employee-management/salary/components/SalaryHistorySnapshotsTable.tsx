import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { EmployeeMonthlySalary } from '../types'; // Adjust path as needed
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface SalaryHistorySnapshotsTableProps {
  snapshots: EmployeeMonthlySalary[];
  isLoading: boolean;
  // TODO: Add employeeMap prop for avatars if snapshots don't contain photo_url
  // employeeMap: Map<string, { name: string; photo_url?: string | null }>; 
}

// Basic utility functions (can be moved to a utils file)
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-CA'); // YYYY-MM-DD
  } catch {
    return dateString; // Fallback to original string if parsing fails
  }
};

const getInitials = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const SalaryHistorySnapshotsTable: React.FC<SalaryHistorySnapshotsTableProps> = ({
  snapshots,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 6 }).map((_, index) => (
                <TableHead key={index}><Skeleton className="h-5 w-full" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 6 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}><Skeleton className="h-5 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md">
        <p className="text-muted-foreground">No salary records found for the selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Month/Year</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className="text-right">Net Paid</TableHead>
            <TableHead>Plan Snapshot</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead className="w-[150px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapshots.map((snapshot) => (
            <TableRow key={snapshot.id}>
              <TableCell>
                <Badge variant="outline">{snapshot.month_year}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {/* Assuming no direct photo_url in snapshot, using initials */}
                    {/* TODO: Enhance with actual photo if available via employeeMap */}
                    {/* <AvatarImage src={employeeMap.get(snapshot.employee_id)?.photo_url || undefined} alt={snapshot.employee_name_snapshot} /> */}
                    <AvatarFallback>{getInitials(snapshot.employee_name_snapshot)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{snapshot.employee_name_snapshot}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(snapshot.net_salary_paid)}</TableCell>
              <TableCell>{snapshot.salary_plan_name_snapshot || 'N/A'}</TableCell>
              <TableCell>{formatDate(snapshot.payment_confirmation_date)}</TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" aria-label="View Details">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Regenerate Payslip" className="ml-2">
                  <FileText className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 