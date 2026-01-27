import { useCallback } from 'react';

import { SalaryPDFData, SalaryPDFGenerator } from '@shared/lib/pdf/salary-pdf-generator';
import { supabase } from '@shared/lib/supabase/client';
import { SalaryCalculation } from '@shared/types/business';

// Lazy load PDF generator and types
let SalaryPDFGeneratorClass: typeof SalaryPDFGenerator | null = null;
let pdfGeneratorLoaded = false;

const loadPDFGenerator = async (): Promise<typeof SalaryPDFGenerator> => {
    if (!pdfGeneratorLoaded) {
        const { SalaryPDFGenerator: Generator } = await import('@shared/lib/pdf/salary-pdf-generator');
        SalaryPDFGeneratorClass = Generator;
        pdfGeneratorLoaded = true;
    }
    return SalaryPDFGeneratorClass!;
};

type SponsorLookup = Map<string, string>;

type EmployeeForPDF = {
    id: string;
    name: string;
    name_ar?: string | null;
    branches?: { name: string; name_ar?: string | null } | null;
    sponsor_id?: string | null;
    sponsors?: { name_ar?: string | null } | null;
};

const buildSponsorLookup = async (
    sponsors?: Array<{ id: string; name_ar: string } | null>,
    employees?: EmployeeForPDF[]
): Promise<SponsorLookup> => {
    const lookup = new Map<string, string>();

    sponsors?.forEach((sponsor) => {
        if (!sponsor?.id) return;
        const nameAr = sponsor.name_ar?.trim();
        if (nameAr) {
            lookup.set(sponsor.id, nameAr);
        }
    });

    employees?.forEach((employee) => {
        const sponsorId = employee.sponsor_id ?? null;
        const nameAr = employee.sponsors?.name_ar?.trim();
        if (sponsorId && nameAr && !lookup.has(sponsorId)) {
            lookup.set(sponsorId, nameAr);
        }
    });

    if (lookup.size === 0) {
        const { data } = await supabase.from('sponsors').select('id, name_ar');
        data?.forEach((sponsor) => {
            if (!sponsor?.id) return;
            const nameAr = sponsor.name_ar?.trim();
            if (nameAr) {
                lookup.set(sponsor.id, nameAr);
            }
        });
    }

    return lookup;
};

export const useSalaryPDFGenerator = () => {
    const processNetSalaryData = useCallback((
        calculations: SalaryCalculation[],
        employees: EmployeeForPDF[],
        sponsorLookup: SponsorLookup
    ): SalaryPDFData[] => {
        return calculations.map(calc => {
            // Calculate net salary (gross - loans - deductions)
            const grossSalary = calc.basicSalary + calc.commission + calc.targetBonus + calc.extraBonuses;
            const netSalary = grossSalary - calc.loans - calc.deductions;

            // Apply 400 SAR minimum rule
            let transferAmount: number;
            let loanAmount: number | undefined;
            let hasLoanNote = false;

            if (netSalary < 400) {
                // Transfer 400 SAR minimum, create loan for the difference
                transferAmount = 400;
                loanAmount = netSalary - 400; // Will be negative
                hasLoanNote = true;
            } else {
                // Transfer actual net salary
                transferAmount = netSalary;
                hasLoanNote = false;
            }

            // Find employee data (English and Arabic names)
            // Use a more resilient match (try ID first if available in calculations, then name)
            const employee = employees.find(emp =>
                (calc.employeeId && emp.id === calc.employeeId) ||
                emp.name.toLowerCase() === calc.employeeName.toLowerCase()
            );

            // Use Arabic branch name if available, fallback to English
            const branch = employee?.branches?.name_ar || employee?.branches?.name || 'U?OñO1 O§USOñ U.O1OñU^U?';
            const employeeNameAr = employee?.name_ar || calc.employeeName;

            // Find sponsor information
            const sponsorId = employee?.sponsor_id ?? null;
            const sponsorNameAr =
                (sponsorId ? sponsorLookup.get(sponsorId) : undefined) ||
                employee?.sponsors?.name_ar ||
                '';
            const sponsorName = sponsorNameAr || '';

            return {
                branch,
                employeeName: calc.employeeName, // Keep English for compatibility
                employeeNameAr,
                transferAmount,
                loanAmount,
                hasLoanNote,
                sponsorName,
                sponsorNameAr,
                sponsorId,
            };
        });
    }, []);

    const processGrossSalaryData = useCallback((
        calculations: SalaryCalculation[],
        employees: EmployeeForPDF[],
        sponsorLookup: SponsorLookup
    ): SalaryPDFData[] => {
        return calculations.map(calc => {
            // Calculate gross salary (before deductions and loans)
            const grossSalary = calc.basicSalary + calc.commission + calc.targetBonus + calc.extraBonuses;

            // For gross salary PDF, transfer amount is the full gross salary
            const transferAmount = grossSalary;

            // Find employee data (English and Arabic names)
            // Use a more resilient match (try ID first if available in calculations, then name)
            const employee = employees.find(emp =>
                (calc.employeeId && emp.id === calc.employeeId) ||
                emp.name.toLowerCase() === calc.employeeName.toLowerCase()
            );

            // Use Arabic branch name if available, fallback to English
            const branch = employee?.branches?.name_ar || employee?.branches?.name || 'U?OñO1 O§USOñ U.O1OñU^U?';
            const employeeNameAr = employee?.name_ar || calc.employeeName;

            // Find sponsor information
            const sponsorId = employee?.sponsor_id ?? null;
            const sponsorNameAr =
                (sponsorId ? sponsorLookup.get(sponsorId) : undefined) ||
                employee?.sponsors?.name_ar ||
                '';
            const sponsorName = sponsorNameAr || '';

            return {
                branch,
                employeeName: calc.employeeName, // Keep English for compatibility
                employeeNameAr,
                transferAmount,
                loanAmount: undefined, // No loan amounts for gross salary
                hasLoanNote: false, // No loan notes for gross salary
                sponsorName,
                sponsorNameAr,
                sponsorId,
            };
        });
    }, []);

    const generatePDF = useCallback(async (
        calculations: SalaryCalculation[],
        selectedMonth: string,
        employees: EmployeeForPDF[],
        sponsors?: Array<{ id: string; name_ar: string } | null>
    ) => {
        const sponsorLookup = await buildSponsorLookup(sponsors, employees);
        const pdfData = processNetSalaryData(calculations, employees, sponsorLookup);
        const Generator = await loadPDFGenerator();
        const generator = new Generator(true); // Enable RTL Arabic
        await generator.generateSalaryPDF(pdfData, selectedMonth);
    }, [processNetSalaryData]);

    const generatePDFBlob = useCallback(async (
        calculations: SalaryCalculation[],
        selectedMonth: string,
        employees: EmployeeForPDF[],
        sponsors?: Array<{ id: string; name_ar: string } | null>
    ): Promise<Blob> => {
        const sponsorLookup = await buildSponsorLookup(sponsors, employees);
        const pdfData = processNetSalaryData(calculations, employees, sponsorLookup);
        const Generator = await loadPDFGenerator();
        const generator = new Generator(true); // Enable RTL Arabic
        return generator.generateSalaryPDFBlob(pdfData, selectedMonth);
    }, [processNetSalaryData]);

    const generateGrossPDF = useCallback(async (
        calculations: SalaryCalculation[],
        selectedMonth: string,
        employees: EmployeeForPDF[],
        sponsors?: Array<{ id: string; name_ar: string } | null>
    ) => {
        const sponsorLookup = await buildSponsorLookup(sponsors, employees);
        const pdfData = processGrossSalaryData(calculations, employees, sponsorLookup);
        const Generator = await loadPDFGenerator();
        const generator = new Generator(true); // Enable RTL Arabic
        await generator.generateGrossSalaryPDF(pdfData, selectedMonth);
    }, [processGrossSalaryData]);

    const generateGrossPDFBlob = useCallback(async (
        calculations: SalaryCalculation[],
        selectedMonth: string,
        employees: EmployeeForPDF[],
        sponsors?: Array<{ id: string; name_ar: string } | null>
    ): Promise<Blob> => {
        const sponsorLookup = await buildSponsorLookup(sponsors, employees);
        const pdfData = processGrossSalaryData(calculations, employees, sponsorLookup);
        const Generator = await loadPDFGenerator();
        const generator = new Generator(true); // Enable RTL Arabic
        return generator.generateGrossSalaryPDFBlob(pdfData, selectedMonth);
    }, [processGrossSalaryData]);

    return {
        generatePDF,
        generatePDFBlob,
        generateGrossPDF,
        generateGrossPDFBlob
    };
};
