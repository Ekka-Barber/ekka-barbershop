import React, { useState } from 'react';
import { Suspense } from 'react';

import { payslipPDFGenerator } from '@shared/lib/pdf/payslip-pdf-generator';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/components/tabs';

import PayslipButton from '../employees/payslip/PayslipButton';

import { SalaryPlanType } from '@/features/manager/types/salary';


// Test component that simulates the real employee scenario
const RealEmployeeTest = () => {
  // Simulate real employee data that would be passed to PayslipButton
  const mockEmployeeData = {
    id: "EMP-001",
    name: "John Doe",
    name_ar: "محمد أحمد",
    role: "مصفف شعر",
    photo_url: "/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.webp",
    nationality: "سعودي",
    branch: "الرياض",
  };

  const mockSalaryData = {
    planName: "خطة الراتب الأساسية",
    planType: "dynamic_basic" as SalaryPlanType,
    baseSalary: 3000,
    commission: 500,
    targetBonus: 200,
    bonusList: [
      {
        id: "bonus-1",
        employee_id: "EMP-001",
        employee_name: "John Doe",
        amount: 300,
        description: "مكافأة الأداء",
        date: "2023-06-15",
        created_at: "2023-06-15T10:00:00Z",
        updated_at: "2023-06-15T10:00:00Z",
        branch_id: "BR-001",
        cash_deposit_id: "CD-001",
        source: "cash_deposit",
      }
    ],
    deductionsList: [
      {
        id: "deduction-1",
        employee_id: "EMP-001",
        employee_name: "John Doe",
        amount: 200,
        description: "تأخر",
        date: "2023-06-10",
        created_at: "2023-06-10T10:00:00Z",
        updated_at: "2023-06-10T10:00:00Z",
        branch_id: "BR-001",
        cash_deposit_id: "CD-001",
        source: "cash_deposit",
      }
    ],
    loansList: [
      {
        id: "loan-1",
        employee_id: "EMP-001",
        employee_name: "John Doe",
        amount: 300,
        description: "سلفة",
        date: "2023-06-05",
        created_at: "2023-06-05T10:00:00Z",
        updated_at: "2023-06-05T10:00:00Z",
        branch_id: "BR-001",
        cash_deposit_id: "CD-001",
        source: "cash_deposit",
      }
    ],
    deductions: 200,
    loans: 300,
    netSalary: 3200,
    totalSales: 10000,
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Real Employee Scenario Test</h1>
      
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-yellow-700 mb-2">Test Information</h2>
        <p className="mb-2">This test simulates how PayslipButton is used in the real EmployeeSalaryDetails component.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-medium mb-1">Employee Data:</h3>
            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(mockEmployeeData, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-1">Salary Data:</h3>
            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(mockSalaryData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-5">
          <h2 className="text-xl mb-4 text-center">Payslip Button Test</h2>
          <div className="max-w-md mx-auto">
            <PayslipButton 
              employeeData={mockEmployeeData}
              salaryData={mockSalaryData}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Instructions</h2>
        <p>Open the browser console to see the debug information logged by the PayslipViewer component.</p>
        <ol className="list-decimal ml-5 mt-2 space-y-1">
          <li>Click the payslip button above to open the modal</li>
          <li>Check the console logs for data being passed between components</li>
          <li>Compare with the test data in the other tabs</li>
        </ol>
      </div>
    </div>
  );
};

const PDFGenerationTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleGenerateTestPDF = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create sample payslip data matching PayslipData interface
      const samplePayslipData = {
        companyName: 'إكّه للعناية بالرجل',
         companyLogoUrl: '/logo_Header/header11.png',
        payPeriod: 'يناير 2023',
        issueDate: new Date().toISOString(),
        employee: {
          id: 'EMP-001',
          nameAr: 'محمد أحمد',
          role: 'مصفف شعر',
          branch: 'الرياض',
          salaryPlan: {
            name: 'خطة الراتب الأساسية',
            type: 'dynamic_basic',
          },
        },
        totalSales: 10000,
        targetSales: 12000,
        baseSalary: 3000,
        commission: 500,
        commissionRate: 0.05,
        commissionThreshold: 5000,
        bonuses: [
          {
            amount: 300,
            description: 'مكافأة الأداء',
            date: '2023-06-15',
          },
        ],
        deductions: [
          {
            amount: 200,
            description: 'تأخر',
            date: '2023-06-10',
          },
        ],
        loans: [
          {
            amount: 300,
            description: 'سلفة',
            date: '2023-06-05',
          },
        ],
        summary: {
          totalEarnings: 3800, // baseSalary + commission + bonuses
          totalDeductions: 500, // deductions + loans
          netSalary: 3300,
        },
      };
      
      await payslipPDFGenerator.generatePayslipPDF(samplePayslipData, 'test-payslip.pdf');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <h2 className="text-xl font-bold">PDF Generation Test (jsPDF + html2canvas)</h2>
      <p className="text-gray-600 text-center">
        This test uses the new PDF generation system that replaces React-PDF.
        The new system uses HTML templates converted to PDF via jsPDF and html2canvas.
      </p>
      <Button 
        onClick={handleGenerateTestPDF}
        disabled={loading}
        className="mt-4"
      >
        {loading ? 'Generating PDF...' : 'Generate Test PDF'}
      </Button>
      {error && (
        <div className="text-red-500 p-3 bg-red-100 border border-red-500 rounded-md mt-4">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

const PayslipTestPage = () => {
  const [activeTab, setActiveTab] = useState<string>("simple-test");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Payslip PDF Rendering Test Page</h1>
      <p className="mb-4">Use this page to test and debug the PDF rendering functionality.</p>
      
      <Tabs defaultValue="pdf-generation-test" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pdf-generation-test">PDF Generation Test</TabsTrigger>
          <TabsTrigger value="real-employee-test">Real Employee Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pdf-generation-test" className="border rounded-lg p-6 bg-white shadow-sm">
          <PDFGenerationTest />
        </TabsContent>
        
        <TabsContent value="real-employee-test" className="border rounded-lg p-6 bg-white shadow-sm">
          <Suspense fallback={<div>Loading real employee test component...</div>}>
            <RealEmployeeTest />
          </Suspense>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-700 mb-2">Debugging Information</h2>
        <p>If the PDF doesn't render correctly:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Check browser console for errors</li>
          <li>Verify that jsPDF and html2canvas are loaded correctly</li>
          <li>Test in different browsers (Chrome, Firefox, etc.)</li>
          <li>Check network tab for missing assets (fonts, images)</li>
        </ul>
        
        <div className="mt-4 p-2 bg-white rounded">
          <h3 className="font-semibold">Current Test: {
            activeTab === "simple-test" 
              ? "Simple PDF Test" 
              : activeTab === "payslip-test"
                ? "Payslip Document Test"
                : "Real Employee Test"
          }</h3>
          <p className="text-sm mt-1">
            {activeTab === "simple-test" 
              ? "This test uses a minimal PDF document to verify basic PDF rendering functionality."
              : activeTab === "payslip-test"
                ? "This test uses the actual PayslipDocument component with sample data to verify its rendering."
                : "This test simulates the real employee scenario to debug data passing issues."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayslipTestPage; 
