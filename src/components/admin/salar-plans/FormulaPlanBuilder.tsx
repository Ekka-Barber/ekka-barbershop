import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { FormulaVariable, FormulaStep, FormulaPlan } from '@/lib/salary/types/salary';
import { toast } from '@/components/ui/use-toast';

interface FormulaPlanBuilderProps {
  initialPlan?: FormulaPlan;
  onSave: (plan: FormulaPlan) => void;
}

export const FormulaPlanBuilder = ({ initialPlan, onSave }: FormulaPlanBuilderProps) => {
  const [variables, setVariables] = useState<FormulaVariable[]>(
    initialPlan?.variables || [
      // Default variables
      { name: 'baseSalary', description: 'Base salary amount', defaultValue: 0, source: 'constant' },
      { name: 'salesAmount', description: 'Total sales amount', source: 'sales' },
      { name: 'commissionRate', description: 'Commission rate (e.g., 0.1 for 10%)', defaultValue: 0, source: 'constant' },
      { name: 'threshold', description: 'Sales threshold for commission', defaultValue: 0, source: 'constant' }
    ]
  );

  const [steps] = useState<FormulaStep[]>(
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

  // Add a new variable
  const addVariable = () => {
    const newVariable: FormulaVariable = {
      name: `variable${variables.length + 1}`,
      description: 'New variable',
      defaultValue: 0,
      source: 'constant'
    };
    setVariables([...variables, newVariable]);
  };

  // Update a variable
  const updateVariable = (index: number, field: keyof FormulaVariable, value: string | number) => {
    const newVariables = [...variables];
    if (field === 'defaultValue') {
      newVariables[index][field] = Number(value);
    } else if (field === 'source') {
      // Ensure source is one of the valid source types
      const sourceValue = value as 'constant' | 'employee' | 'sales' | 'transaction';
      newVariables[index][field] = sourceValue;
    } else {
      newVariables[index][field as 'name' | 'description' | 'path'] = value as string;
    }
    setVariables(newVariables);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {variables.map((variable, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <Input
                    placeholder="Name"
                    value={variable.name}
                    onChange={e => updateVariable(index, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Description"
                    value={variable.description}
                    onChange={e => updateVariable(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
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
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Default"
                    value={variable.defaultValue?.toString() || '0'}
                    onChange={e => updateVariable(index, 'defaultValue', e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariable(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={addVariable} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculation Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <p>
              Steps define how the salary is calculated using the variables defined above.
              Currently using predefined steps for a commission-based salary plan.
            </p>
            <p className="mt-1">
              Step 1: Commission = max(salesAmount - threshold, 0) × commissionRate
            </p>
            <p className="mt-1">
              Step 2: Total Salary = (baseSalary + commission + bonuses) - (deductions + loans)
            </p>
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
    </div>
  );
}; 
