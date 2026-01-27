import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useCallback, memo } from 'react';

import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';


import { EnhancedEmployeeCardProps } from './EnhancedEmployeeCard.types';

import {
  EmployeeHeader,
  QuickSummaryCards,
  ExpandedContent,
  SalaryPlanSelector,
} from '@/features/owner/employees';
import { useEmployeeCardData } from '@/features/owner/employees/hooks/useEmployeeCardData';

export const EnhancedEmployeeCard: React.FC<EnhancedEmployeeCardProps> = memo(
  ({
    employee,
    salesValue,
    onSalesChange,
    selectedMonth,
    monthlyDeductions,
    monthlyLoans,
    monthlyBonuses,
    onSalaryPlanChange,
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
      salesInputId,
      totalDeductions,
      totalLoans,
      totalBonuses,
      salesAmount,
    } = useEmployeeCardData({
      employee,
      salesValue,
      monthlyDeductions,
      monthlyLoans,
      monthlyBonuses,
    });

    const selectedPlanId = employee.salary_plan_id;

    const handleToggleExpanded = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const handleSalesChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSalesChange(e.target.value);
      },
      [onSalesChange]
    );

    const handlePlanChange = useCallback(
      (planId: string) => {
        onSalaryPlanChange?.(employee.id, planId);
      },
      [onSalaryPlanChange, employee.id]
    );

    return (
      <Card className="overflow-hidden h-full transition-all duration-200 flex flex-col hover:shadow-card">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-card/80 to-accent/60 border-b border-border/60 pb-3 pt-4">
          <div className="flex items-start justify-between gap-2">
            <EmployeeHeader employee={employee} />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpanded}
              className="p-2 h-8 w-8 rounded-full hover:bg-white/50"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 flex-1 flex flex-col">
          {/* Sales Input - Always Visible */}
          <div className="mb-4">
            <label
              htmlFor={salesInputId}
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              💰 Sales Amount
            </label>
            <Input
              id={salesInputId}
              type="number"
              value={salesValue}
              onChange={handleSalesChange}
              placeholder="Enter sales amount"
              className="text-lg font-semibold"
            />
          </div>

          {/* Salary Plan Selector */}
          {onSalaryPlanChange && (
            <div className="mb-4">
              <SalaryPlanSelector
                employeeId={employee.id}
                employeeName={employee.name}
                selectedPlanId={selectedPlanId}
                onPlanChange={handlePlanChange}
                size="sm"
              />
            </div>
          )}

          <QuickSummaryCards
            totalBonuses={totalBonuses}
            totalDeductions={totalDeductions + totalLoans}
          />

          {isExpanded && (
            <ExpandedContent
              employee={employee}
              selectedMonth={selectedMonth}
              salesAmount={salesAmount}
              monthlyDeductions={monthlyDeductions}
              monthlyLoans={monthlyLoans}
              monthlyBonuses={monthlyBonuses}
              totalBonuses={totalBonuses}
              totalDeductions={totalDeductions}
              totalLoans={totalLoans}
            />
          )}
        </CardContent>
      </Card>
    );
  }
);

EnhancedEmployeeCard.displayName = 'EnhancedEmployeeCard';
