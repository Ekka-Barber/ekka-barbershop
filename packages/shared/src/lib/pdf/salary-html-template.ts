import { getSalaryPDFStyles } from './salary-html-styles';

// EKKAH Brand Colors
export const BRAND_COLORS = {
    gold: '#c6a961',
    goldLight: '#d4bc7f',
    goldDark: '#a88d4a',
    darkGray: '#4a4a4a',
    lightGray: '#f5f3ee',
    white: '#ffffff',
    cream: '#ffffff',
};

// Generate HTML template - PORTRAIT with two-column grid for TABLES only
// Full A4 page with footer at bottom
export const generateSalaryHTML = (
    data: SalaryPDFData[],
    summary: {
        totalEmployees: number;
        totalTransferAmount: number;
        totalLoansAmount: number;
        branchSummaries: Array<{
            branchName: string;
            employeeCount: number;
            totalTransfer: number;
            totalLoans: number;
        }>;
        sponsorSummaries: Array<{
            sponsorId?: string | null;
            sponsorName: string;
            sponsorNameAr?: string;
            employeeCount: number;
            totalTransfer: number;
        }>;
    },
    selectedMonth: string,
    isGross: boolean = false
): string => {
    const monthNameAr = new Date(selectedMonth).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
    const monthNameEn = new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const branchGroups = data.reduce((groups, item) => {
        if (!groups[item.branch]) {
            groups[item.branch] = [];
        }
        groups[item.branch].push(item);
        return groups;
    }, {} as Record<string, SalaryPDFData[]>);

    const branchEntries = Object.entries(branchGroups);

    // A4 dimensions at 96 DPI: 794 x 1123 pixels
    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>${getSalaryPDFStyles()}</style>
</head>
<body>
    <div class="page-wrapper">
        <div class="content">
            <div class="header">
                <div class="logo-container">
                     <img src="/logo_Header/header11.png" alt="EKKAH" class="logo-img" />
                </div>
                <div class="header-content">
                    <div class="header-text">
                        <div class="report-title">${isGross ? 'كشف إجمالي الرواتب الشهرية' : 'كشف الرواتب الشهرية'} - ${monthNameAr}</div>
                        <div class="report-subtitle">${isGross ? 'إجمالي المرتبات قبل الخصومات' : 'صافي المرتبات المراد تحويلها عبر البنك'}</div>
                    </div>
                </div>
            </div>

            <div class="summary-bar">
                <div class="summary-item">
                    <div class="summary-label">إجمالي الموظفين</div>
                    <div class="summary-value">${summary.totalEmployees}</div>
                    <div style="font-size: 8px; opacity: 0.8; margin-top: 2px;">Total Employees</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">إجمالي المبالغ المحولة</div>
                    <div class="summary-value">${Math.round(summary.totalTransferAmount).toLocaleString('en-US')} ر.س</div>
                    <div style="font-size: 8px; opacity: 0.8; margin-top: 2px;">Total Amount (SAR)</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">عدد الفروع</div>
                    <div class="summary-value">${summary.branchSummaries.length}</div>
                    <div style="font-size: 8px; opacity: 0.8; margin-top: 2px;">Total Branches</div>
                </div>
                ${summary.totalLoansAmount < 0 ? `
                <div class="summary-item">
                    <div class="summary-label">إجمالي السلف</div>
                    <div class="summary-value">${Math.round(Math.abs(summary.totalLoansAmount)).toLocaleString('en-US')} ر.س</div>
                    <div style="font-size: 8px; opacity: 0.8; margin-top: 2px;">Total Loans</div>
                </div>
                ` : ''}
            </div>

            ${(() => {
                const sponsorSummaries = summary.sponsorSummaries?.length ? summary.sponsorSummaries : deriveSponsorSummaries(data);
                return sponsorSummaries.length > 0 ? `
            <div class="sponsor-summary">
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 15px; color: ${BRAND_COLORS.goldDark}; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid ${BRAND_COLORS.lightGray}; padding-bottom: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: ${BRAND_COLORS.gold};"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    إجمالي مبالغ الكفلاء (Sponsor Totals)
                </div>
                <div class="sponsor-grid">
                    ${sponsorSummaries.map(s => `
                        <div class="sponsor-box">
                            <div class="sponsor-name">${s.sponsorNameAr || s.sponsorName}</div>
                            <div class="sponsor-total">${Math.round(s.totalTransfer).toLocaleString('en-US')} ر.س</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : '';
            })()}

            <div class="branches-container">
                ${branchEntries.map(([branchName, branchData]) => {
                    const branchSummary = summary.branchSummaries.find(b => b.branchName === branchName)!;
                    const hasLoans = branchData.some(item => item.hasLoanNote);

                    return `
                    <div class="branch-card">
                        <div class="branch-header">
                            <span>${branchName}</span>
                            <span class="branch-badge">${branchSummary.employeeCount} موظف</span>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>اسم الموظف</th>
                                    <th>الكفيل</th>
                                    <th>${isGross ? 'إجمالي المرتب' : 'المبلغ'}</th>
                                    ${hasLoans && !isGross ? '<th>سلفة</th>' : ''}
                                </tr>
                            </thead>
                            <tbody>
                                ${branchData.map(item => `
                                    <tr>
                                        <td>${item.employeeNameAr || item.employeeName}</td>
                                        <td class="sponsor-cell">${item.sponsorNameAr || item.sponsorName || '-'}</td>
                                        <td class="amount">${Math.round(item.transferAmount).toLocaleString('en-US')}</td>
                                        ${hasLoans && !isGross ? `<td class="loan">${item.hasLoanNote ? Math.round(item.loanAmount || 0).toLocaleString('en-US') : '-'}</td>` : ''}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div class="branch-footer">
                            <span>إجمالي:</span>
                            <span class="footer-total">${Math.round(branchSummary.totalTransfer).toLocaleString('en-US')} ر.س</span>
                        </div>

                        ${hasLoans ? `
                        <div class="loan-notes">
                            ${branchData.filter(item => item.hasLoanNote).map(item => `
                                <div>• ${item.employeeNameAr || item.employeeName}: سلفة ${Math.round(item.loanAmount || 0).toLocaleString('en-US')} ر.س</div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="official-seal">
            <div style="font-size: 14px;">EKKAH</div>
            <div style="font-size: 10px;">VERIFIED</div>
            <div style="font-size: 8px;">${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>

        <div class="page-footer">
            <span>EKKA BARBERSHOP - ${monthNameEn}</span>
        </div>
    </div>
</body>
</html>`;
};

// Types (will be imported from types file)
export interface SalaryPDFData {
    branch: string;
    employeeName: string;
    employeeNameAr: string;
    transferAmount: number;
    loanAmount?: number;
    hasLoanNote: boolean;
    sponsorName?: string;
    sponsorNameAr?: string;
    sponsorId?: string | null;
}

// Helper function to format month for filename
export const formatMonthForFilename = (selectedMonth: string): string => {
    try {
        const date = new Date(`${selectedMonth}-01`);
        const monthName = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        return `${monthName}_${year}`;
    } catch {
        return selectedMonth.replace('-', '_');
    }
};

// Helper function to calculate summaries
export const calculateSummaries = (data: SalaryPDFData[]): {
    totalEmployees: number;
    totalTransferAmount: number;
    totalLoansAmount: number;
    branchSummaries: Array<{
        branchName: string;
        employeeCount: number;
        totalTransfer: number;
        totalLoans: number;
    }>;
    sponsorSummaries: Array<{
        sponsorId?: string | null;
        sponsorName: string;
        sponsorNameAr?: string;
        employeeCount: number;
        totalTransfer: number;
    }>;
} => {
    const branchGroups = data.reduce((groups, item) => {
        if (!groups[item.branch]) {
            groups[item.branch] = [];
        }
        groups[item.branch].push(item);
        return groups;
    }, {} as Record<string, SalaryPDFData[]>);

    const branchSummaries = Object.entries(branchGroups).map(([branchName, branchData]) => ({
        branchName,
        employeeCount: branchData.length,
        totalTransfer: branchData.reduce((sum, emp) => sum + emp.transferAmount, 0),
        totalLoans: branchData.reduce((sum, emp) => sum + (emp.loanAmount || 0), 0)
    }));

    // Calculate Sponsor Summaries
    const sponsorGroups = data.reduce((groups, item) => {
        const sponsorKey = item.sponsorId || item.sponsorNameAr || item.sponsorName || 'Unassigned';
        if (!groups[sponsorKey]) {
            groups[sponsorKey] = {
                items: [],
                name: item.sponsorName,
                nameAr: item.sponsorNameAr,
                id: item.sponsorId
            };
        }
        groups[sponsorKey].items.push(item);
        return groups;
    }, {} as Record<string, { items: SalaryPDFData[]; name?: string; nameAr?: string; id?: string | null }>);

    const sponsorSummaries = Object.entries(sponsorGroups)
        .map(([key, group]) => ({
            sponsorId: group.id ?? group.items[0]?.sponsorId,
            sponsorName: key === 'Unassigned' ? 'غير محدد' : (group.name || group.items[0]?.sponsorName || key),
            sponsorNameAr: group.nameAr || group.items[0]?.sponsorNameAr,
            employeeCount: group.items.length,
            totalTransfer: group.items.reduce((sum, emp) => sum + emp.transferAmount, 0)
        })).sort((a, b) => b.totalTransfer - a.totalTransfer);

    return {
        totalEmployees: data.length,
        totalTransferAmount: branchSummaries.reduce((sum, branch) => sum + branch.totalTransfer, 0),
        totalLoansAmount: branchSummaries.reduce((sum, branch) => sum + branch.totalLoans, 0),
        branchSummaries,
        sponsorSummaries
    };
};

const deriveSponsorSummaries = (data: SalaryPDFData[]) => {
    const sponsorGroups = data.reduce((groups, item) => {
        const sponsorKey = item.sponsorId || item.sponsorNameAr || item.sponsorName || 'Unassigned';
        if (!groups[sponsorKey]) {
            groups[sponsorKey] = {
                items: [],
                name: item.sponsorName,
                nameAr: item.sponsorNameAr,
                id: item.sponsorId
            };
        }
        groups[sponsorKey].items.push(item);
        return groups;
    }, {} as Record<string, { items: SalaryPDFData[]; name?: string; nameAr?: string; id?: string | null }>);

    return Object.entries(sponsorGroups)
        .map(([key, group]) => ({
            sponsorId: group.id ?? group.items[0]?.sponsorId,
            sponsorName: key === 'Unassigned' ? 'غير محدد' : (group.name || group.items[0]?.sponsorName || key),
            sponsorNameAr: group.nameAr || group.items[0]?.sponsorNameAr,
            employeeCount: group.items.length,
            totalTransfer: group.items.reduce((sum, emp) => sum + emp.transferAmount, 0)
        }))
        .sort((a, b) => b.totalTransfer - a.totalTransfer);
};
