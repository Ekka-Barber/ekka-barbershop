import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Database, PlayCircle, Upload, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface InteractiveSampleDataProps {
  variables: Array<{
    name: string;
    description?: string;
    source?: string;
    dataType?: string;
    defaultValue?: number;
    category?: string;
  }>;
  sampleData: Record<string, number>;
  onUpdate: (data: Record<string, number>) => void;
  onSimulate: () => void;
}

export const InteractiveSampleData = ({
  variables,
  sampleData,
  onUpdate,
  onSimulate
}: InteractiveSampleDataProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Group variables by source
  const variablesBySource = variables.reduce((acc, variable) => {
    const source = variable.source || 'constant';
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(variable);
    return acc;
  }, {} as Record<string, typeof variables>);
  
  // Group variables by category
  const variablesByCategory = variables.reduce((acc, variable) => {
    const category = variable.category || 'custom';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(variable);
    return acc;
  }, {} as Record<string, typeof variables>);
  
  // Available categories to display in tabs
  const categories = Object.keys(variablesByCategory).sort();
  
  // Get color for a category
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'base': return 'bg-blue-50 text-blue-700';
      case 'sales': return 'bg-green-50 text-green-700';
      case 'commission': return 'bg-amber-50 text-amber-700';
      case 'bonus': return 'bg-purple-50 text-purple-700';
      case 'deduction': return 'bg-red-50 text-red-700';
      case 'employee': return 'bg-cyan-50 text-cyan-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };
  
  // Filter variables by category
  const getFilteredVariables = () => {
    if (activeCategory === 'all') {
      return variables;
    }
    
    // Filter by source
    if (['constant', 'employee', 'sales', 'transaction'].includes(activeCategory)) {
      return variablesBySource[activeCategory] || [];
    }
    
    // Filter by category
    return variablesByCategory[activeCategory] || [];
  };
  
  // Handle value change
  const handleValueChange = (varName: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    
    // Update the sample data
    onUpdate({
      ...sampleData,
      [varName]: isNaN(numValue) ? 0 : numValue
    });
  };
  
  // Reset all values to defaults
  const resetToDefaults = () => {
    const defaults: Record<string, number> = {};
    
    variables.forEach(variable => {
      defaults[variable.name] = variable.defaultValue || 0;
    });
    
    onUpdate(defaults);
    
    toast({
      title: 'Values Reset',
      description: 'All sample data has been reset to default values',
    });
  };
  
  // Import JSON sample data
  const importSampleData = () => {
    // Create an input element to handle the file upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          // Validate the data
          if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid JSON format');
          }
          
          // Convert values to numbers and validate variable names
          const validData: Record<string, number> = {};
          
          Object.entries(data).forEach(([key, value]) => {
            if (variables.some(v => v.name === key)) {
              validData[key] = typeof value === 'number' ? value : parseFloat(value as string) || 0;
            }
          });
          
          onUpdate(validData);
          
          toast({
            title: 'Data Imported',
            description: `Successfully imported sample data with ${Object.keys(validData).length} variables`,
          });
        } catch {
          toast({
            title: 'Import Failed',
            description: 'Invalid JSON format or data structure',
            variant: 'destructive'
          });
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  // Export current sample data
  const exportSampleData = () => {
    // Create a blob with the current data
    const dataStr = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a temporary URL for download
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formula-sample-data.json';
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Data Exported',
      description: 'Sample data exported to JSON file'
    });
  };
  
  // Render variable input
  const renderVariableInput = (variable: InteractiveSampleDataProps['variables'][0]) => {
    const value = sampleData[variable.name];
    
    return (
      <div key={variable.name} className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={`var-${variable.name}`} className="text-sm flex items-center">
            {variable.name}
            <Badge 
              variant="outline" 
              className={cn("ml-2 text-xs", getCategoryColor(variable.category || 'custom'))}
            >
              {variable.source || 'constant'}
            </Badge>
          </Label>
          <span className="text-xs text-muted-foreground">
            {variable.description?.slice(0, 40) || ''}
            {variable.description && variable.description.length > 40 ? '...' : ''}
          </span>
        </div>
        <Input
          id={`var-${variable.name}`}
          type="number"
          value={value?.toString() || '0'}
          onChange={(e) => handleValueChange(variable.name, e.target.value)}
          className="h-8"
        />
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Sample Data
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={resetToDefaults}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={importSampleData}
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Import
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={exportSampleData}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={onSimulate}
            >
              <PlayCircle className="h-3.5 w-3.5 mr-1" />
              Simulate
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <div className="mb-4">
            <TabsList className="grid grid-cols-4 mb-2">
              <TabsTrigger value="all" className="text-xs">All Variables</TabsTrigger>
              <TabsTrigger value="constant" className="text-xs">Constants</TabsTrigger>
              <TabsTrigger value="employee" className="text-xs">Employee</TabsTrigger>
              <TabsTrigger value="sales" className="text-xs">Sales & Trans.</TabsTrigger>
            </TabsList>
            
            {categories.length > 0 && (
              <>
                <Separator className="my-2" />
                <ScrollArea className="w-full whitespace-nowrap" type="always">
                  <TabsList className="inline-flex w-max">
                    {categories.map(category => (
                      <TabsTrigger 
                        key={category} 
                        value={category} 
                        className={cn("text-xs", getCategoryColor(category))}
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
              </>
            )}
          </div>
          
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-2 gap-4">
              {getFilteredVariables().map(variable => renderVariableInput(variable))}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 
