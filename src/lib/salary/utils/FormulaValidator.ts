import { FormulaOperator, FormulaStep, FormulaVariable, FormulaPlan } from '../types/salary';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'syntax' | 'variable' | 'step' | 'structure' | 'logic';
  message: string;
  stepId?: string;
  variableName?: string;
  paramIndex?: number;
}

export interface ValidationWarning {
  type: 'performance' | 'logic' | 'potential_error';
  message: string;
  stepId?: string;
  variableName?: string;
  paramIndex?: number;
}

/**
 * Validates a formula plan for correctness and potential issues
 */
export class FormulaValidator {
  /**
   * Validates the entire formula plan
   */
  static validateFormulaPlan(plan: FormulaPlan): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check that we have at least one step
    if (!plan.steps || plan.steps.length === 0) {
      result.isValid = false;
      result.errors.push({
        type: 'structure',
        message: 'Formula must have at least one step'
      });
    }

    // Check that all steps have a name and operation
    for (const step of plan.steps || []) {
      this.validateStep(step, plan.variables || [], result);
    }

    // Check that the output variable exists
    if (!plan.outputVariable) {
      result.isValid = false;
      result.errors.push({
        type: 'structure',
        message: 'Formula must have an output variable'
      });
    } else {
      const stepResults = plan.steps.map(step => step.result);
      if (!stepResults.includes(plan.outputVariable)) {
        result.isValid = false;
        result.errors.push({
          type: 'variable',
          message: `Output variable "${plan.outputVariable}" is not created by any step`,
          variableName: plan.outputVariable
        });
      }
    }

    // Check for circular dependencies in steps
    this.checkCircularDependencies(plan, result);

    // Check for unused variables
    this.checkUnusedVariables(plan, result);

    return result;
  }

  /**
   * Validates a single formula step
   */
  private static validateStep(
    step: FormulaStep, 
    variables: FormulaVariable[], 
    result: ValidationResult
  ): void {
    // Check step has an ID and name
    if (!step.id) {
      result.isValid = false;
      result.errors.push({
        type: 'step',
        message: 'Step is missing an ID',
        stepId: 'unknown'
      });
    }

    if (!step.name) {
      result.isValid = false;
      result.errors.push({
        type: 'step',
        message: 'Step is missing a name',
        stepId: step.id || 'unknown'
      });
    }

    // Check step has a result variable name
    if (!step.result) {
      result.isValid = false;
      result.errors.push({
        type: 'step',
        message: 'Step is missing a result variable',
        stepId: step.id || 'unknown'
      });
    }

    // If the operation is a string or number, nothing to validate
    if (typeof step.operation === 'string' || typeof step.operation === 'number') {
      return;
    }

    // Check operation type
    const operation = step.operation as FormulaOperator;
    if (!operation.type) {
      result.isValid = false;
      result.errors.push({
        type: 'syntax',
        message: 'Operation is missing a type',
        stepId: step.id || 'unknown'
      });
      return;
    }

    // Validate operation parameters
    this.validateOperationParams(step.id || 'unknown', operation, variables, result);
  }

  /**
   * Validates operation parameters
   */
  private static validateOperationParams(
    stepId: string,
    operation: FormulaOperator,
    variables: FormulaVariable[],
    result: ValidationResult
  ): void {
    // Check operation has parameters
    if (!operation.parameters || operation.parameters.length === 0) {
      result.isValid = false;
      result.errors.push({
        type: 'syntax',
        message: `Operation "${operation.type}" is missing parameters`,
        stepId
      });
      return;
    }

    // Check parameter count for different operations
    const minParams = this.getMinParamsForType(operation.type);
    if (operation.parameters.length < minParams) {
      result.isValid = false;
      result.errors.push({
        type: 'syntax',
        message: `Operation "${operation.type}" requires at least ${minParams} parameters`,
        stepId
      });
    }

    // Check for division by zero potential
    if (operation.type === 'divide') {
      const divisor = operation.parameters[1];
      if (divisor === 0 || divisor === '0') {
        result.isValid = false;
        result.errors.push({
          type: 'logic',
          message: 'Division by zero',
          stepId,
          paramIndex: 1
        });
      } else if (typeof divisor === 'string' && !this.isNumeric(divisor)) {
        // If the divisor is a variable, add a warning
        result.warnings.push({
          type: 'potential_error',
          message: 'Potential division by zero if variable is zero',
          stepId,
          paramIndex: 1,
          variableName: divisor
        });
      }
    }

    // Validate each parameter
    for (let i = 0; i < operation.parameters.length; i++) {
      const param = operation.parameters[i];
      
      // Recursive validation for nested operations
      if (typeof param === 'object' && param !== null) {
        if ('operation' in param && param.operation) {
          this.validateOperationParams(
            stepId,
            param.operation as FormulaOperator,
            variables,
            result
          );
        }
      } 
      // Variable validation for string parameters
      else if (typeof param === 'string' && !this.isNumeric(param)) {
        // Check if the parameter is a valid variable
        const variableExists = variables.some(v => v.name === param);
        if (!variableExists) {
          result.isValid = false;
          result.errors.push({
            type: 'variable',
            message: `Variable "${param}" not found`,
            stepId,
            variableName: param,
            paramIndex: i
          });
        }
      }
    }
  }

  /**
   * Check for circular dependencies in steps
   */
  private static checkCircularDependencies(plan: FormulaPlan, result: ValidationResult): void {
    const stepResults = new Map<string, string[]>();
    
    // Build dependency map: variable -> steps that use it
    for (const step of plan.steps) {
      if (!step.result) continue;
      
      const dependencies = this.extractVariablesFromStep(step);
      stepResults.set(step.result, dependencies);
    }
    
    // Check for circular dependencies
    for (const [varName, dependencies] of stepResults.entries()) {
      if (this.hasCircularDependency(varName, dependencies, stepResults, new Set())) {
        result.isValid = false;
        result.errors.push({
          type: 'structure',
          message: `Circular dependency detected involving variable "${varName}"`,
          variableName: varName
        });
      }
    }
  }

  /**
   * Recursively check for circular dependencies
   */
  private static hasCircularDependency(
    variable: string,
    dependencies: string[],
    dependencyMap: Map<string, string[]>,
    visited: Set<string>
  ): boolean {
    if (visited.has(variable)) {
      return true;
    }
    
    visited.add(variable);
    
    for (const dep of dependencies) {
      if (dependencyMap.has(dep)) {
        const nestedDeps = dependencyMap.get(dep) || [];
        if (this.hasCircularDependency(dep, nestedDeps, dependencyMap, new Set([...visited]))) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Extract all variables used in a step
   */
  private static extractVariablesFromStep(step: FormulaStep): string[] {
    const variables: string[] = [];
    
    if (typeof step.operation === 'string' && !this.isNumeric(step.operation)) {
      variables.push(step.operation);
    } else if (typeof step.operation === 'object' && step.operation !== null) {
      const operation = step.operation as FormulaOperator;
      for (const param of operation.parameters) {
        if (typeof param === 'string' && !this.isNumeric(param)) {
          variables.push(param);
        } else if (typeof param === 'object' && param !== null && 'operation' in param) {
          // Recursively extract variables from nested operations
          const nestedStep = param as unknown as FormulaStep;
          variables.push(...this.extractVariablesFromStep(nestedStep));
        }
      }
    }
    
    return variables;
  }

  /**
   * Check for unused variables
   */
  private static checkUnusedVariables(plan: FormulaPlan, result: ValidationResult): void {
    const usedVariables = new Set<string>();
    
    // Collect all variables used in steps
    for (const step of plan.steps) {
      const stepVars = this.extractVariablesFromStep(step);
      stepVars.forEach(v => usedVariables.add(v));
    }
    
    // Check for unused variables
    for (const variable of plan.variables) {
      if (!usedVariables.has(variable.name)) {
        result.warnings.push({
          type: 'logic',
          message: `Variable "${variable.name}" is not used in any formula step`,
          variableName: variable.name
        });
      }
    }
  }

  /**
   * Get minimum parameters required for an operation type
   */
  private static getMinParamsForType(type: string): number {
    switch (type) {
      case 'add':
      case 'multiply':
      case 'subtract':
      case 'divide':
      case 'equal':
      case 'notEqual':
      case 'greaterThan':
      case 'lessThan':
      case 'greaterThanOrEqual':
      case 'lessThanOrEqual':
      case 'and':
      case 'or':
        return 2;
      
      case 'not':
      case 'round':
      case 'abs':
      case 'percent':
        return 1;
      
      case 'if':
        return 3; // condition, true result, false result
      
      case 'min':
      case 'max':
        return 1;
      
      default:
        return 1;
    }
  }

  /**
   * Check if a string is a numeric value
   */
  private static isNumeric(value: string): boolean {
    return !isNaN(parseFloat(value)) && isFinite(Number(value));
  }
} 
