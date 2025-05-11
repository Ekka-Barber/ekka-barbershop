import React, { useState } from 'react';
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
import { Eye, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { EmployeeMonthlySalary } from '../types'; // Adjust path as needed
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";
import SalaryHistoryDetailDrawer from './SalaryHistoryDetailDrawer';

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
  // Track expanded rows with a Set of IDs
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // State for the detail drawer
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<EmployeeMonthlySalary | null>(null);
  
  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  // Handle view details click
  const handleViewDetails = (snapshot: EmployeeMonthlySalary) => {
    setSelectedSnapshot(snapshot);
    setDetailDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 7 }).map((_, index) => (
                <TableHead key={index}><Skeleton className="h-5 w-full" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 7 }).map((_, cellIndex) => (
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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[120px]">Month/Year</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead className="text-right">Net Paid</TableHead>
              <TableHead>Plan Snapshot</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead className="w-[150px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshots.map((snapshot) => {
              const isExpanded = expandedRows.has(snapshot.id);
              
              return (
                <React.Fragment key={snapshot.id}>
                  <TableRow className={cn(isExpanded && "bg-muted/30")}>
                    <TableCell className="p-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        aria-label={isExpanded ? "Collapse row" : "Expand row"} 
                        onClick={() => toggleRowExpansion(snapshot.id)}
                        className="h-7 w-7"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label="View Details"
                        onClick={() => handleViewDetails(snapshot)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Regenerate Payslip" className="ml-2">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded details row */}
                  {isExpanded && (
                    <TableRow className="bg-muted/30 hover:bg-muted/40">
                      <TableCell colSpan={7}>
                        <div className="px-4 py-2">
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Base Salary</p>
                              <p className="font-medium">{formatCurrency(snapshot.base_salary)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Commission</p>
                              <p className="font-medium">{formatCurrency(snapshot.commission_amount)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Bonuses</p>
                              <p className="font-medium">{formatCurrency(snapshot.total_bonuses)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Deductions</p>
                              <p className="font-medium">{formatCurrency(snapshot.total_deductions)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Loan Repayments</p>
                              <p className="font-medium">{formatCurrency(snapshot.total_loan_repayments)}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-sm">
                            <p className="text-muted-foreground">Sales Amount</p>
                            <p className="font-medium">{formatCurrency(snapshot.sales_amount)}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Detail drawer */}
      <SalaryHistoryDetailDrawer
        isOpen={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        salaryRecord={selectedSnapshot}
        calculationDetails={selectedSnapshot?.calculation_details_json as Record<string, unknown> || null}
      />
    </>
  );
}; 