import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  Save,
  ChevronUp,
  ChevronDown,
  Calculator,
  GripVertical,
  ArrowRight,
  Layers,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { FormulaVariable, FormulaStep, FormulaPlan, FormulaOperator } from '@/lib/salary/types/salary';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import { FormulaPlanPreview } from './FormulaPlanPreview';
import { FormulaValidator } from '@/lib/salary/utils/FormulaValidator';
import { EmployeePathBuilder } from './EmployeePathBuilder';
import { StepDependencyVisualizer } from './StepDependencyVisualizer';

interface FormulaPlanBuilderProps {
  initialPlan?: FormulaPlan;
  onSave: (plan: FormulaPlan) => void;
}

// Valid operation types for the formula
const OPERATION_TYPES = [
  // Arithmetic operations
  { value: 'add', label: 'Add (+)', group: 'arithmetic' },
  { value: 'subtract', label: 'Subtract (-)', group: 'arithmetic' },
  { value: 'multiply', label: 'Multiply (×)', group: 'arithmetic' },
  { value: 'divide', label: 'Divide (÷)', group: 'arithmetic' },
  { value: 'percent', label: 'Percentage (%)', group: 'arithmetic' },
  
  // Math functions
  { value: 'round', label: 'Round', group: 'function' },
  { value: 'abs', label: 'Absolute Value', group: 'function' },
  { value: 'max', label: 'Maximum', group: 'function' },
  { value: 'min', label: 'Minimum', group: 'function' },
  
  // Comparison operations
  { value: 'equal', label: 'Equal (=)', group: 'comparison' },
  { value: 'notEqual', label: 'Not Equal (≠)', group: 'comparison' },
  { value: 'greaterThan', label: 'Greater Than (>)', group: 'comparison' },
  { value: 'lessThan', label: 'Less Than (<)', group: 'comparison' },
  { value: 'greaterThanOrEqual', label: 'Greater Than or Equal (≥)', group: 'comparison' },
  { value: 'lessThanOrEqual', label: 'Less Than or Equal (≤)', group: 'comparison' },
  
  // Logical operations
  { value: 'and', label: 'AND', group: 'logical' },
  { value: 'or', label: 'OR', group: 'logical' },
  { value: 'not', label: 'NOT', group: 'logical' },
  
  // Conditional
  { value: 'if', label: 'If/Else', group: 'conditional' }
];

const OPERATION_GROUPS = [
  { id: 'arithmetic', label: 'Arithmetic' },
  { id: 'function', label: 'Functions' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'logical', label: 'Logical' },
  { id: 'conditional', label: 'Conditional' }
];

// Predefined variable categories
const VARIABLE_CATEGORIES = [
  { id: 'base', label: 'Base Salary', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'sales', label: 'Sales', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'commission', label: 'Commission', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'bonus', label: 'Bonuses', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'deduction', label: 'Deductions', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'employee', label: 'Employee', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'custom', label: 'Custom', color: 'bg-gray-50 text-gray-700 border-gray-200' }
];

export const FormulaPlanBuilder = ({ initialPlan, onSave }: FormulaPlanBuilderProps) => {
  // State for variables
  const [variables, setVariables] = useState<FormulaVariable[]>(
    initialPlan?.variables || [
      // Default variables - now with categories and data types
      { 
        name: 'baseSalary', 
        description: 'Base salary amount', 
        defaultValue: 0, 
        source: 'constant',
        dataType: 'number',
        category: 'base'
      },
      { 
        name: 'salesAmount', 
        description: 'Total sales amount', 
        source: 'sales',
        dataType: 'number',
        category: 'sales'
      },
      { 
        name: 'commissionRate', 
        description: 'Commission rate (e.g., 0.1 for 10%)', 
        defaultValue: 0.1, 
        source: 'constant',
        dataType: 'number',
        category: 'commission'
      },
      { 
        name: 'threshold', 
        description: 'Sales threshold for commission', 
        defaultValue: 0, 
        source: 'constant',
        dataType: 'number',
        category: 'commission'
      },
      { 
        name: 'regularBonusTotal', 
        description: 'Total bonus amount', 
        source: 'transaction',
        dataType: 'number',
        category: 'bonus'
      },
      { 
        name: 'deductionsTotal', 
        description: 'Total deductions amount', 
        source: 'transaction',
        dataType: 'number',
        category: 'deduction'
      },
      { 
        name: 'loansTotal', 
        description: 'Total loans amount', 
        source: 'transaction',
        dataType: 'number',
        category: 'deduction'
      }
    ]
  );

  // State for calculation steps - now with proper setter
  const [steps, setSteps] = useState<FormulaStep[]>(
    initialPlan?.steps || [
      // Default step for commission calculation
      {
        id: '1',
        name: 'Calculate Commission',
        description: 'Calculate commission based on sales amount above threshold',
        operation: {
          type: 'multiply',
          parameters: [
            {
              id: 'commission-base',
              name: 'Commission Base',
              operation: {
                type: 'max',
                parameters: [
                  {
                    id: 'sales-threshold-diff',
                    name: 'Sales Above Threshold',
                    operation: {
                      type: 'subtract',
                      parameters: ['salesAmount', 'threshold']
                    }
                  },
                  0
                ]
              }
            },
            'commissionRate'
          ]
        },
        result: 'commission'
      },
      // Default step for total salary calculation
      {
        id: '2',
        name: 'Calculate Total Salary',
        description: 'Add base salary and commission, subtract deductions',
        operation: {
          type: 'subtract',
          parameters: [
            {
              id: 'gross-salary',
              name: 'Gross Salary',
              operation: {
                type: 'add',
                parameters: ['baseSalary', 'commission', 'regularBonusTotal']
              }
            },
            {
              id: 'total-deductions',
              name: 'Total Deductions',
              operation: {
                type: 'add',
                parameters: ['deductionsTotal', 'loansTotal']
              }
            }
          ]
        },
        result: 'totalSalary'
      }
    ]
  );

  const [outputVariable, setOutputVariable] = useState<string>(
    initialPlan?.outputVariable || 'totalSalary'
  );

  // State for nested operation builder
  const [nestedBuilderOpen, setNestedBuilderOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [currentParamIndex, setCurrentParamIndex] = useState(-1);
  const [nestedOperation, setNestedOperation] = useState<FormulaOperator>({
    type: 'add',
    parameters: ['0', '0']
  });

  // Variable management state
  const [activeVarCategory, setActiveVarCategory] = useState<string>('all');
  const [newVariableData, setNewVariableData] = useState<FormulaVariable>({
    name: '',
    description: '',
    defaultValue: 0,
    source: 'constant',
    dataType: 'number',
    category: 'custom'
  });
  const [showNewVariableForm, setShowNewVariableForm] = useState(false);

  const [showPreview, setShowPreview] = useState(false);

  // Add validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  
  // Validate the current formula whenever relevant parts change
  useEffect(() => {
    validateFormula();
  }, [steps, variables, outputVariable]);
  
  // Helper to validate the formula and organize errors by step/variable
  const validateFormula = () => {
    const formulaPlan: FormulaPlan = {
      variables,
      steps,
      outputVariable
    };
    
    const validationResult = FormulaValidator.validateFormulaPlan(formulaPlan);
    
    // Group errors by step ID and variable name
    const errors: Record<string, string[]> = {};
    
    // Process errors
    for (const error of validationResult.errors) {
      if (error.stepId) {
        if (!errors[`step-${error.stepId}`]) {
          errors[`step-${error.stepId}`] = [];
        }
        errors[`step-${error.stepId}`].push(error.message);
      } else if (error.variableName) {
        if (!errors[`var-${error.variableName}`]) {
          errors[`var-${error.variableName}`] = [];
        }
        errors[`var-${error.variableName}`].push(error.message);
      } else {
        // General errors
        if (!errors['general']) {
          errors['general'] = [];
        }
        errors['general'].push(error.message);
      }
    }
    
    setValidationErrors(errors);
  };
  
  // Helper to get errors for a specific step
  const getStepErrors = (stepId: string): string[] => {
    return validationErrors[`step-${stepId}`] || [];
  };
  
  // Helper to get errors for a specific variable
  const getVariableErrors = (variableName: string): string[] => {
    return validationErrors[`var-${variableName}`] || [];
  };
  
  // Helper to check if a step is valid
  const isStepValid = (stepId: string): boolean => {
    return !validationErrors[`step-${stepId}`] || validationErrors[`step-${stepId}`].length === 0;
  };
  
  // Helper to check if a variable is valid
  const isVariableValid = (variableName: string): boolean => {
    return !validationErrors[`var-${variableName}`] || validationErrors[`var-${variableName}`].length === 0;
  };

  // Add a new variable
  const addVariable = () => {
    if (showNewVariableForm) {
      // Validate the new variable
      if (!newVariableData.name) {
        toast({
          title: 'Name required',
          description: 'Please provide a variable name',
          variant: 'destructive'
        });
        return;
      }
      
      // Check for duplicate name
      if (variables.some(v => v.name === newVariableData.name)) {
        toast({
          title: 'Duplicate name',
          description: `Variable "${newVariableData.name}" already exists`,
          variant: 'destructive'
        });
        return;
      }
      
      // Add the new variable
      setVariables([...variables, { ...newVariableData }]);
      
      // Reset the form
      setNewVariableData({
        name: '',
        description: '',
        defaultValue: 0,
        source: 'constant',
        dataType: 'number',
        category: 'custom'
      });
      
      setShowNewVariableForm(false);
    } else {
      setShowNewVariableForm(true);
    }
  };

  // Cancel adding a new variable
  const cancelAddVariable = () => {
    setShowNewVariableForm(false);
    setNewVariableData({
      name: '',
      description: '',
      defaultValue: 0,
      source: 'constant',
      dataType: 'number',
      category: 'custom'
    });
  };

  // Update a variable's field
  const updateVariable = (index: number, field: keyof FormulaVariable, value: string | number) => {
    const newVariables = [...variables];
    
    if (field === 'defaultValue') {
      newVariables[index][field] = Number(value);
    } else if (field === 'source') {
      // Ensure source is one of the valid source types
      const sourceValue = value as 'constant' | 'employee' | 'sales' | 'transaction';
      newVariables[index][field] = sourceValue;
      
      // Clear path when changing source from employee to something else
      if (sourceValue !== 'employee' && newVariables[index].path) {
        newVariables[index].path = '';
      }
    } else if (field === 'dataType') {
      // Ensure dataType is one of the valid types
      const dataTypeValue = value as 'number' | 'boolean' | 'date' | 'text';
      newVariables[index][field] = dataTypeValue;
    } else {
      newVariables[index][field as 'name' | 'description' | 'path' | 'category'] = value as string;
    }
    
    setVariables(newVariables);
  };

  // Update new variable form data
  const updateNewVariable = (field: keyof FormulaVariable, value: string | number) => {
    setNewVariableData(prev => {
      if (field === 'defaultValue') {
        return { ...prev, [field]: Number(value) };
      } else if (field === 'source') {
        return { ...prev, [field]: value as 'constant' | 'employee' | 'sales' | 'transaction' };
      } else if (field === 'dataType') {
        return { ...prev, [field]: value as 'number' | 'boolean' | 'date' | 'text' };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  // Remove a variable
  const removeVariable = (index: number) => {
    const varName = variables[index].name;
    
    // Check if variable is used in any step
    const isUsed = steps.some(step => 
      JSON.stringify(step).includes(`"${varName}"`) || 
      step.result === varName
    );
    
    if (isUsed) {
      toast({
        title: 'Cannot remove variable',
        description: `Variable "${varName}" is used in one or more calculation steps`,
        variant: 'destructive'
      });
      return;
    }
    
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables);
  };

  // Add a new calculation step
  const addStep = () => {
    const newStep: FormulaStep = {
      id: uuidv4(),
      name: `Step ${steps.length + 1}`,
      description: 'New calculation step',
      operation: {
        type: 'add',
        parameters: ['0', '0']
      },
      result: `result${steps.length + 1}`
    };
    
    setSteps([...steps, newStep]);
  };

  // Update a step's basic properties (name, description, result)
  const updateStepBasic = (index: number, field: 'name' | 'description' | 'result', value: string) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  // Update a step's operation type
  const updateStepOperationType = (index: number, type: string) => {
    const newSteps = [...steps];
    const step = newSteps[index];
    
    if (typeof step.operation === 'object') {
      // Create appropriate parameters based on operation type
      let parameters: (string | number | FormulaStep)[] = [];
      
      switch (type) {
        // Arithmetic operators - two or more parameters
        case 'add':
        case 'multiply':
          parameters = ['0', '0'];
          break;
        
        // Binary operators - exactly two parameters
        case 'subtract':
        case 'divide':
        case 'percent':
        case 'equal':
        case 'notEqual':
        case 'greaterThan':
        case 'lessThan':
        case 'greaterThanOrEqual':
        case 'lessThanOrEqual':
          parameters = ['0', '0'];
          break;
        
        // Unary operators - exactly one parameter
        case 'round':
        case 'abs':
        case 'not':
          parameters = ['0'];
          break;
        
        // Multi-parameter comparison operators
        case 'max':
        case 'min':
          parameters = ['0', '0'];
          break;
        
        // Logical operators - two or more parameters
        case 'and':
        case 'or':
          parameters = ['0', '0'];
          break;
        
        // Conditional operators
        case 'if':
          // Condition, true value, false value
          parameters = ['0', '1', '0'];
          break;
          
        default:
          parameters = ['0'];
      }
      
      // Update the operation
      step.operation = {
        type: type as FormulaOperator['type'],
        parameters
      };
      
      setSteps(newSteps);
    }
  };

  // Update a parameter value in a step's operation
  const updateStepParameter = (stepIndex: number, paramIndex: number, value: string) => {
    const newSteps = [...steps];
    const step = newSteps[stepIndex];
    
    if (typeof step.operation === 'object') {
      // Create a new parameters array with the updated value
      const newParams = [...step.operation.parameters];
      
      // Check if the value is a number
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && value.trim() === numValue.toString()) {
        // It's a number, store as number
        newParams[paramIndex] = numValue;
      } else {
        // It's a variable name or other string, store as string
        newParams[paramIndex] = value;
      }
      
      step.operation.parameters = newParams;
      setSteps(newSteps);
    }
  };

  // Add a parameter to a step's operation (for operations that can have variable parameters)
  const addStepParameter = (stepIndex: number) => {
    const newSteps = [...steps];
    const step = newSteps[stepIndex];
    
    if (typeof step.operation === 'object') {
      step.operation.parameters.push('0');
      setSteps(newSteps);
    }
  };

  // Remove a parameter from a step's operation
  const removeStepParameter = (stepIndex: number, paramIndex: number) => {
    const newSteps = [...steps];
    const step = newSteps[stepIndex];
    
    if (typeof step.operation === 'object') {
      // Check minimum parameters based on operation type
      const minParams = getMinParamsForOperationType(step.operation.type);
      
      if (step.operation.parameters.length <= minParams) {
        toast({
          title: 'Cannot remove parameter',
          description: `This operation requires at least ${minParams} parameter(s)`,
          variant: 'destructive'
        });
        return;
      }
      
      step.operation.parameters.splice(paramIndex, 1);
      setSteps(newSteps);
    }
  };

  // Move a step up or down in the list
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === steps.length - 1)) {
      return;
    }
    
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the steps
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    setSteps(newSteps);
  };

  // Remove a step
  const removeStep = (index: number) => {
    // Check if the step's result is used in other steps or as the output variable
    const stepToRemove = steps[index];
    const resultVar = stepToRemove.result;
    
    if (resultVar) {
      // Check if used in other steps
      const isUsedInOtherSteps = steps.some((step, i) => 
        i !== index && JSON.stringify(step).includes(`"${resultVar}"`)
      );
      
      // Check if used as output variable
      const isOutputVariable = resultVar === outputVariable;
      
      if (isUsedInOtherSteps || isOutputVariable) {
        toast({
          title: 'Cannot remove step',
          description: `The result "${resultVar}" is used ${isOutputVariable ? 'as the output variable' : 'in other steps'}`,
          variant: 'destructive'
        });
        return;
      }
    }
    
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  // Helper function to determine minimum parameters for operation types
  const getMinParamsForOperationType = (type: string): number => {
    switch (type) {
      // Multi-parameter operations
      case 'add':
      case 'multiply':
      case 'and':
      case 'or':
        return 2;
      
      // Binary operations
      case 'subtract':
      case 'divide':
      case 'percent':
      case 'equal':
      case 'notEqual':
      case 'greaterThan':
      case 'lessThan':
      case 'greaterThanOrEqual':
      case 'lessThanOrEqual':
        return 2;
      
      // Unary operations
      case 'round':
      case 'abs':
      case 'not':
        return 1;
      
      // Special multi-parameter operations
      case 'max':
      case 'min':
        return 1;
      
      // Conditional
      case 'if':
        return 3;
        
      default:
        return 1;
    }
  };

  // Get parameter label based on operation type and parameter index
  const getParameterLabel = (type: string, index: number): string => {
    switch (type) {
      // Arithmetic operations
      case 'add':
        return `Operand ${index + 1}`;
      case 'subtract':
        return index === 0 ? 'Minuend' : 'Subtrahend';
      case 'multiply':
        return `Factor ${index + 1}`;
      case 'divide':
        return index === 0 ? 'Dividend' : 'Divisor';
      case 'percent':
        return index === 0 ? 'Value' : 'Percentage';
      
      // Math functions
      case 'round':
      case 'abs':
        return 'Value';
      case 'max':
      case 'min':
        return `Value ${index + 1}`;
      
      // Comparison operations
      case 'equal':
      case 'notEqual':
      case 'greaterThan':
      case 'lessThan':
      case 'greaterThanOrEqual':
      case 'lessThanOrEqual':
        return index === 0 ? 'Left Value' : 'Right Value';
      
      // Logical operations
      case 'and':
      case 'or':
        return `Condition ${index + 1}`;
      case 'not':
        return 'Condition';
      
      // Conditional
      case 'if':
        if (index === 0) return 'Condition';
        if (index === 1) return 'True Value';
        return 'False Value';
        
      default:
        return `Parameter ${index + 1}`;
    }
  };

  // Create a new nested operation for a parameter
  const createNestedOperation = (stepIndex: number, paramIndex: number) => {
    setCurrentStepIndex(stepIndex);
    setCurrentParamIndex(paramIndex);
    
    // Initialize with a simple addition operation
    setNestedOperation({
      type: 'add',
      parameters: ['0', '0']
    });
    
    setNestedBuilderOpen(true);
  };

  // Save the nested operation to the parameter
  const saveNestedOperation = () => {
    if (currentStepIndex >= 0 && currentParamIndex >= 0) {
      const newSteps = [...steps];
      const step = newSteps[currentStepIndex];
      
      if (typeof step.operation === 'object') {
        // Create a unique ID for this nested operation
        const nestedStep: FormulaStep = {
          id: uuidv4(),
          name: `Nested ${getOperationLabel(nestedOperation.type)}`,
          operation: { ...nestedOperation }
        };
        
        // Update the parameter with the nested step
        const newParams = [...step.operation.parameters];
        newParams[currentParamIndex] = nestedStep;
        step.operation.parameters = newParams;
        
        setSteps(newSteps);
      }
    }
    
    // Reset and close the dialog
    setNestedBuilderOpen(false);
    setCurrentStepIndex(-1);
    setCurrentParamIndex(-1);
  };

  // Update nested operation type
  const updateNestedOperationType = (type: string) => {
    // Create appropriate parameters based on operation type
    let parameters: (string | number)[] = [];
    
    switch (type) {
      // Similar to updateStepOperationType, but simpler since we don't need
      // to handle recursive nesting at this level
      case 'add':
      case 'multiply':
        parameters = ['0', '0'];
        break;
      case 'subtract':
      case 'divide':
      case 'percent':
      case 'equal':
      case 'notEqual':
      case 'greaterThan':
      case 'lessThan':
      case 'greaterThanOrEqual':
      case 'lessThanOrEqual':
        parameters = ['0', '0'];
        break;
      case 'round':
      case 'abs':
      case 'not':
        parameters = ['0'];
        break;
      case 'max':
      case 'min':
        parameters = ['0', '0'];
        break;
      case 'and':
      case 'or':
        parameters = ['0', '0'];
        break;
      case 'if':
        parameters = ['0', '1', '0'];
        break;
      default:
        parameters = ['0'];
    }
    
    // Update the operation
    setNestedOperation({
      type: type as FormulaOperator['type'],
      parameters
    });
  };

  // Update a parameter in the nested operation
  const updateNestedParameter = (paramIndex: number, value: string) => {
    // Create a new parameters array with the updated value
    const newParams = [...nestedOperation.parameters];
    
    // Check if the value is a number
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && value.trim() === numValue.toString()) {
      // It's a number, store as number
      newParams[paramIndex] = numValue;
    } else {
      // It's a variable name or other string, store as string
      newParams[paramIndex] = value;
    }
    
    setNestedOperation({
      ...nestedOperation,
      parameters: newParams
    });
  };

  // Add a parameter to the nested operation
  const addNestedParameter = () => {
    if (['add', 'multiply', 'max', 'min', 'and', 'or'].includes(nestedOperation.type)) {
      setNestedOperation({
        ...nestedOperation,
        parameters: [...nestedOperation.parameters, '0']
      });
    }
  };

  // Remove a parameter from the nested operation
  const removeNestedParameter = (paramIndex: number) => {
    const minParams = getMinParamsForOperationType(nestedOperation.type);
    
    if (nestedOperation.parameters.length <= minParams) {
      toast({
        title: 'Cannot remove parameter',
        description: `This operation requires at least ${minParams} parameter(s)`,
        variant: 'destructive'
      });
      return;
    }
    
    const newParams = [...nestedOperation.parameters];
    newParams.splice(paramIndex, 1);
    
    setNestedOperation({
      ...nestedOperation,
      parameters: newParams
    });
  };

  // Helper function to get a display name for operation types
  const getOperationLabel = (type: string): string => {
    const operation = OPERATION_TYPES.find(op => op.value === type);
    return operation ? operation.label : type;
  };

  // Helper function to render the parameter in a user-friendly way
  const renderParameterValue = (param: string | number | FormulaStep): string => {
    if (typeof param === 'object') {
      return `[${param.name || 'Nested Operation'}]`;
    }
    return param.toString();
  };

  // Helper to check if a parameter is a nested operation
  const isNestedOperation = (param: string | number | FormulaStep): param is FormulaStep => {
    return typeof param === 'object' && param !== null && 'operation' in param;
  };

  // Save the formula plan
  const handleSave = () => {
    // Validate the formula
    validateFormula();
    
    // Check if there are any general errors
    if (validationErrors['general'] && validationErrors['general'].length > 0) {
      toast({
        title: 'Cannot Save Formula',
        description: validationErrors['general'].join('\n'),
        variant: 'destructive'
      });
      return;
    }
    
    // Check if there are any step or variable errors
    const hasErrors = Object.keys(validationErrors).some(key => 
      validationErrors[key] && validationErrors[key].length > 0
    );
    
    if (hasErrors) {
      toast({
        title: 'Validation Errors',
        description: 'Please fix all validation errors before saving',
        variant: 'destructive'
      });
      return;
    }
    
    // If no errors, proceed with save
    onSave({
      variables,
      steps,
      outputVariable
    });
    
    toast({
      title: 'Formula Saved',
      description: 'The formula has been saved successfully',
      variant: 'default'
    });
  };

  // Get category color
  const getCategoryColor = (categoryId: string): string => {
    const category = VARIABLE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.color : 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Get variables filtered by category
  const getFilteredVariables = (): FormulaVariable[] => {
    if (activeVarCategory === 'all') {
      return variables;
    }
    return variables.filter(v => v.category === activeVarCategory);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Variables</CardTitle>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={addVariable}
                    variant={showNewVariableForm ? "default" : "outline"}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {showNewVariableForm ? "Save Variable" : "Add Variable"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showNewVariableForm ? "Save new variable" : "Add a new variable"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {showNewVariableForm && (
              <Button variant="ghost" size="sm" onClick={cancelAddVariable}>
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showNewVariableForm && (
            <div className="mb-6 p-4 border rounded-md bg-muted/30">
              <h4 className="text-sm font-medium mb-3">New Variable</h4>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <Label htmlFor="new-var-name" className="text-xs mb-1 block">Name</Label>
                  <Input
                    id="new-var-name"
                    placeholder="Variable name"
                    value={newVariableData.name}
                    onChange={e => updateNewVariable('name', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="new-var-description" className="text-xs mb-1 block">Description</Label>
                  <Input
                    id="new-var-description"
                    placeholder="Description"
                    value={newVariableData.description}
                    onChange={e => updateNewVariable('description', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="new-var-source" className="text-xs mb-1 block">Source</Label>
                  <Select
                    value={newVariableData.source || 'constant'}
                    onValueChange={value => updateNewVariable('source', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="constant">Constant</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="transaction">Transaction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="new-var-datatype" className="text-xs mb-1 block">Data Type</Label>
                  <Select
                    value={newVariableData.dataType || 'number'}
                    onValueChange={value => updateNewVariable('dataType', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Data Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="new-var-category" className="text-xs mb-1 block">Category</Label>
                  <Select
                    value={newVariableData.category || 'custom'}
                    onValueChange={value => updateNewVariable('category', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {VARIABLE_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {(newVariableData.source === 'constant' && newVariableData.dataType === 'number') && (
                  <div className="col-span-2">
                    <Label htmlFor="new-var-default" className="text-xs mb-1 block">Default Value</Label>
                    <Input
                      id="new-var-default"
                      type="number"
                      placeholder="Default"
                      value={newVariableData.defaultValue?.toString() || '0'}
                      onChange={e => updateNewVariable('defaultValue', e.target.value)}
                      className="h-9"
                    />
                  </div>
                )}
                
                {newVariableData.source === 'employee' ? (
                  <div className="col-span-3">
                    <Label htmlFor="new-var-path" className="text-xs mb-1 block">Property Path</Label>
                    <EmployeePathBuilder
                      value={newVariableData.path || ''}
                      onChange={(value) => updateNewVariable('path', value)}
                    />
                  </div>
                ) : newVariableData.source === 'sales' || newVariableData.source === 'transaction' ? (
                  <div className="col-span-3">
                    <Label htmlFor="new-var-path" className="text-xs mb-1 block">Property Path</Label>
                    <Input
                      id="new-var-path"
                      placeholder={newVariableData.source === 'sales' ? 'e.g., amount or period' : 'e.g., bonus.type'}
                      value={newVariableData.path || ''}
                      onChange={e => updateNewVariable('path', e.target.value)}
                      className="h-9"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )}
          
          <div className="mb-4 overflow-hidden">
            <Tabs
              value={activeVarCategory}
              onValueChange={setActiveVarCategory}
              className="w-full"
            >
              <div className="relative overflow-auto">
                <TabsList className="flex w-max min-w-full px-1 py-1 sm:grid sm:grid-cols-8 sm:w-full">
                  <TabsTrigger value="all" className="text-xs flex-shrink-0">All</TabsTrigger>
                  {VARIABLE_CATEGORIES.map(category => (
                    <TabsTrigger key={category.id} value={category.id} className="text-xs flex-shrink-0 whitespace-nowrap">
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          </div>
          
          <div className="space-y-4">
            {/* Variable validation errors */}
            {Object.keys(validationErrors)
              .filter(key => key.startsWith('var-'))
              .length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Variable Errors</AlertTitle>
                <AlertDescription>
                  Please fix the following variable-related errors:
                  <ul className="list-disc pl-4 mt-2">
                    {Object.keys(validationErrors)
                      .filter(key => key.startsWith('var-'))
                      .flatMap(key => {
                        const varName = key.replace('var-', '');
                        return validationErrors[key].map((error, i) => (
                          <li key={`${varName}-${i}`}>
                            <strong>{varName}:</strong> {error}
                          </li>
                        ));
                      })}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Variables table */}
            <div className="border rounded-md overflow-hidden">
              {/* Table header - desktop view */}
              <div className="hidden sm:grid grid-cols-12 gap-2 p-2 font-medium text-sm bg-muted">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Default</div>
                <div className="col-span-2">Actions</div>
              </div>
              
              {/* Mobile filter tabs */}
              <div className="sm:hidden p-2 bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">Variables</div>
                  <div className="text-xs text-muted-foreground">
                    {getFilteredVariables().length} items
                  </div>
                </div>
              </div>
              
              {getFilteredVariables().map((variable, index) => {
                const hasErrors = !isVariableValid(variable.name);
                
                return (
                  <div 
                    key={index} 
                    className={`border-t ${
                      hasErrors ? 'bg-red-50' : index % 2 === 0 ? 'bg-gray-50' : ''
                    }`}
                  >
                    {/* Desktop view */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 p-2 items-center text-sm">
                      <div className="col-span-3 font-medium flex items-center gap-2">
                        {variable.name}
                        {hasErrors && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[200px]">
                                <ul className="list-disc pl-4">
                                  {getVariableErrors(variable.name).map((error, i) => (
                                    <li key={i}>{error}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Badge 
                          variant="outline" 
                          className={getCategoryColor(variable.category || 'custom')}
                        >
                          {variable.category || 'custom'}
                        </Badge>
                      </div>
                      <div className="col-span-3 text-muted-foreground">
                        {variable.description}
                      </div>
                      <div className="col-span-2">
                        {variable.source || 'constant'}
                      </div>
                      <div className="col-span-2">
                        {variable.defaultValue !== undefined ? variable.defaultValue.toString() : '—'}
                      </div>
                      <div className="col-span-2 flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeVariable(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Mobile view */}
                    <div className="sm:hidden p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium flex items-center gap-2">
                          {variable.name}
                          {hasErrors && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeVariable(index)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {variable.description}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge 
                          variant="outline" 
                          className={getCategoryColor(variable.category || 'custom')}
                        >
                          {variable.category || 'custom'}
                        </Badge>
                        
                        <Badge variant="outline" className="bg-gray-50">
                          {variable.source || 'constant'}
                        </Badge>
                        
                        {variable.defaultValue !== undefined && (
                          <Badge variant="outline" className="bg-gray-50">
                            Default: {variable.defaultValue.toString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Steps</CardTitle>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={addStep}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new calculation step</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Step validation errors */}
            {Object.keys(validationErrors)
              .filter(key => key.startsWith('step-'))
              .length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Step Errors</AlertTitle>
                <AlertDescription>
                  Please fix the following step-related errors:
                  <ul className="list-disc pl-4 mt-2">
                    {Object.keys(validationErrors)
                      .filter(key => key.startsWith('step-'))
                      .flatMap(key => {
                        const stepId = key.replace('step-', '');
                        return validationErrors[key].map((error, i) => (
                          <li key={`${stepId}-${i}`}>
                            <strong>{stepId}:</strong> {error}
                          </li>
                        ));
                      })}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Steps table */}
            <div className="border rounded-md overflow-hidden">
              {/* Desktop header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 p-2 font-medium text-sm bg-muted">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Operation</div>
                <div className="col-span-2">Result</div>
                <div className="col-span-2">Actions</div>
              </div>
              
              {/* Mobile header */}
              <div className="sm:hidden p-2 bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">Formula Steps</div>
                  <div className="text-xs text-muted-foreground">
                    {steps.length} steps
                  </div>
                </div>
              </div>
              
              {steps.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  No steps defined yet. Click "Add Step" to create a calculation step.
                </div>
              )}
              
              {steps.map((step, index) => {
                const hasErrors = !isStepValid(step.id);
                
                return (
                  <div 
                    key={step.id}
                    id={`step-${step.id}`}
                    className={`border-t p-3 sm:p-4 ${
                      hasErrors ? 'bg-red-50' : index % 2 === 0 ? 'bg-gray-50' : ''
                    }`}
                  >
                    {/* Mobile view */}
                    <div className="sm:hidden space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium flex items-center gap-2">
                          {step.name || 'Unnamed Step'}
                          {hasErrors && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8" 
                            onClick={() => moveStep(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8" 
                            onClick={() => moveStep(index, 'down')}
                            disabled={index === steps.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8" 
                            onClick={() => removeStep(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {step.description && (
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 pt-1">
                        {typeof step.operation === 'object' && step.operation !== null && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {getOperationLabel(step.operation.type)}
                          </Badge>
                        )}
                        
                        {step.result && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Result: {step.result}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Desktop view */}
                    <div className="hidden sm:block">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{step.name || 'Unnamed Step'}</h3>
                        {hasErrors && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[200px]">
                                <ul className="list-disc pl-4">
                                  {getStepErrors(step.id).map((error, i) => (
                                    <li key={i}>{error}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      
                      {step.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-12 gap-4 mt-3">
                        <div className="col-span-4">
                          <div className="text-xs font-medium mb-1">Operation</div>
                          <div>
                            {typeof step.operation === 'object' && step.operation !== null 
                              ? getOperationLabel(step.operation.type) 
                              : '—'}
                          </div>
                        </div>
                        
                        <div className="col-span-4">
                          <div className="text-xs font-medium mb-1">Result Variable</div>
                          <div>{step.result || '—'}</div>
                        </div>
                        
                        <div className="col-span-4 flex items-start justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveStep(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveStep(index, 'down')}
                            disabled={index === steps.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeStep(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Output Variable</CardTitle>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview the formula</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Output variable validation errors */}
            {validationErrors['outputVariable'] && validationErrors['outputVariable'].length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Output Variable Error</AlertTitle>
                <AlertDescription>
                  {validationErrors['outputVariable'].join('\n')}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Output variable form */}
            <div className="flex items-center space-x-4">
              <Label htmlFor="output-variable" className="text-xs mb-1 block">Output Variable</Label>
              <Input
                id="output-variable"
                placeholder="Output variable"
                value={outputVariable}
                onChange={e => setOutputVariable(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Formula Preview</CardTitle>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview the formula</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Formula preview */}
            {showPreview && (
              <div className="p-4 border rounded-md">
                <FormulaPlanPreview
                  variables={variables}
                  steps={steps}
                  outputVariable={outputVariable}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Actions</CardTitle>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save the formula</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Save button */}
            <Button
              onClick={handleSave}
              variant="outline"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step Dependencies Section */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle>Step Dependencies</CardTitle>
          <CardDescription>
            Visualize how steps depend on each other and detect circular dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StepDependencyVisualizer
            steps={steps}
            variables={variables}
            outputVariable={outputVariable}
            onStepClick={(stepId) => {
              // Find the index of the step
              const stepIndex = steps.findIndex(s => s.id === stepId);
              if (stepIndex >= 0) {
                // Scroll to that step's card
                const stepEl = document.getElementById(`step-${stepId}`);
                if (stepEl) {
                  stepEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Highlight the step temporarily
                  stepEl.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
                  setTimeout(() => {
                    stepEl.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
                  }, 2000);
                }
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle>Formula Preview</CardTitle>
          <CardDescription>
            Preview and test your formula with sample data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormulaPlanPreview
            variables={variables}
            steps={steps}
            outputVariable={outputVariable}
          />
        </CardContent>
      </Card>
    </div>
  );
}; 