import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Save, Edit, Trash2 } from 'lucide-react';
import { FormulaPlan, FormulaVariable } from '@/lib/salary/types/salary';

// Define template variables with correct typing
const TEMPLATES = [
  {
    name: 'Base + Commission - Deductions',
    variables: [
      { name: 'baseSalary', description: 'Base salary amount', defaultValue: 0, source: 'constant' as const, dataType: 'number' as const, category: 'base' },
      { name: 'salesAmount', description: 'Total sales amount', source: 'sales' as const, dataType: 'number' as const, category: 'sales' },
      { name: 'commissionRate', description: 'Commission rate (e.g., 0.1 for 10%)', defaultValue: 0.1, source: 'constant' as const, dataType: 'number' as const, category: 'commission' },
      { name: 'deductionsTotal', description: 'Total deductions amount', source: 'transaction' as const, dataType: 'number' as const, category: 'deduction' },
      { name: 'loansTotal', description: 'Total loans amount', source: 'transaction' as const, dataType: 'number' as const, category: 'deduction' },
    ],
    formula: 'baseSalary + (salesAmount * commissionRate) - (deductionsTotal + loansTotal)',
    outputVariable: 'totalSalary',
  },
  {
    name: 'Base Only',
    variables: [
      { name: 'baseSalary', description: 'Base salary amount', defaultValue: 0, source: 'constant' as const, dataType: 'number' as const, category: 'base' },
    ],
    formula: 'baseSalary',
    outputVariable: 'totalSalary',
  },
  {
    name: 'Custom',
    variables: [],
    formula: '',
    outputVariable: 'totalSalary',
  },
];

const getDefaultVariables = (templateName: string): FormulaVariable[] => {
  const template = TEMPLATES.find(t => t.name === templateName);
  return template ? template.variables as FormulaVariable[] : [];
};

const getDefaultFormula = (templateName: string) => {
  const template = TEMPLATES.find(t => t.name === templateName);
  return template ? template.formula : '';
};

const getDefaultOutputVariable = (templateName: string) => {
  const template = TEMPLATES.find(t => t.name === templateName);
  return template ? template.outputVariable : 'totalSalary';
};

export const FormulaPlanBuilder = ({ initialPlan, onSave }: { initialPlan?: FormulaPlan; onSave: (plan: FormulaPlan) => void }) => {
  const [template, setTemplate] = useState('Base + Commission - Deductions');
  const [variables, setVariables] = useState<FormulaVariable[]>(initialPlan?.variables || getDefaultVariables('Base + Commission - Deductions'));
  const [formula, setFormula] = useState<string>(initialPlan?.steps ? '' : getDefaultFormula('Base + Commission - Deductions'));
  const [outputVariable, setOutputVariable] = useState<string>(initialPlan?.outputVariable || getDefaultOutputVariable('Base + Commission - Deductions'));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editVar, setEditVar] = useState<Partial<FormulaVariable>>({});
  const [testValues, setTestValues] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle template change
  const handleTemplateChange = (name: string) => {
    setTemplate(name);
    setVariables(getDefaultVariables(name));
    setFormula(getDefaultFormula(name));
    setOutputVariable(getDefaultOutputVariable(name));
    setEditingIndex(null);
    setEditVar({});
    setTestValues({});
    setResult(null);
    setError(null);
  };

  // Handle variable edit
  const handleEditVariable = (idx: number) => {
    setEditingIndex(idx);
    setEditVar(variables[idx]);
  };
  
  const handleSaveVariable = () => {
    if (!editVar.name) return;
    const updated = [...variables];
    updated[editingIndex!] = {
      name: editVar.name || '',
      description: editVar.description || '',
      dataType: (editVar.dataType as 'number' | 'boolean' | 'date' | 'text') || 'number',
      source: (editVar.source as 'constant' | 'sales' | 'transaction' | 'employee') || 'constant',
      category: editVar.category || 'custom',
      defaultValue: typeof editVar.defaultValue === 'string' ? Number(editVar.defaultValue) : editVar.defaultValue
    } as FormulaVariable;
    setVariables(updated);
    setEditingIndex(null);
    setEditVar({});
  };
  
  const handleDeleteVariable = (idx: number) => {
    setVariables(variables.filter((_, i) => i !== idx));
    setEditingIndex(null);
    setEditVar({});
  };
  
  const handleAddVariable = () => {
    setVariables([...variables, { 
      name: '', 
      description: '', 
      dataType: 'number', 
      source: 'constant',
      category: 'custom' 
    }]);
    setEditingIndex(variables.length);
    setEditVar({ 
      name: '', 
      description: '', 
      dataType: 'number', 
      source: 'constant',
      category: 'custom' 
    });
  };

  // Formula input with autocomplete (basic)
  const handleFormulaChange = (val: string) => {
    setFormula(val);
    setError(null);
  };

  // Test formula (very basic eval, for demo only)
  const handleTest = () => {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(...variables.map(v => v.name), `return ${formula}`);
      const vals = variables.map(v => Number(testValues[v.name] ?? v.defaultValue ?? 0));
      const res = fn(...vals);
      setResult(res);
      setError(null);
    } catch {
      // Handle any formula evaluation errors
      setResult(null);
      setError('Invalid formula or test values');
    }
  };

  // Save plan
  const handleSave = () => {
    if (!formula || variables.some(v => !v.name)) {
      setError('Please provide a valid formula and variable names.');
      return;
    }
    onSave({
      variables,
      steps: [], // Not used in new builder
      outputVariable,
      name: initialPlan?.name || '',
      description: initialPlan?.description || '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Choose a Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map(t => (
              <Button
                key={t.name}
                variant={template === t.name ? 'default' : 'outline'}
                onClick={() => handleTemplateChange(t.name)}
                aria-label={`Choose ${t.name} template`}
                tabIndex={0}
              >
                {t.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Variable Table */}
      <Card>
        <CardHeader>
          <CardTitle>Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Description</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-left">Default</th>
                  <th className="px-2 py-1 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variables.map((v, idx) => (
                  <tr key={idx} className="border-b">
                    {editingIndex === idx ? (
                      <>
                        <td className="px-2 py-1"><Input value={editVar.name || ''} onChange={e => setEditVar({ ...editVar, name: e.target.value })} aria-label="Variable name" tabIndex={0} /></td>
                        <td className="px-2 py-1"><Input value={editVar.description || ''} onChange={e => setEditVar({ ...editVar, description: e.target.value })} aria-label="Variable description" tabIndex={0} /></td>
                        <td className="px-2 py-1">
                          <select 
                            className="border rounded px-1 py-0.5" 
                            value={editVar.dataType || 'number'} 
                            onChange={e => setEditVar({ ...editVar, dataType: e.target.value as 'number' | 'boolean' | 'date' | 'text' })}
                            aria-label="Variable type" 
                            tabIndex={0}
                          >
                            <option value="number">number</option>
                            <option value="text">text</option>
                            <option value="boolean">boolean</option>
                            <option value="date">date</option>
                          </select>
                        </td>
                        <td className="px-2 py-1">
                          <Input 
                            value={editVar.defaultValue !== undefined ? editVar.defaultValue : ''} 
                            onChange={e => setEditVar({ ...editVar, defaultValue: e.target.value === '' ? undefined : Number(e.target.value) })} 
                            type="number"
                            aria-label="Default value" 
                            tabIndex={0} 
                          />
                        </td>
                        <td className="px-2 py-1 flex gap-1">
                          <Button size="sm" variant="outline" onClick={handleSaveVariable} aria-label="Save variable" tabIndex={0}><Save className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)} aria-label="Cancel edit" tabIndex={0}>Cancel</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-1">{v.name}</td>
                        <td className="px-2 py-1">{v.description}</td>
                        <td className="px-2 py-1">{v.dataType}</td>
                        <td className="px-2 py-1">{v.defaultValue !== undefined ? v.defaultValue : ''}</td>
                        <td className="px-2 py-1 flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleEditVariable(idx)} aria-label="Edit variable" tabIndex={0}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteVariable(idx)} aria-label="Delete variable" tabIndex={0}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <Button className="mt-2" onClick={handleAddVariable} aria-label="Add variable" tabIndex={0}><Plus className="h-4 w-4 mr-1" /> Add Variable</Button>
          </div>
        </CardContent>
      </Card>

      {/* Formula Input */}
      <Card>
        <CardHeader>
          <CardTitle>Formula</CardTitle>
          <CardDescription>Type your formula using variable names. Example: <span className="font-mono">baseSalary + (salesAmount * commissionRate) - deductionsTotal</span></CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={formula}
            onChange={e => handleFormulaChange(e.target.value)}
            placeholder="Enter formula..."
            aria-label="Formula input"
            tabIndex={0}
            className="font-mono"
          />
          {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
        </CardContent>
      </Card>

      {/* Output Variable */}
      <Card>
        <CardHeader>
          <CardTitle>Output Variable</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={outputVariable}
            onChange={e => setOutputVariable(e.target.value)}
            placeholder="totalSalary"
            aria-label="Output variable"
            tabIndex={0}
          />
        </CardContent>
      </Card>

      {/* Test Area */}
      <Card>
        <CardHeader>
          <CardTitle>Test Formula</CardTitle>
          <CardDescription>Enter sample values to test your formula</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-2">
            {variables.map(v => (
              <div key={v.name} className="flex flex-col">
                <label htmlFor={`test-${v.name}`} className="text-xs">{v.name}</label>
                <Input
                  id={`test-${v.name}`}
                  type="number"
                  value={testValues[v.name] !== undefined ? testValues[v.name] : ''}
                  onChange={e => setTestValues({ 
                    ...testValues, 
                    [v.name]: e.target.value === '' ? 0 : Number(e.target.value)
                  })}
                  placeholder={String(v.defaultValue ?? 0)}
                  className="w-24"
                  aria-label={`Test value for ${v.name}`}
                  tabIndex={0}
                />
              </div>
            ))}
          </div>
          <Button onClick={handleTest} aria-label="Test formula" tabIndex={0}>Test</Button>
          {result !== null && <div className="mt-2 text-green-700">Result: <span className="font-mono font-bold">{result}</span></div>}
          {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} aria-label="Save plan" tabIndex={0}><Save className="h-4 w-4 mr-1" /> Save Plan</Button>
      </div>
    </div>
  );
};