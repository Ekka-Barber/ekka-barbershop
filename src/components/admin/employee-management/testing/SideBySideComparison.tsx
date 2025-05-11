import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { EmployeeTab } from '../EmployeeTab';
import { EmployeesTab } from '../tabs/EmployeesTab';
import { MonthlySalesTab } from '../tabs/MonthlySalesTab';
import { ArrowLeft, ArrowRight, Columns, RefreshCcw, Check, X } from 'lucide-react';

// Interface for EmployeeTab props to fix type error
interface EmployeeTabProps {
  initialTab?: string;
  initialBranchId?: string | null;
  initialDate?: Date;
}

/**
 * Side-by-Side Comparison Component
 * 
 * This component allows comparing the original tabs with the newly created tabs
 * to ensure visual and functional equivalence.
 */
export const SideBySideComparison: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'employees' | 'sales'>('employees');
  const [showSync, setShowSync] = useState(true);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const [showDifferences, setShowDifferences] = useState(false);
  
  // Test parameters
  const initialDate = new Date();
  const initialBranchId = null;
  
  // Track test results
  const [testResults, setTestResults] = useState<{
    visualMatch: boolean | null;
    functionalMatch: boolean | null;
    performanceMatch: boolean | null;
  }>({
    visualMatch: null,
    functionalMatch: null,
    performanceMatch: null
  });
  
  const handleTestResult = (key: keyof typeof testResults, result: boolean) => {
    setTestResults(prev => ({
      ...prev,
      [key]: result
    }));
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Side-by-Side Comparison Testing</h1>
        <p className="text-muted-foreground">
          Compare original and new tab implementations to ensure they match visually and functionally.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center">
        <Tabs value={selectedTab} onValueChange={(val: string) => setSelectedTab(val as 'employees' | 'sales')}>
          <TabsList>
            <TabsTrigger value="employees">Employees Tab</TabsTrigger>
            <TabsTrigger value="sales">Monthly Sales Tab</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="sync-mode"
            checked={showSync}
            onCheckedChange={setShowSync}
          />
          <Label htmlFor="sync-mode">Sync Actions</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className={cn(viewMode === 'side-by-side' && "bg-primary/10")}
            onClick={() => setViewMode('side-by-side')}
          >
            <Columns className="h-4 w-4 mr-2" />
            Side by Side
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={cn(viewMode === 'overlay' && "bg-primary/10")}
            onClick={() => setViewMode('overlay')}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Overlay
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-differences"
            checked={showDifferences}
            onCheckedChange={setShowDifferences}
          />
          <Label htmlFor="show-differences">Highlight Differences</Label>
        </div>
      </div>
      
      <div className={cn(
        "grid gap-4",
        viewMode === 'side-by-side' ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Original Tab */}
        <Card className={cn(
          "overflow-hidden",
          viewMode === 'overlay' && "absolute inset-0 z-10 m-4"
        )}>
          <CardHeader className="bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Original Implementation</CardTitle>
                <CardDescription>Source of truth during migration</CardDescription>
              </div>
              {viewMode === 'overlay' && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setViewMode('side-by-side')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[800px] overflow-auto">
            <div className="p-4">
              <EmployeeTab 
                initialTab={selectedTab === 'employees' ? 'employee-grid' : 'monthly-sales'} 
                initialBranchId={initialBranchId}
                initialDate={initialDate}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* New Tab */}
        <Card className={cn(
          "overflow-hidden",
          viewMode === 'overlay' && "absolute inset-0 z-20 m-4 opacity-0 hover:opacity-100 transition-opacity"
        )}>
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>New Implementation</CardTitle>
                <CardDescription>Refactored component structure</CardDescription>
              </div>
              {viewMode === 'overlay' && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setViewMode('side-by-side')}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[800px] overflow-auto">
            <div className="p-4">
              {selectedTab === 'employees' ? (
                <EmployeesTab initialBranchId={initialBranchId} />
              ) : (
                <MonthlySalesTab 
                  initialDate={initialDate}
                  initialBranchId={initialBranchId} 
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Results</CardTitle>
          <CardDescription>
            Check for visual and functional equivalence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Visual Match</h3>
                <p className="text-sm text-muted-foreground">UI components look the same</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className={cn(testResults.visualMatch === true && "bg-green-50 border-green-200 text-green-700")}
                  onClick={() => handleTestResult('visualMatch', true)}
                >
                  <Check className={cn(
                    "h-4 w-4 mr-1",
                    testResults.visualMatch === true && "text-green-600"
                  )} />
                  Pass
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className={cn(testResults.visualMatch === false && "bg-red-50 border-red-200 text-red-700")}
                  onClick={() => handleTestResult('visualMatch', false)}
                >
                  <X className={cn(
                    "h-4 w-4 mr-1", 
                    testResults.visualMatch === false && "text-red-600"
                  )} />
                  Fail
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Functional Match</h3>
                <p className="text-sm text-muted-foreground">Features work the same way</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className={cn(testResults.functionalMatch === true && "bg-green-50 border-green-200 text-green-700")}
                  onClick={() => handleTestResult('functionalMatch', true)}
                >
                  <Check className={cn(
                    "h-4 w-4 mr-1",
                    testResults.functionalMatch === true && "text-green-600"
                  )} />
                  Pass
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className={cn(testResults.functionalMatch === false && "bg-red-50 border-red-200 text-red-700")}
                  onClick={() => handleTestResult('functionalMatch', false)}
                >
                  <X className={cn(
                    "h-4 w-4 mr-1", 
                    testResults.functionalMatch === false && "text-red-600"
                  )} />
                  Fail
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Performance Match</h3>
                <p className="text-sm text-muted-foreground">Performance stays consistent</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className={cn(testResults.performanceMatch === true && "bg-green-50 border-green-200 text-green-700")}
                  onClick={() => handleTestResult('performanceMatch', true)}
                >
                  <Check className={cn(
                    "h-4 w-4 mr-1",
                    testResults.performanceMatch === true && "text-green-600"
                  )} />
                  Pass
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className={cn(testResults.performanceMatch === false && "bg-red-50 border-red-200 text-red-700")}
                  onClick={() => handleTestResult('performanceMatch', false)}
                >
                  <X className={cn(
                    "h-4 w-4 mr-1", 
                    testResults.performanceMatch === false && "text-red-600"
                  )} />
                  Fail
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SideBySideComparison; 