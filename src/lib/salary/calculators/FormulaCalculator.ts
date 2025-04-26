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
            // Get the value from the employee object using the path
            const rawValue = this.getNestedProperty(params.employee as unknown as Record<string, unknown>, variable.path);
            
            // Convert to appropriate numeric value based on data type
            if (rawValue !== undefined) {
              if (variable.dataType === 'boolean') {
                // Convert boolean to 1/0
                value = this.convertToBoolean(rawValue) ? 1 : 0;
              } else if (variable.dataType === 'date') {
                // Convert date to timestamp (milliseconds since epoch)
                const dateValue = this.convertToDate(rawValue);
                value = isNaN(dateValue.getTime()) ? value : dateValue.getTime();
              } else if (typeof rawValue === 'number') {
                // Use number directly
                value = rawValue;
              } else if (typeof rawValue === 'string' && !isNaN(parseFloat(rawValue))) {
                // Try to parse string as number
                value = parseFloat(rawValue);
              }
            }
          }
          break;
        case 'sales':
          if (params.salesAmount !== undefined) {
            if (variable.path) {
              // For more complex sales data extraction
              // This would require additional sales data structure in params
              // Future enhancement
            } else if (variable.name === 'salesAmount') {
              value = params.salesAmount;
            }
          }
          break;
        case 'transaction':
          // Handle specific transaction variables with improved path handling
          if (variable.path) {
            // Future: implement path-based extraction from transaction data
          } else {
            // Handle common transaction aggregates
            switch (variable.name) {
              case 'regularBonusTotal':
                value = params.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
                break;
              case 'deductionsTotal':
                value = params.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
                break;
              case 'loansTotal':
                value = params.loans.reduce((sum, loan) => sum + loan.amount, 0);
                break;
            }
          }
          break;
        case 'constant':
          // Use the default value, already set
          break;
        default:
          // Use default value if no source or unknown source
          break;
      }
      
      // Store the final computed value in context
      context[variable.name] = value;
    }
    
    // Ensure we always have these critical values in the context
    // even if not explicitly defined as variables
    if (context['regularBonusTotal'] === undefined) {
      context['regularBonusTotal'] = params.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    }
    if (context['deductionsTotal'] === undefined) {
      context['deductionsTotal'] = params.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    }
    if (context['loansTotal'] === undefined) {
      context['loansTotal'] = params.loans.reduce((sum, loan) => sum + loan.amount, 0);
    }
    if (context['salesAmount'] === undefined && params.salesAmount !== undefined) {
      context['salesAmount'] = params.salesAmount;
    }
  }
  
  /**
   * Helper method to get a nested property from an object
   */
  private getNestedProperty(obj: Record<string, unknown>, path: string): unknown {
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
    
    return current;
  }

  /**
   * Helper method to convert any value to a boolean
   */
  private convertToBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (typeof value === 'string') {
      const lowercased = value.toLowerCase();
      return lowercased === 'true' || lowercased === 'yes' || lowercased === '1';
    }
    return !!value; // Default conversion to boolean
  }

  /**
   * Helper method to convert any value to a Date object
   */
  private convertToDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    if (typeof value === 'string') {
      return new Date(value);
    }
    return new Date(); // Default to current date/time if invalid
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
      // Comparison operators
      case 'equal':
        if (evaluatedParams.length !== 2) {
          throw new Error('Equal operator requires exactly 2 parameters');
        }
        return evaluatedParams[0] === evaluatedParams[1] ? 1 : 0;
      case 'notEqual':
        if (evaluatedParams.length !== 2) {
          throw new Error('Not Equal operator requires exactly 2 parameters');
        }
        return evaluatedParams[0] !== evaluatedParams[1] ? 1 : 0;
      case 'greaterThan':
        if (evaluatedParams.length !== 2) {
          throw new Error('Greater Than operator requires exactly 2 parameters');
        }
        return evaluatedParams[0] > evaluatedParams[1] ? 1 : 0;
      case 'lessThan':
        if (evaluatedParams.length !== 2) {
          throw new Error('Less Than operator requires exactly 2 parameters');
        }
        return evaluatedParams[0] < evaluatedParams[1] ? 1 : 0;
      case 'greaterThanOrEqual':
        if (evaluatedParams.length !== 2) {
          throw new Error('Greater Than Or Equal operator requires exactly 2 parameters');
        }
        return evaluatedParams[0] >= evaluatedParams[1] ? 1 : 0;
      case 'lessThanOrEqual':
        if (evaluatedParams.length !== 2) {
          throw new Error('Less Than Or Equal operator requires exactly 2 parameters');
        }
        return evaluatedParams[0] <= evaluatedParams[1] ? 1 : 0;
      // Logical operators
      case 'and':
        if (evaluatedParams.length < 2) {
          throw new Error('And operator requires at least 2 parameters');
        }
        return evaluatedParams.every(param => !!param) ? 1 : 0;
      case 'or':
        if (evaluatedParams.length < 2) {
          throw new Error('Or operator requires at least 2 parameters');
        }
        return evaluatedParams.some(param => !!param) ? 1 : 0;
      case 'not':
        if (evaluatedParams.length !== 1) {
          throw new Error('Not operator requires exactly 1 parameter');
        }
        return !evaluatedParams[0] ? 1 : 0;
      // Mathematical functions
      case 'round':
        if (evaluatedParams.length !== 1) {
          throw new Error('Round operator requires exactly 1 parameter');
        }
        return Math.round(evaluatedParams[0]);
      case 'abs':
        if (evaluatedParams.length !== 1) {
          throw new Error('Abs operator requires exactly 1 parameter');
        }
        return Math.abs(evaluatedParams[0]);
      case 'percent':
        if (evaluatedParams.length !== 2) {
          throw new Error('Percent operator requires exactly 2 parameters: value, percentage');
        }
        return (evaluatedParams[0] * evaluatedParams[1]) / 100;
      default:
        throw new Error(`Unsupported operator type: ${operator.type}`);
    }
  }
} 
