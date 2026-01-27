import { format } from 'date-fns';
import React from 'react';

import type { SalaryCalculation } from '@shared/types/business/calculations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/components/accordion';

import type {
  EmployeeLoan,
  EmployeeBonus,
  EmployeeDeduction,
} from '@/features/owner/employees/types';
import { formatPrice } from '@/features/owner/employees/utils/formatting';


interface SalaryBreakdownAccordionProps {
  calculation: SalaryCalculation;
  selectedMonth: string;
  employeeDeductions: EmployeeDeduction[];
  employeeLoans: EmployeeLoan[];
  employeeBonuses: EmployeeBonus[];
  totalDeductionsAndLoans: number;
}

export const SalaryBreakdownAccordion: React.FC<
  SalaryBreakdownAccordionProps
> = ({
  calculation,
  selectedMonth,
  employeeDeductions,
  employeeLoans,
  employeeBonuses,
  totalDeductionsAndLoans,
}): JSX.Element => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {/* Detailed Breakdown */}
      <AccordionItem value="breakdown">
        <AccordionTrigger className="text-sm font-semibold">
          📊 Detailed Breakdown
        </AccordionTrigger>
        <AccordionContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-sm text-blue-700">Basic Salary</span>
              <span className="font-semibold text-blue-800">
                {formatPrice(calculation.basicSalary)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
              <span className="text-sm text-purple-700">Commission</span>
              <span className="font-semibold text-purple-800">
                {formatPrice(calculation.commission)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="text-sm text-green-700">Target Bonus</span>
              <span className="font-semibold text-green-800">
                {formatPrice(calculation.targetBonus)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="text-sm text-green-700">Extra Bonuses</span>
              <span className="font-semibold text-green-800">
                {formatPrice(calculation.extraBonuses)}
              </span>
            </div>
            {calculation.deductions > 0 && (
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-sm text-red-700">Deductions</span>
                <span className="font-semibold text-red-800">
                  -{formatPrice(calculation.deductions)}
                </span>
              </div>
            )}
            {calculation.loans > 0 && (
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="text-sm text-orange-700">Loan Deduction</span>
                <span className="font-semibold text-orange-800">
                  -{formatPrice(calculation.loans)}
                </span>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Individual Bonuses, Deductions & Loans */}
      {(employeeBonuses.length > 0 ||
        employeeDeductions.length > 0 ||
        employeeLoans.length > 0) && (
        <AccordionItem value="individual-items">
          <AccordionTrigger className="text-sm font-semibold">
            💰 Individual Bonuses, Deductions & Loans
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {employeeBonuses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">
                  Bonuses ({employeeBonuses.length})
                </h4>
                <div className="space-y-2">
                  {employeeBonuses.map((bonus) => (
                    <div
                      key={`bonus-${bonus.id}`}
                      className="flex justify-between items-center p-2 bg-green-50 rounded"
                    >
                      <div>
                        <span className="text-sm text-green-700">
                          {bonus.description}
                        </span>
                        <div className="text-xs text-green-600">
                          {new Date(bonus.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-semibold text-green-800">
                        +{formatPrice(bonus.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {employeeDeductions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2">
                  Deductions ({employeeDeductions.length})
                </h4>
                <div className="space-y-2">
                  {employeeDeductions.map((deduction) => (
                    <div
                      key={`deduction-${deduction.id}`}
                      className="flex justify-between items-center p-2 bg-red-50 rounded"
                    >
                      <div>
                        <span className="text-sm text-red-700">
                          {deduction.description}
                        </span>
                        <div className="text-xs text-red-600">
                          {new Date(deduction.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-semibold text-red-800">
                        -{formatPrice(deduction.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {employeeLoans.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-orange-700 mb-2">
                  Loans ({employeeLoans.length})
                </h4>
                <div className="space-y-2">
                  {employeeLoans.map((loan) => (
                    <div
                      key={`loan-${loan.id}`}
                      className="flex justify-between items-center p-2 bg-orange-50 rounded"
                    >
                      <div>
                        <span className="text-sm text-orange-700">
                          {loan.description}
                        </span>
                        <div className="text-xs text-orange-600">
                          {new Date(loan.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-semibold text-orange-800">
                        -{formatPrice(loan.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Total Deductions & Loans:
                </span>
                <span className="font-bold text-gray-900">
                  -{formatPrice(totalDeductionsAndLoans)}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Sales Information */}
      <AccordionItem value="sales">
        <AccordionTrigger className="text-sm font-semibold">
          💼 Sales Information
        </AccordionTrigger>
        <AccordionContent className="space-y-3">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">
              Total Sales for {format(new Date(selectedMonth), 'MMM yyyy')}
            </div>
            <div className="text-xl font-bold text-green-700">
              {formatPrice(calculation.sales)}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
