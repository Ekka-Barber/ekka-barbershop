
import { SalaryDetail } from '../../types/salary';
import { logger } from '@/utils/logger';

/**
 * Helper function to extract base salary from plan configuration
 */
export function extractBaseSalary(config: Record<string, any>): number {
  let baseSalary = 0;
  
  if (config.blocks && Array.isArray(config.blocks)) {
    // Process each block in the config
    for (const block of config.blocks) {
      // Handle base salary block
      if (block.type === 'basic_salary' && block.config) {
        // Try multiple possible property names for base salary
        baseSalary = Number(block.config.base_salary || 
                          block.config.amount || 
                          block.config.base_amount || 0);
        logger.info(`Found base salary in block: ${baseSalary}`);
        break;
      }
    }
  } else {
    // Legacy format - direct properties at the top level
    baseSalary = Number(config.base_salary || config.base_amount || config.amount || 0);
    logger.info(`Extracted base salary from flat config: ${baseSalary}`);
  }
  
  return baseSalary;
}

/**
 * Helper function to extract commission rate and threshold from plan configuration
 */
export function extractCommissionParams(config: Record<string, any>): { 
  commissionRate: number; 
  threshold: number;
} {
  let commissionRate = 0;
  let threshold = 0;
  
  if (config.blocks && Array.isArray(config.blocks)) {
    // Process each block in the config
    for (const block of config.blocks) {
      // Handle commission block
      if (block.type === 'commission' && block.config) {
        commissionRate = Number(block.config.rate || block.config.commission_rate || 0);
        threshold = Number(block.config.threshold || 0);
        logger.info(`Found commission block: rate=${commissionRate}, threshold=${threshold} SAR`);
        break;
      }
    }
  } else {
    // Legacy format - direct properties at the top level
    commissionRate = Number(config.commission_rate || config.rate || 0);
    threshold = Number(config.threshold || 0);
    logger.info(`Extracted commission params from flat config: rate=${commissionRate}, threshold=${threshold}`);
  }
  
  return { commissionRate, threshold };
}

/**
 * Helper function to extract target bonus from plan configuration
 */
export function extractTargetBonus(config: Record<string, any>): number {
  let targetBonus = 0;
  
  if (config.blocks && Array.isArray(config.blocks)) {
    // Process each block in the config
    for (const block of config.blocks) {
      // Handle target bonus block
      if (block.type === 'target_bonus' && block.config) {
        targetBonus = Number(block.config.amount || block.config.bonus_amount || 0);
        logger.info(`Found target bonus in block: ${targetBonus}`);
        break;
      }
    }
  } else {
    // Legacy format - direct properties at the top level
    targetBonus = Number(config.target_bonus || config.bonus_amount || 0);
    logger.info(`Extracted target bonus from flat config: ${targetBonus}`);
  }
  
  return targetBonus;
}

/**
 * Helper function to calculate commission based on parameters
 */
export function calculateCommission(
  salesAmount: number, 
  threshold: number, 
  commissionRate: number
): { 
  commission: number; 
  calculationDetails: string;
} {
  // In some cases, the rate might be stored as a percentage (e.g., 20 instead of 0.2)
  const normalizedRate = commissionRate > 1 ? commissionRate / 100 : commissionRate;
  
  // Don't calculate commission if sales amount doesn't meet threshold or rate is zero
  if (salesAmount < threshold || commissionRate <= 0) {
    return { 
      commission: 0, 
      calculationDetails: `No commission: Sales ${salesAmount} < threshold ${threshold} or rate ${commissionRate} is 0` 
    };
  }
  
  const commissionableAmount = salesAmount - threshold;
  const commission = Math.round(commissionableAmount * normalizedRate);
  
  const calculationDetails = `(${salesAmount} - ${threshold}) × ${normalizedRate} = ${commission} SAR`;
  
  return { commission, calculationDetails };
}

/**
 * Helper function to generate detailed breakdown of salary components for UI
 */
export function generateSalaryDetails(result: { 
  baseSalary: number; 
  commission: number; 
  targetBonus: number; 
  regularBonusTotal: number;
  deductions: number;
  loans: number;
  totalSalary: number;
}): SalaryDetail[] {
  const details: SalaryDetail[] = [];
  
  if (result.baseSalary > 0) {
    details.push({
      type: 'Base Salary',
      amount: result.baseSalary,
      description: 'Base monthly salary'
    });
  }
  
  if (result.commission > 0) {
    details.push({
      type: 'Commission',
      amount: result.commission,
      description: 'Sales commission'
    });
  }
  
  // Add target bonus from salary plan if available
  if (result.targetBonus > 0) {
    details.push({
      type: 'Target Bonus',
      amount: result.targetBonus,
      description: 'Monthly target performance bonus from salary plan'
    });
  }
  
  // Add regular bonuses if available
  if (result.regularBonusTotal > 0) {
    details.push({
      type: 'Additional Bonuses',
      amount: result.regularBonusTotal,
      description: 'Additional bonuses from transactions'
    });
  }
  
  return details;
}
