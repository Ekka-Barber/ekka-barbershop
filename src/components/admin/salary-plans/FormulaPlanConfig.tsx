
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export interface FormulaPlanConfigProps {
  planId?: string;
  onSave?: (config: FormulaPlanData) => void;
  onCancel?: () => void;
  defaultValues?: Partial<FormulaPlanData>;
  initialConfig?: Record<string, unknown>;
}

// Export as interface to avoid conflicts with module exports
export interface FormulaPlanData {
  name: string;
  baseAmount: number;
  formulaType: string;
  percentage: number;
  minAmount?: number;
  maxAmount?: number;
  description?: string;
  [key: string]: string | number | undefined; // Add index signature to make it assignable to Record<string, unknown>
}

const FormulaPlanConfig = ({
  planId,
  onSave,
  onCancel,
  defaultValues = {},
  initialConfig,
}: FormulaPlanConfigProps) => {
  const [formData, setFormData] = useState<FormulaPlanData>({
    name: defaultValues.name || '',
    baseAmount: defaultValues.baseAmount || 0,
    formulaType: defaultValues.formulaType || 'percentage',
    percentage: defaultValues.percentage || 0,
    minAmount: defaultValues.minAmount,
    maxAmount: defaultValues.maxAmount,
    description: defaultValues.description || '',
  });

  const handleChange = (field: keyof FormulaPlanData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{planId ? 'Edit Formula Plan' : 'Create Formula Plan'}</CardTitle>
        <CardDescription>
          Configure the salary formula calculation plan
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter plan name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseAmount">Base Amount</Label>
            <Input
              id="baseAmount"
              type="number"
              value={formData.baseAmount}
              onChange={(e) => handleChange('baseAmount', parseFloat(e.target.value) || 0)}
              min={0}
              step={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="formulaType">Formula Type</Label>
            <Select
              value={formData.formulaType}
              onValueChange={(value) => handleChange('formulaType', value)}
            >
              <SelectTrigger id="formulaType">
                <SelectValue placeholder="Select formula type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="tiered">Tiered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.formulaType === 'percentage' && (
            <div className="space-y-2">
              <Label>Percentage: {formData.percentage}%</Label>
              <Slider
                value={[formData.percentage]}
                min={0}
                max={100}
                step={1}
                onValueChange={(values) => handleChange('percentage', values[0])}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAmount">Minimum Amount (Optional)</Label>
              <Input
                id="minAmount"
                type="number"
                value={formData.minAmount || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  handleChange('minAmount', value as number);
                }}
                min={0}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Maximum Amount (Optional)</Label>
              <Input
                id="maxAmount"
                type="number"
                value={formData.maxAmount || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  handleChange('maxAmount', value as number);
                }}
                min={0}
                step={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter description"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Plan</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FormulaPlanConfig;
