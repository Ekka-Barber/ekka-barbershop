import React, { useState, useEffect, memo } from 'react';

import { TIME } from '@shared/constants/time';
import { DynamicField } from '@shared/types/business/calculations';
import { Employee } from '@shared/types/domains';

import type { SalaryData } from '@/features/owner/employees/types';
import { formatPrice } from '@/features/owner/employees/utils';

interface SalaryIntelligenceProps {
  employee: Employee;
  salesAmount: number;
  selectedMonth: string;
  monthlyDeductions: DynamicField[];
  monthlyLoans: DynamicField[];
  monthlyBonuses: DynamicField[];
}

export const SalaryIntelligence: React.FC<SalaryIntelligenceProps> = memo(
  ({
    employee,
    salesAmount,
    selectedMonth,
    monthlyDeductions,
    monthlyLoans,
    monthlyBonuses,
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [salaryData, setSalaryData] = useState<SalaryData>({
      baseSalary: 0,
      commission: 0,
      targetBonus: 0,
      totalSalary: 0,
      deductions: 0,
      loans: 0,
      bonuses: 0,
    });

    useEffect(() => {
      const calculateSalary = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const totalDeductions = monthlyDeductions.reduce(
          (sum, d) => sum + parseFloat(d.amount || '0'),
          0
        );
        const totalLoans = monthlyLoans.reduce(
          (sum, l) => sum + parseFloat(l.amount || '0'),
          0
        );
        const totalBonuses = monthlyBonuses.reduce(
          (sum, b) => sum + parseFloat(b.amount || '0'),
          0
        );

        const basicSalary = 2000;
        const commission = salesAmount > 4000 ? (salesAmount - 4000) * 0.2 : 0;

        let targetBonus = 0;
        if (salesAmount >= 15000) targetBonus = TIME.SECOND_IN_MS;
        else if (salesAmount >= 12000) targetBonus = 500;
        else if (salesAmount >= 10000) targetBonus = 350;
        else if (salesAmount >= 7000) targetBonus = 200;

        const totalSalary =
          basicSalary +
          commission +
          targetBonus +
          totalBonuses -
          totalDeductions -
          totalLoans;

        setSalaryData({
          baseSalary: basicSalary,
          commission,
          targetBonus,
          totalSalary,
          deductions: totalDeductions,
          loans: totalLoans,
          bonuses: totalBonuses,
        });
        setIsLoading(false);
      };

      calculateSalary();
    }, [
      salesAmount,
      selectedMonth,
      monthlyDeductions,
      monthlyLoans,
      monthlyBonuses,
    ]);

    if (isLoading) {
      return (
        <div className="space-y-3">
          <div className="animate-pulse bg-gray-200 h-4 rounded" />
          <div className="animate-pulse bg-gray-200 h-16 rounded" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Plan: {employee.salary_plan_id || 'Default Plan'}
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Base Salary</p>
            <p className="text-sm font-semibold">
              {formatPrice(salaryData.baseSalary)}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Commission</p>
            <p className="text-sm font-semibold">
              {formatPrice(salaryData.commission)}
            </p>
          </div>
          {salaryData.targetBonus > 0 && (
            <div className="bg-yellow-50 p-3 rounded-md col-span-2">
              <p className="text-xs text-gray-500">Target Bonus</p>
              <p className="text-sm font-semibold text-yellow-700">
                {formatPrice(salaryData.targetBonus)}
              </p>
            </div>
          )}
        </div>

        {(salaryData.deductions > 0 ||
          salaryData.loans > 0 ||
          salaryData.bonuses > 0) && (
          <div className="mt-3 space-y-2">
            {salaryData.bonuses > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-600">Extra Bonuses:</span>
                <span className="font-semibold text-green-700">
                  +{formatPrice(salaryData.bonuses)}
                </span>
              </div>
            )}
            {salaryData.deductions > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-600">Deductions:</span>
                <span className="font-semibold text-red-700">
                  -{formatPrice(salaryData.deductions)}
                </span>
              </div>
            )}
            {salaryData.loans > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-orange-600">Loan Deductions:</span>
                <span className="font-semibold text-orange-700">
                  -{formatPrice(salaryData.loans)}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-2">
          Based on {formatPrice(salesAmount)} in sales for {selectedMonth}
        </p>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center font-semibold">
            <span>Final Salary</span>
            <span className="text-lg text-green-600">
              {formatPrice(salaryData.totalSalary)}
            </span>
          </div>
          {salaryData.loans > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              (After {formatPrice(salaryData.loans)} loan deduction)
            </div>
          )}
        </div>
      </div>
    );
  }
);

SalaryIntelligence.displayName = 'SalaryIntelligence';
