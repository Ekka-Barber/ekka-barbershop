import { TIME } from '@shared/constants/time';
import type { DynamicField } from '@shared/types/business/calculations';
import type { SalaryPlan } from '@shared/types/domains/salary';

interface TieredBonus {
  sales_target: number;
  bonus: number;
}

interface SalaryPlanBlock {
  id: string;
  type: string;
  config: {
    base_salary?: number;
    tiered_bonus?: TieredBonus[];
    threshold?: number;
    rate?: number;
    amount?: number;
    basicSalary?: number;
  };
}

export interface SalaryPlanConfig {
  name: string;
  blocks: SalaryPlanBlock[];
  description: string;
}

export const calculateSalaryFromPlan = (
  sales: number,
  planConfig: SalaryPlanConfig,
  _deductions: DynamicField[] = [],
  bonuses: DynamicField[] = []
) => {

  let basicSalary = 0;
  let commission = 0;
  let targetBonus = 0;

  planConfig.blocks.forEach((block, _index) => {
    switch (block.type) {
      case 'basic_salary': {
        basicSalary = block.config.base_salary || 0;

        const tieredBonuses = block.config.tiered_bonus || [];
        const applicableBonus = [...tieredBonuses]
          .sort((a, b) => b.sales_target - a.sales_target)
          .find((tier) => sales >= tier.sales_target);

        if (applicableBonus) {
          targetBonus = applicableBonus.bonus;
        }
        break;
      }

      case 'commission': {
        const threshold = block.config.threshold || 0;
        const rate = block.config.rate || 0;

        if (sales > threshold) {
          commission = Math.round((sales - threshold) * rate);
        }
        break;
      }

      case 'fixed_amount': {
        basicSalary = block.config.basicSalary || block.config.amount || 0;
        break;
      }
    }
  });

  const totalBonuses = Math.round(bonuses.reduce(
    (sum, bonus) => sum + Number(bonus.amount),
    0
  ));
  const total = Math.round(basicSalary + commission + targetBonus + totalBonuses);

  return {
    basicSalary,
    commission,
    targetBonus,
    total,
    totalBonuses,
  };
};

export const calculateSalary = (
  sales: number,
  deductions: DynamicField[] = [],
  bonuses: DynamicField[] = [],
  salaryPlan?: SalaryPlan | null
) => {
  if (salaryPlan?.config) {
    return calculateSalaryFromPlan(
      sales,
      salaryPlan.config as unknown as SalaryPlanConfig,
      deductions,
      bonuses
    );
  }

  const originalPlanConfig: SalaryPlanConfig = {
    name: 'Original Plan',
    blocks: [
      {
        id: 'basic-salary-2000',
        type: 'basic_salary',
        config: {
          base_salary: 2000,
          tiered_bonus: [
            { sales_target: 7000, bonus: 200 },
            { sales_target: 10000, bonus: 350 },
            { sales_target: 12000, bonus: 500 },
            { sales_target: 15000, bonus: TIME.SECOND_IN_MS },
          ],
        },
      },
      {
        id: 'commission-20-percent',
        type: 'commission',
        config: {
          threshold: 4000,
          rate: 0.2,
        },
      },
    ],
    description: 'Default plan configuration',
  };

  return calculateSalaryFromPlan(
    sales,
    originalPlanConfig,
    deductions,
    bonuses
  );
};

export const calculateOriginalPlan = (sales: number) => {
  const result = calculateSalary(sales);
  return {
    basicSalary: result.basicSalary,
    commission: result.commission,
    targetBonus: result.targetBonus,
    totalSalary: result.total,
  };
};

export const calculateFixedPlan = () => {
  const fixedPlanConfig: SalaryPlanConfig = {
    name: 'Fixed Plan',
    blocks: [
      {
        id: 'fixed-amount',
        type: 'fixed_amount',
        config: {
          amount: 3750,
        },
      },
    ],
    description: 'Fixed salary plan',
  };

  const result = calculateSalaryFromPlan(0, fixedPlanConfig);
  return {
    basicSalary: result.basicSalary,
    commission: 0,
    targetBonus: 0,
    totalSalary: result.total,
  };
};

export const calculateDynamicBasicPlan = (sales: number) => {
  const baseSalary = 500;
  const unitThreshold = 5000;
  const unitSize = 400;
  const unitIncrement = 50;

  let additionalSalary = 0;
  if (sales > unitThreshold) {
    const excessSales = sales - unitThreshold;
    const units = Math.floor(excessSales / unitSize);
    additionalSalary = units * unitIncrement;
  }

  const totalSalary = baseSalary + additionalSalary;

  return {
    basicSalary: baseSalary,
    additionalSalary,
    totalSalary,
  };
};
