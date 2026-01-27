import { PDFSummary } from './salary-pdf-constants';
import { SalaryPDFData } from './salary-pdf-generator';

// Helper function to format month for filename
export const formatMonthForFilename = (selectedMonth: string): string => {
    try {
        const date = new Date(`${selectedMonth  }-01`);
        const monthName = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        return `${monthName}_${year}`;
    } catch {
        // Fallback if date parsing fails
        return selectedMonth.replace('-', '_');
    }
};

export const calculateSummaries = (data: SalaryPDFData[]): PDFSummary => {
    const branchMap = new Map<string, { employees: number; totalTransfer: number; totalLoans: number }>();
    const sponsorMap = new Map<string, { employees: number; totalTransfer: number; sponsorName?: string; sponsorNameAr?: string; sponsorId?: string | null }>();

    data.forEach(item => {
        const branchName = item.branch || 'Unknown Branch';
        const sponsorKey = item.sponsorId || item.sponsorNameAr || item.sponsorName || 'Unassigned';

        if (!branchMap.has(branchName)) {
            branchMap.set(branchName, { employees: 0, totalTransfer: 0, totalLoans: 0 });
        }
        const branchData = branchMap.get(branchName)!;
        branchData.employees += 1;
        branchData.totalTransfer += item.transferAmount || 0;
        branchData.totalLoans += item.loanAmount || 0;

        if (!sponsorMap.has(sponsorKey)) {
            sponsorMap.set(sponsorKey, {
                employees: 0,
                totalTransfer: 0,
                sponsorName: item.sponsorName,
                sponsorNameAr: item.sponsorNameAr,
                sponsorId: item.sponsorId,
            });
        }
        const sponsorData = sponsorMap.get(sponsorKey)!;
        sponsorData.employees += 1;
        sponsorData.totalTransfer += item.transferAmount || 0;
    });

    const branchSummaries = Array.from(branchMap.entries()).map(([branchName, b]) => ({
        branchName,
        employeeCount: b.employees,
        totalTransfer: b.totalTransfer,
        totalLoans: b.totalLoans,
    }));

    const sponsorSummaries = Array.from(sponsorMap.entries())
        .map(([key, s]) => ({
            sponsorId: s.sponsorId,
            sponsorName: key === 'Unassigned' ? 'غير محدد' : (s.sponsorName || key),
            sponsorNameAr: s.sponsorNameAr,
            employeeCount: s.employees,
            totalTransfer: s.totalTransfer,
        }))
        .sort((a, b) => b.totalTransfer - a.totalTransfer);

    const totalEmployees = data.length;
    const totalTransferAmount = data.reduce((sum, emp) => sum + (emp.transferAmount || 0), 0);
    const totalLoansAmount = data.reduce((sum, emp) => sum + (emp.loanAmount || 0), 0);

    return {
        totalEmployees,
        totalTransferAmount,
        totalLoansAmount,
        branchSummaries,
        sponsorSummaries,
    };
};
