import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  Save,
  ChevronUp,
  ChevronDown,
  Calculator,
  GripVertical,
  ArrowRight,
  Layers
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
    if (!outputVariable) {
      toast({
        title: 'Output variable required',
        description: 'Please select an output variable for the final result',
        variant: 'destructive'
      });
      return;
    }

    // Check if output variable exists among step results
    const outputExists = steps.some(step => step.result === outputVariable);
    if (!outputExists) {
      toast({
        title: 'Invalid output variable',
        description: `The selected output variable "${outputVariable}" is not produced by any calculation step`,
        variant: 'destructive'
      });
      return;
    }

    const formulaPlan: FormulaPlan = {
      variables,
      steps,
      outputVariable
    };

    onSave(formulaPlan);
    
    toast({
      title: 'Formula saved',
      description: 'The formula plan has been saved successfully',
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
                
                {newVariableData.source === 'employee' && (
                  <div className="col-span-3">
                    <Label htmlFor="new-var-path" className="text-xs mb-1 block">Property Path</Label>
                    <Input
                      id="new-var-path"
                      placeholder="e.g., hire_date or salary.base"
                      value={newVariableData.path || ''}
                      onChange={e => updateNewVariable('path', e.target.value)}
                      className="h-9"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <Tabs
              value={activeVarCategory}
              onValueChange={setActiveVarCategory}
              className="w-full"
            >
              <TabsList className="grid grid-cols-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                {VARIABLE_CATEGORIES.map(category => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs">
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="space-y-4">
            {getFilteredVariables().map((variable, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <div className="space-y-1">
                    <Input
                      placeholder="Name"
                      value={variable.name}
                      onChange={e => updateVariable(index, 'name', e.target.value)}
                    />
                    {variable.category && (
                      <Badge className={`text-xs font-normal ${getCategoryColor(variable.category)}`}>
                        {VARIABLE_CATEGORIES.find(c => c.id === variable.category)?.label || variable.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Description"
                    value={variable.description}
                    onChange={e => updateVariable(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <div className="space-y-1">
                    <Select
                      value={variable.source || 'constant'}
                      onValueChange={value => updateVariable(index, 'source', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="constant">Constant</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="transaction">Transaction</SelectItem>
                      </SelectContent>
                    </Select>
                    {variable.dataType && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {variable.dataType}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {variable.source === 'employee' && (
                  <div className="col-span-2">
                    <Input
                      placeholder="Property Path"
                      value={variable.path || ''}
                      onChange={e => updateVariable(index, 'path', e.target.value)}
                    />
                  </div>
                )}
                
                {variable.source === 'constant' && (
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Default"
                      value={variable.defaultValue?.toString() || '0'}
                      onChange={e => updateVariable(index, 'defaultValue', e.target.value)}
                    />
                  </div>
                )}
                
                <div className="col-span-1 flex justify-end">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Variable Settings</h4>
                          <p className="text-sm text-muted-foreground">
                            Configure advanced settings for this variable
                          </p>
                        </div>
                        
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 items-center gap-2">
                            <Label htmlFor={`var-${index}-type`} className="text-xs">Type</Label>
                            <Select
                              value={variable.dataType || 'number'}
                              onValueChange={value => updateVariable(index, 'dataType', value)}
                            >
                              <SelectTrigger id={`var-${index}-type`} className="col-span-2">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-3 items-center gap-2">
                            <Label htmlFor={`var-${index}-category`} className="text-xs">Category</Label>
                            <Select
                              value={variable.category || 'custom'}
                              onValueChange={value => updateVariable(index, 'category', value)}
                            >
                              <SelectTrigger id={`var-${index}-category`} className="col-span-2">
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
                        </div>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeVariable(index)}
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Remove Variable
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Calculation Steps</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={addStep} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add a new calculation step</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No calculation steps defined yet</p>
                <p className="text-sm">Add a step to define how the salary should be calculated</p>
              </div>
            ) : (
              steps.map((step, index) => (
                <Card key={index} className="border-muted">
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center">
                      <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <Input
                          className="font-medium border-none p-0 h-auto text-base"
                          value={step.name}
                          onChange={e => updateStepBasic(index, 'name', e.target.value)}
                          placeholder="Step Name"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => moveStep(index, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Move step up</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => moveStep(index, 'down')}
                              disabled={index === steps.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Move step down</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeStep(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete step</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4 space-y-4">
                    <Textarea
                      placeholder="Description"
                      value={step.description || ''}
                      onChange={e => updateStepBasic(index, 'description', e.target.value)}
                      className="resize-none h-16 text-sm"
                    />
                    
                    {typeof step.operation === 'object' && (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium w-24">Operation:</span>
                          <Select
                            value={(step.operation as FormulaOperator).type}
                            onValueChange={value => updateStepOperationType(index, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select operation" />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATION_GROUPS.map(group => (
                                <div key={group.id}>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                    {group.label}
                                  </div>
                                  {OPERATION_TYPES
                                    .filter(op => op.group === group.id)
                                    .map(op => (
                                      <SelectItem key={op.value} value={op.value}>
                                        {op.label}
                                      </SelectItem>
                                    ))
                                  }
                                  {group.id !== OPERATION_GROUPS[OPERATION_GROUPS.length - 1].id && (
                                    <div className="h-px bg-muted my-1" />
                                  )}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          {(step.operation as FormulaOperator).parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="flex items-center space-x-2">
                              <span className="text-sm font-medium w-24">
                                {getParameterLabel((step.operation as FormulaOperator).type, paramIndex)}:
                              </span>
                              <div className="flex-1 flex items-center space-x-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-between"
                                    >
                                      <span className="truncate">
                                        {isNestedOperation(param) 
                                          ? `[${param.name || 'Nested Operation'}]` 
                                          : param.toString()}
                                      </span>
                                      <ArrowRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 p-0" align="start">
                                    <div className="grid gap-4 p-4">
                                      <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Parameter Value</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Set a value, variable, or create a nested operation
                                        </p>
                                      </div>
                                      <div className="grid gap-2">
                                        <div className="grid grid-cols-3 gap-2">
                                          <Button 
                                            variant="outline"
                                            onClick={() => updateStepParameter(index, paramIndex, "0")}
                                          >
                                            Number
                                          </Button>
                                          <Button 
                                            variant="outline"
                                            onClick={() => createNestedOperation(index, paramIndex)}
                                          >
                                            <Layers className="mr-2 h-4 w-4" />
                                            Nested
                                          </Button>
                                        </div>
                                        
                                        <div className="grid gap-2">
                                          <h4 className="text-sm font-medium">Enter value or variable:</h4>
                                          <Input
                                            value={isNestedOperation(param) ? '' : param.toString()}
                                            onChange={e => updateStepParameter(index, paramIndex, e.target.value)}
                                            placeholder="Enter value"
                                          />
                                        </div>
                                        
                                        <div className="grid gap-2">
                                          <h4 className="text-sm font-medium">Or select a variable:</h4>
                                          <Select
                                            onValueChange={value => updateStepParameter(index, paramIndex, value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select variable" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {/* Include variables from earlier steps as well */}
                                              {steps.slice(0, index).map((prevStep, prevIndex) => 
                                                prevStep.result && (
                                                  <SelectItem 
                                                    key={`step-${prevIndex}`} 
                                                    value={prevStep.result || ''}
                                                  >
                                                    {prevStep.result} (from step {prevIndex + 1})
                                                  </SelectItem>
                                                )
                                              )}
                                              <div className="h-px bg-muted my-1" />
                                              {variables.map((variable, varIndex) => (
                                                <SelectItem key={varIndex} value={variable.name}>
                                                  {variable.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        
                                        {isNestedOperation(param) && (
                                          <div className="grid gap-2">
                                            <h4 className="text-sm font-medium">Current nested operation:</h4>
                                            <div className="rounded-md border border-dashed p-2 text-sm">
                                              {param.name || 'Unnamed'}: {getOperationLabel((param.operation as FormulaOperator).type)}
                                              <div className="mt-1 text-xs">
                                                Parameters: {(param.operation as FormulaOperator).parameters.map(renderParameterValue).join(', ')}
                                              </div>
                                            </div>
                                            <Button 
                                              variant="destructive" 
                                              size="sm"
                                              onClick={() => updateStepParameter(index, paramIndex, '0')}
                                            >
                                              <Trash2 className="mr-2 h-3 w-3" />
                                              Remove Nested Operation
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeStepParameter(index, paramIndex)}
                                  disabled={(step.operation as FormulaOperator).parameters.length <= getMinParamsForOperationType((step.operation as FormulaOperator).type)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          {/* Only show add parameter button for operations that can have variable number of parameters */}
                          {['add', 'multiply', 'max', 'min', 'and', 'or'].includes((step.operation as FormulaOperator).type) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => addStepParameter(index)}
                              className="mt-2"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Parameter
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <span className="text-sm font-medium w-24">Result Variable:</span>
                      <Input
                        value={step.result || ''}
                        onChange={e => updateStepBasic(index, 'result', e.target.value)}
                        placeholder="Result variable name"
                        className="flex-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Final result:</span>
            <Select 
              value={outputVariable} 
              onValueChange={setOutputVariable}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select output" />
              </SelectTrigger>
              <SelectContent>
                {steps
                  .filter(step => step.result)
                  .map((step, index) => (
                    <SelectItem key={index} value={step.result || ''}>
                      {step.result}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="ml-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Formula
          </Button>
        </CardFooter>
      </Card>

      {/* Nested Operation Builder Dialog */}
      <Dialog open={nestedBuilderOpen} onOpenChange={setNestedBuilderOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Build Nested Operation</DialogTitle>
            <DialogDescription>
              Create a complex nested operation for more advanced formulas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <span className="text-sm font-medium">Operation:</span>
              </div>
              <div className="col-span-3">
                <Select
                  value={nestedOperation.type}
                  onValueChange={updateNestedOperationType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATION_GROUPS.map(group => (
                      <div key={group.id}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          {group.label}
                        </div>
                        {OPERATION_TYPES
                          .filter(op => op.group === group.id)
                          .map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))
                        }
                        {group.id !== OPERATION_GROUPS[OPERATION_GROUPS.length - 1].id && (
                          <div className="h-px bg-muted my-1" />
                        )}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              {nestedOperation.parameters.map((param, paramIndex) => (
                <div key={paramIndex} className="grid grid-cols-4 gap-4 items-center">
                  <div className="col-span-1">
                    <span className="text-sm font-medium">
                      {getParameterLabel(nestedOperation.type, paramIndex)}:
                    </span>
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={param.toString()}
                      onChange={e => updateNestedParameter(paramIndex, e.target.value)}
                      placeholder="Parameter value or variable"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeNestedParameter(paramIndex)}
                      disabled={nestedOperation.parameters.length <= getMinParamsForOperationType(nestedOperation.type)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Only show add parameter button for operations that can have variable number of parameters */}
              {['add', 'multiply', 'max', 'min', 'and', 'or'].includes(nestedOperation.type) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addNestedParameter}
                  className="mt-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Parameter
                </Button>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNestedBuilderOpen(false)}>Cancel</Button>
            <Button onClick={saveNestedOperation}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 
