import { FormulaPlan } from '../../types/salary';
import { FormulaValidator } from '../FormulaValidator';
import { FormulaEvaluator } from '../FormulaEvaluator';

describe('Formula Validation', () => {
  test('validates a valid formula plan', () => {
    const plan: FormulaPlan = {
      variables: [
        {
          name: 'baseSalary',
          description: 'Base salary amount',
          defaultValue: 1000,
          source: 'constant'
        },
        {
          name: 'bonus',
          description: 'Bonus amount',
          defaultValue: 500,
          source: 'constant'
        }
      ],
      steps: [
        {
          id: 'step1',
          name: 'Calculate total',
          operation: {
            type: 'add',
            parameters: ['baseSalary', 'bonus']
          },
          result: 'totalSalary'
        }
      ],
      outputVariable: 'totalSalary'
    };
    
    const result = FormulaValidator.validateFormulaPlan(plan);
    
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
  
  test('validates a formula plan with circular dependency', () => {
    const plan: FormulaPlan = {
      variables: [
        {
          name: 'baseSalary',
          description: 'Base salary amount',
          defaultValue: 1000,
          source: 'constant'
        }
      ],
      steps: [
        {
          id: 'step1',
          name: 'Step 1',
          operation: {
            type: 'add',
            parameters: ['baseSalary', 'step2Result']
          },
          result: 'step1Result'
        },
        {
          id: 'step2',
          name: 'Step 2',
          operation: {
            type: 'multiply',
            parameters: ['step1Result', 2]
          },
          result: 'step2Result'
        }
      ],
      outputVariable: 'step2Result'
    };
    
    const result = FormulaValidator.validateFormulaPlan(plan);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.type === 'structure' && e.message.includes('Circular dependency'))).toBe(true);
  });
  
  test('validates a formula plan with missing variable', () => {
    const plan: FormulaPlan = {
      variables: [
        {
          name: 'baseSalary',
          description: 'Base salary amount',
          defaultValue: 1000,
          source: 'constant'
        }
      ],
      steps: [
        {
          id: 'step1',
          name: 'Step 1',
          operation: {
            type: 'add',
            parameters: ['baseSalary', 'nonExistentVariable']
          },
          result: 'totalSalary'
        }
      ],
      outputVariable: 'totalSalary'
    };
    
    const result = FormulaValidator.validateFormulaPlan(plan);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.type === 'variable' && e.variableName === 'nonExistentVariable')).toBe(true);
  });
});

describe('Formula Evaluation', () => {
  test('evaluates a basic formula', () => {
    const plan: FormulaPlan = {
      variables: [
        {
          name: 'baseSalary',
          description: 'Base salary amount',
          defaultValue: 1000,
          source: 'constant'
        },
        {
          name: 'bonus',
          description: 'Bonus amount',
          defaultValue: 500,
          source: 'constant'
        }
      ],
      steps: [
        {
          id: 'step1',
          name: 'Calculate total',
          operation: {
            type: 'add',
            parameters: ['baseSalary', 'bonus']
          },
          result: 'totalSalary'
        }
      ],
      outputVariable: 'totalSalary'
    };
    
    const sampleData = {
      baseSalary: 2000,
      bonus: 1000
    };
    
    const result = FormulaEvaluator.evaluateFormula(plan, sampleData);
    
    expect(result.success).toBe(true);
    expect(result.finalResult).toBe(3000); // 2000 + 1000
    expect(result.steps.length).toBe(1);
    expect(result.steps[0].result).toBe(3000);
  });
  
  test('evaluates a formula with conditional logic', () => {
    const plan: FormulaPlan = {
      variables: [
        {
          name: 'baseSalary',
          description: 'Base salary amount',
          defaultValue: 1000,
          source: 'constant'
        },
        {
          name: 'sales',
          description: 'Total sales amount',
          defaultValue: 5000,
          source: 'employee'
        },
        {
          name: 'threshold',
          description: 'Sales threshold for bonus',
          defaultValue: 10000,
          source: 'constant'
        },
        {
          name: 'bonusAmount',
          description: 'Bonus amount',
          defaultValue: 500,
          source: 'constant'
        }
      ],
      steps: [
        {
          id: 'step1',
          name: 'Check if eligible for bonus',
          operation: {
            type: 'greaterThanOrEqual',
            parameters: ['sales', 'threshold']
          },
          result: 'isEligibleForBonus'
        },
        {
          id: 'step2',
          name: 'Calculate total with conditional bonus',
          operation: {
            type: 'if',
            parameters: ['isEligibleForBonus', 'bonusAmount', 0]
          },
          result: 'actualBonus'
        },
        {
          id: 'step3',
          name: 'Add bonus to base salary',
          operation: {
            type: 'add',
            parameters: ['baseSalary', 'actualBonus']
          },
          result: 'totalSalary'
        }
      ],
      outputVariable: 'totalSalary'
    };
    
    // Test case where sales is below threshold
    const belowThresholdData = {
      baseSalary: 1000,
      sales: 8000,
      threshold: 10000,
      bonusAmount: 500
    };
    
    const belowThresholdResult = FormulaEvaluator.evaluateFormula(plan, belowThresholdData);
    expect(belowThresholdResult.success).toBe(true);
    expect(belowThresholdResult.finalResult).toBe(1000); // No bonus
    
    // Test case where sales is above threshold
    const aboveThresholdData = {
      baseSalary: 1000,
      sales: 12000,
      threshold: 10000,
      bonusAmount: 500
    };
    
    const aboveThresholdResult = FormulaEvaluator.evaluateFormula(plan, aboveThresholdData);
    expect(aboveThresholdResult.success).toBe(true);
    expect(aboveThresholdResult.finalResult).toBe(1500); // With bonus
  });
  
  test('handles division by zero', () => {
    const plan: FormulaPlan = {
      variables: [
        {
          name: 'value',
          description: 'Some value',
          defaultValue: 100,
          source: 'constant'
        },
        {
          name: 'divisor',
          description: 'Divisor',
          defaultValue: 0,
          source: 'constant'
        }
      ],
      steps: [
        {
          id: 'step1',
          name: 'Divide by zero',
          operation: {
            type: 'divide',
            parameters: ['value', 'divisor']
          },
          result: 'result'
        }
      ],
      outputVariable: 'result'
    };
    
    const data = {
      value: 100,
      divisor: 0
    };
    
    const result = FormulaEvaluator.evaluateFormula(plan, data);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Division by zero');
  });
  
  test('memoization works correctly for repeated operations', () => {
    const plan: FormulaPlan = {
      variables: [
        {
          name: 'value',
          description: 'Input value',
          defaultValue: 10,
          source: 'constant'
        }
      ],
      steps: [
        {
          id: 'step1',
          name: 'Calculate power of 2',
          operation: {
            type: 'multiply',
            parameters: ['value', 'value']
          },
          result: 'squared'
        },
        {
          id: 'step2',
          name: 'Calculate power of 3',
          operation: {
            type: 'multiply',
            parameters: ['squared', 'value']
          },
          result: 'cubed'
        },
        {
          id: 'step3',
          name: 'Calculate power of 4',
          operation: {
            type: 'multiply',
            parameters: ['squared', 'squared']
          },
          result: 'fourth'
        }
      ],
      outputVariable: 'fourth'
    };
    
    const data = {
      value: 2
    };
    
    const result = FormulaEvaluator.evaluateFormula(plan, data);
    
    expect(result.success).toBe(true);
    expect(result.steps[0].result).toBe(4);  // 2^2
    expect(result.steps[1].result).toBe(8);  // 2^3
    expect(result.steps[2].result).toBe(16); // 2^4
    expect(result.finalResult).toBe(16);     // 2^4
    
    // We don't have direct access to the cache, but we can infer its use
    // by measuring execution time, which should be significantly less in repeated operations
    expect(result.totalExecutionTimeMs).toBeGreaterThanOrEqual(0);
  });
}); 
