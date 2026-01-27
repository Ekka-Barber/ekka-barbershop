import { format } from 'date-fns';
import { DollarSign, PencilIcon } from 'lucide-react';
import React from 'react';

import { DynamicField } from '@shared/types/business/calculations';
import { Employee } from '@shared/types/domains';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/components/accordion';
import { Button } from '@shared/ui/components/button';
import { logger } from '@shared/utils/logger';

import { EmployeeDetails } from './EmployeeDetails';
import { FinancialSummary } from './FinancialSummary';
import { SalaryIntelligence } from './SalaryIntelligence';

interface ExpandedContentProps {
  employee: Employee;
  selectedMonth: string;
  salesAmount: number;
  monthlyDeductions: DynamicField[];
  monthlyLoans: DynamicField[];
  monthlyBonuses: DynamicField[];
  totalBonuses: number;
  totalDeductions: number;
  totalLoans: number;
}

export const ExpandedContent: React.FC<ExpandedContentProps> = ({
  employee,
  selectedMonth,
  salesAmount,
  monthlyDeductions,
  monthlyLoans,
  monthlyBonuses,
  totalBonuses,
  totalDeductions,
  totalLoans,
}) => {
  return (
    <div className="space-y-4 flex-1">
      <Accordion type="single" collapsible className="w-full">
        {/* Employee Details */}
        <AccordionItem value="details">
          <AccordionTrigger className="text-sm font-semibold">
            👤 Employee Details
          </AccordionTrigger>
          <AccordionContent>
            <EmployeeDetails employee={employee} />
          </AccordionContent>
        </AccordionItem>

        {/* Financial Summary */}
        <AccordionItem value="financial">
          <AccordionTrigger className="text-sm font-semibold">
            💳 Financial Summary - {format(new Date(selectedMonth), 'MMM yyyy')}
          </AccordionTrigger>
          <AccordionContent>
            <FinancialSummary
              salesAmount={salesAmount}
              monthlyBonuses={monthlyBonuses}
              monthlyDeductions={monthlyDeductions}
              monthlyLoans={monthlyLoans}
              totalBonuses={totalBonuses}
              totalDeductions={totalDeductions}
              totalLoans={totalLoans}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Salary Intelligence Section */}
        <AccordionItem value="salary-intelligence">
          <AccordionTrigger className="text-sm font-semibold">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <span>🧠 Salary Intelligence</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SalaryIntelligence
              employee={employee}
              salesAmount={salesAmount}
              selectedMonth={selectedMonth}
              monthlyDeductions={monthlyDeductions}
              monthlyLoans={monthlyLoans}
              monthlyBonuses={monthlyBonuses}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() =>
            logger.info('Edit employee', { employeeId: employee.id })
          }
        >
          <PencilIcon className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-1 text-xs"
          onClick={() =>
            logger.info('View details', { employeeId: employee.id })
          }
        >
          Details
        </Button>
      </div>
    </div>
  );
};
