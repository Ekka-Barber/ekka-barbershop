import { BaseCalculator, CalculationParams, CalculatorResult } from './BaseCalculator';
import { 
  FormulaOperator, 
  FormulaStep, 
  FormulaVariable, 
  FormulaPlan, 
  SalaryDetail 
} from '../types/salary';
import { logger } from '@/utils/logger';

/**
 * FormulaCalculator - Handles salary calculations based on dynamic configurable formulas
 */
export class FormulaCalculator extends BaseCalculator {
  private readonly cacheKey = 'formula-calculation';
  
  /**
   * Calculate salary based on the configured formula
   */
  async calculate(params: CalculationParams): Promise<CalculatorResult> {
    try {
      // Validate input parameters
      this.validateInput(params);
      
      // Parse the plan configuration
      const config = this.parseConfig(params.plan.config);
      
      // Check if we have a valid formula configuration
      if (!config.formula) {
        throw new Error('No formula configuration found in the salary plan');
      }
      
      // Parse the formula plan
      const formulaPlan = config.formula as FormulaPlan;
      
      // Initialize variables context with default values
      const context: Record<string, number> = {};
      
      // Set up initial context with variables
      this.initializeContext(context, formulaPlan.variables, params);
      
      // Add basic transaction totals to context
      const bonusTotal = params.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
      const deductionsTotal = params.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
      const loansTotal = params.loans.reduce((sum, loan) => sum + loan.amount, 0);
      
      context['regularBonusTotal'] = bonusTotal;
      context['deductionsTotal'] = deductionsTotal;
      context['loansTotal'] = loansTotal;
      context['salesAmount'] = params.salesAmount;
      
      // Process each step in the formula
      const details: SalaryDetail[] = [];
      
      for (const step of formulaPlan.steps) {
        const result = this.evaluateStep(step, context);
        
        // Store the result in the context if we have a result variable name
        if (step.result) {
          context[step.result] = result;
          
          // Add to details if it's a named result
          details.push({
            type: step.name || step.result,
            amount: result,
            description: step.description || `Calculated ${step.result}`
          });
        }
      }
      
      // Get the final output
      if (!context[formulaPlan.outputVariable]) {
        throw new Error(`Output variable "${formulaPlan.outputVariable}" not found in calculation results`);
      }
      
      // Extract the main salary components from the context
      const baseSalary = context['baseSalary'] || 0;
      const commission = context['commission'] || 0;
      const targetBonus = context['targetBonus'] || 0;
      
      // Calculate the total
      const total = context[formulaPlan.outputVariable];
      
      return {
        baseSalary,
        commission,
        targetBonus,
        bonus: bonusTotal,
        deductions: deductionsTotal,
        loans: loansTotal,
        total,
        planName: params.plan.name || 'Formula-based Plan',
        planType: 'formula',
        details,
        calculationStatus: {
          success: true
        }
      };
    } catch (error) {
      logger.error('Error in formula calculation:', error);
      return {
        baseSalary: 0,
        commission: 0,
        error: error instanceof Error ? error.message : 'Unknown error in formula calculation',
        calculationStatus: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error in formula calculation'
        }
      };
    }
  }
  
  /**
   * Initialize the calculation context with variable values
   */
  private initializeContext(
    context: Record<string, number>,
    variables: FormulaVariable[],
    params: CalculationParams
  ): void {
    for (const variable of variables) {
      let value = variable.defaultValue || 0;
      
      // Handle different variable sources
      switch (variable.source) {
        case 'employee':
          if (variable.path && params.employee) {
            value = this.getNestedProperty(params.employee as unknown as Record<string, unknown>, variable.path) || value;
          }
          break;
        case 'sales':
          if (variable.name === 'salesAmount') {
            value = params.salesAmount;
          }
          break;
        case 'constant':
          // Use the default value
          break;
        default:
          // Use default value if no source or unknown source
          break;
      }
      
      context[variable.name] = value;
    }
  }
  
  /**
   * Evaluate a formula step
   */
  private evaluateStep(step: FormulaStep, context: Record<string, number>): number {
    // If the operation is a string, it's either a variable reference or a literal value
    if (typeof step.operation === 'string') {
      // Check if it's a number literal
      const numberValue = parseFloat(step.operation);
      if (!isNaN(numberValue)) {
        return numberValue;
      }
      
      // Otherwise, it's a variable reference
      if (context[step.operation] === undefined) {
        throw new Error(`Variable "${step.operation}" not found in context`);
      }
      
      return context[step.operation];
    }
    
    // Otherwise, it's an operator
    return this.evaluateOperator(step.operation, context);
  }
  
  /**
   * Evaluate a formula operator
   */
  private evaluateOperator(operator: FormulaOperator, context: Record<string, number>): number {
    const evaluatedParams = operator.parameters.map(param => {
      if (typeof param === 'number') {
        return param;
      } else if (typeof param === 'string') {
        // Check if it's a number literal
        const numberValue = parseFloat(param);
        if (!isNaN(numberValue)) {
          return numberValue;
        }
        
        // Otherwise, it's a variable reference
        if (context[param] === undefined) {
          throw new Error(`Variable "${param}" not found in context`);
        }
        
        return context[param];
      } else {
        // It's a nested step
        return this.evaluateStep(param, context);
      }
    });
    
    // Apply the operator
    switch (operator.type) {
      case 'add':
        return evaluatedParams.reduce((sum, value) => sum + value, 0);
      case 'subtract':
        if (evaluatedParams.length < 2) {
          throw new Error('Subtract operator requires at least 2 parameters');
        }
        return evaluatedParams.slice(1).reduce(
          (result, value) => result - value, 
          evaluatedParams[0]
        );
      case 'multiply':
        return evaluatedParams.reduce((product, value) => product * value, 1);
      case 'divide':
        if (evaluatedParams.length !== 2) {
          throw new Error('Divide operator requires exactly 2 parameters');
        }
        if (evaluatedParams[1] === 0) {
          throw new Error('Division by zero');
        }
        return evaluatedParams[0] / evaluatedParams[1];
      case 'if':
        if (evaluatedParams.length !== 3) {
          throw new Error('If operator requires exactly 3 parameters: condition, true value, false value');
        }
        return evaluatedParams[0] ? evaluatedParams[1] : evaluatedParams[2];
      case 'min':
        if (evaluatedParams.length === 0) {
          throw new Error('Min operator requires at least 1 parameter');
        }
        return Math.min(...evaluatedParams);
      case 'max':
        if (evaluatedParams.length === 0) {
          throw new Error('Max operator requires at least 1 parameter');
        }
        return Math.max(...evaluatedParams);
      default:
        throw new Error(`Unsupported operator type: ${operator.type}`);
    }
  }
  
  /**
   * Helper method to get a nested property from an object
   */
  private getNestedProperty(obj: Record<string, unknown>, path: string): number | undefined {
    const parts = path.split('.');
    let current: unknown = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      if (typeof current === 'object' && current !== null) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    
    return typeof current === 'number' ? current : undefined;
  }
} 
