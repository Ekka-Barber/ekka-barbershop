import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  ArrowLeft, 
  CalendarDays, 
  Info, 
  ClipboardList,
  Plus,
  Minus
} from 'lucide-react';
import { formatCurrency, getMonthDisplayName } from './SalaryUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

// Define component props
interface Transaction {
  id: string;
  employee_id: string;
  date: string;
  amount: number;
  description: string;
}

interface SalesDataType {
  sales_amount: number;
  commission_rate?: number;
  employee_id?: string;
  employee_name?: string;
}

interface SalaryBreakdownProps {
  selectedEmployeeId: string | null;
  employeeName: string;
  salaryData: {
    id: string;
    name: string;
    baseSalary: number;
    commission: number;
    bonus: number;
    deductions: number;
    loans: number;
    total: number;
  } | null;
  selectedMonth: string;
  onBack: () => void;
  isLoading: boolean;
  bonusTransactions: Transaction[];
  deductionTransactions: Transaction[];
  loanTransactions: Transaction[];
  salesData: SalesDataType | null | undefined;
}

export const SalaryBreakdown = ({
  selectedEmployeeId,
  employeeName,
  salaryData,
  selectedMonth,
  onBack,
  isLoading,
  bonusTransactions = [],
  deductionTransactions = [],
  loanTransactions = [],
  salesData
}: SalaryBreakdownProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // If still loading or no employee is selected, show skeletons
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (!selectedEmployeeId || !salaryData) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <CardTitle className="mb-2">No Employee Selected</CardTitle>
        <CardDescription>
          Please select an employee from the table to view their salary breakdown.
        </CardDescription>
        <Button className="mt-6" onClick={onBack}>
          Return to Summary
        </Button>
      </Card>
    );
  }
  
  return (
    <>
      {/* MOBILE: Bottom Sheet */}
      <div className="block sm:hidden">
        <Sheet open={!!selectedEmployeeId} onOpenChange={onBack}>
          <SheetContent side="bottom" className="h-[85vh] p-0">
            <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-background z-10">
              <div className="flex items-center">
                <button
                  type="button"
                  className="mr-2 h-11 w-11 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Back"
                  tabIndex={0}
                  onClick={onBack}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onBack()}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <SheetTitle>{employeeName}</SheetTitle>
                  <div className="text-sm text-muted-foreground">
                    {getMonthDisplayName(selectedMonth)}
                  </div>
                </div>
              </div>
            </SheetHeader>
            <Tabs defaultValue="summary" className="h-full">
              <TabsList className="w-full justify-start px-4 pt-2 pb-0 overflow-x-auto">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="p-4 overflow-auto h-[calc(85vh-120px)]">
                {/* Salary summary for mobile */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Base Salary</div>
                    <div className="text-lg font-bold">{salaryData ? formatCurrency(salaryData.baseSalary) : '-'}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Commission</div>
                    <div className="text-lg font-bold">{salaryData ? formatCurrency(salaryData.commission) : '-'}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 col-span-2">
                    <div className="text-xs text-muted-foreground">Total Earnings</div>
                    <div className="text-lg font-bold">{salaryData ? formatCurrency(salaryData.total) : '-'}</div>
                  </div>
                </div>
                {/* Bonuses, Deductions, Loans summary */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-green-700">Bonuses</div>
                    <div className="text-base font-bold text-green-700">{salaryData ? formatCurrency(salaryData.bonus) : '-'}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-red-700">Deductions</div>
                    <div className="text-base font-bold text-red-700">{salaryData ? `-${formatCurrency(salaryData.deductions)}` : '-'}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-red-700">Loans</div>
                    <div className="text-base font-bold text-red-700">{salaryData ? `-${formatCurrency(salaryData.loans)}` : '-'}</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="transactions" className="p-4 overflow-auto h-[calc(85vh-120px)]">
                {/* Transactions list with color coding */}
                <div className="space-y-3">
                  {[...(bonusTransactions.map(t => ({ ...t, type: 'bonus' }))),
                    ...(deductionTransactions.map(t => ({ ...t, type: 'deduction' }))),
                    ...(loanTransactions.map(t => ({ ...t, type: 'loan' })))]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction, index) => (
                      <div
                        key={index}
                        className={`flex items-center p-3 border rounded-lg ${
                          transaction.type === 'bonus'
                            ? 'border-green-100 bg-green-50'
                            : 'border-red-100 bg-red-50'
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                            transaction.type === 'bonus'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {transaction.type === 'bonus' ? (
                            <Plus className="h-5 w-5" />
                          ) : (
                            <Minus className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div
                          className={
                            transaction.type === 'bonus'
                              ? 'text-green-700 font-medium'
                              : 'text-red-700 font-medium'
                          }
                        >
                          {transaction.type === 'bonus'
                            ? `+${formatCurrency(transaction.amount)}`
                            : `-${formatCurrency(transaction.amount)}`}
                        </div>
                      </div>
                    ))}
                  {[...bonusTransactions, ...deductionTransactions, ...loanTransactions].length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No transactions for this period
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="history" className="p-4 overflow-auto h-[calc(85vh-120px)]">
                {/* Placeholder for salary history visualization */}
                <div className="h-40 mb-4 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  Salary history chart coming soon
                </div>
                <div className="space-y-3">
                  {/* Placeholder for historical salary entries */}
                  <div className="text-center text-xs text-muted-foreground">No history data</div>
                </div>
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>

      {/* DESKTOP: Original View */}
      <div className="hidden sm:block">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold">{employeeName}</h2>
                <div className="flex items-center text-muted-foreground text-sm">
                  <CalendarDays className="mr-1 h-4 w-4" />
                  <span>Salary Breakdown for {getMonthDisplayName(selectedMonth)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Salary Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Salary Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Base Salary</div>
                  <div className="text-2xl font-bold">{formatCurrency(salaryData.baseSalary)}</div>
                </div>
                
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Commission</div>
                  <div className="text-2xl font-bold">{formatCurrency(salaryData.commission)}</div>
                </div>
                
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</div>
                  <div className="text-2xl font-bold">{formatCurrency(salaryData.total)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="breakdown" className="space-y-6">
            <TabsList className="w-full">
              <TabsTrigger value="breakdown" className="flex-1">
                <ClipboardList className="mr-2 h-4 w-4" />
                Detailed Breakdown
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1">
                <CalendarDays className="mr-2 h-4 w-4" />
                Transactions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakdown" className="space-y-4">
              {/* Base Salary Section */}
              <Card>
                <CardHeader className="py-4 cursor-pointer" onClick={() => toggleSection('base')}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      Base Salary
                    </CardTitle>
                    <Button variant="ghost" size="icon">
                      {expandedSection === 'base' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <CardDescription>Monthly base compensation</CardDescription>
                    <div className="text-lg font-bold">{formatCurrency(salaryData.baseSalary)}</div>
                  </div>
                </CardHeader>
                
                {expandedSection === 'base' && (
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm">
                          The base salary is the fixed amount paid to the employee each month regardless 
                          of performance or hours worked. It is determined by the employee's contract and 
                          salary plan.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
              
              {/* Commission Section */}
              <Card>
                <CardHeader className="py-4 cursor-pointer" onClick={() => toggleSection('commission')}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      Commission
                    </CardTitle>
                    <Button variant="ghost" size="icon">
                      {expandedSection === 'commission' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <CardDescription>Performance-based commission</CardDescription>
                    <div className="text-lg font-bold">{formatCurrency(salaryData.commission)}</div>
                  </div>
                </CardHeader>
                
                {expandedSection === 'commission' && (
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Sales Amount:</span>
                          <span>{formatCurrency(salesData?.sales_amount || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Commission Rate:</span>
                          <span>{salesData?.commission_rate || 0}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between items-center">
                          <span className="text-sm font-medium">Total Commission:</span>
                          <span className="font-bold">{formatCurrency(salaryData.commission)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                          <p>Commission is calculated using sales amount multiplied by the rate (shown as a decimal, e.g., 0.2 = 20%).</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
              
              {/* Bonuses Section */}
              <Card>
                <CardHeader className="py-4 cursor-pointer" onClick={() => toggleSection('bonuses')}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      Bonuses
                    </CardTitle>
                    <Button variant="ghost" size="icon">
                      {expandedSection === 'bonuses' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <CardDescription>Additional compensation</CardDescription>
                    <div className="text-lg font-bold">{formatCurrency(salaryData.bonus)}</div>
                  </div>
                </CardHeader>
                
                {expandedSection === 'bonuses' && (
                  <CardContent>
                    {bonusTransactions.length > 0 ? (
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {bonusTransactions.map((bonus, index) => (
                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <div className="font-medium">{bonus.description || 'Bonus Payment'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(bonus.date).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-auto">
                                {formatCurrency(bonus.amount)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No bonus transactions for this period
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
              
              {/* Deductions Section */}
              <Card>
                <CardHeader className="py-4 cursor-pointer" onClick={() => toggleSection('deductions')}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      Deductions
                    </CardTitle>
                    <Button variant="ghost" size="icon">
                      {expandedSection === 'deductions' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <CardDescription>Amounts deducted from salary</CardDescription>
                    <div className="text-lg font-bold text-red-600">
                      {salaryData.deductions > 0 ? `-${formatCurrency(salaryData.deductions)}` : formatCurrency(0)}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedSection === 'deductions' && (
                  <CardContent>
                    {deductionTransactions.length > 0 ? (
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {deductionTransactions.map((deduction, index) => (
                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <div className="font-medium">{deduction.description || 'Deduction'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(deduction.date).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-auto text-red-600">
                                -{formatCurrency(deduction.amount)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No deduction transactions for this period
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
              
              {/* Loans Section */}
              <Card>
                <CardHeader className="py-4 cursor-pointer" onClick={() => toggleSection('loans')}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      Loans
                    </CardTitle>
                    <Button variant="ghost" size="icon">
                      {expandedSection === 'loans' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <CardDescription>Loan repayments</CardDescription>
                    <div className="text-lg font-bold text-red-600">
                      {salaryData.loans > 0 ? `-${formatCurrency(salaryData.loans)}` : formatCurrency(0)}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedSection === 'loans' && (
                  <CardContent>
                    {loanTransactions.length > 0 ? (
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {loanTransactions.map((loan, index) => (
                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <div className="font-medium">{loan.description || 'Loan Payment'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(loan.date).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-auto text-red-600">
                                -{formatCurrency(loan.amount)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No loan transactions for this period
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Transactions</CardTitle>
                  <CardDescription>
                    Complete transaction history for {getMonthDisplayName(selectedMonth)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {/* Display all transactions chronologically */}
                      {[
                        ...bonusTransactions.map(t => ({ ...t, type: 'bonus' })),
                        ...deductionTransactions.map(t => ({ ...t, type: 'deduction' })),
                        ...loanTransactions.map(t => ({ ...t, type: 'loan' }))
                      ]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((transaction, index) => (
                          <div key={index} className="flex justify-between items-center p-3 border rounded">
                            <div>
                              <div className="font-medium">{transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                transaction.type === 'bonus'
                                  ? 'ml-auto'
                                  : 'ml-auto text-red-600'
                              }
                            >
                              {transaction.type === 'bonus'
                                ? formatCurrency(transaction.amount)
                                : `-${formatCurrency(transaction.amount)}`}
                            </Badge>
                          </div>
                        ))}
                        
                      {[
                        ...bonusTransactions,
                        ...deductionTransactions,
                        ...loanTransactions
                      ].length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No transactions for this period
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}; 
