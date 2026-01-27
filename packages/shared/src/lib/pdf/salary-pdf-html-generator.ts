import { PDFSummary } from './salary-pdf-constants';
import { SalaryPDFData } from './salary-pdf-generator';
import { getSalaryPDFStyles } from './salary-pdf-styles';
import { calculateSummaries } from './salary-pdf-utils';

const generatePageHeader = (monthNameAr: string): string => {
    return `
    <div class="header">
        <div class="logo-container">
            <img src="/logo_Header/header11.png" alt="EKKAH" class="logo-img" />
        </div>
        <div class="header-text">
            <div class="report-title">كشف الرواتب الشهرية - ${monthNameAr}</div>
            <div class="report-subtitle">صافي المرتبات المراد تحويلها عبر البنك</div>
        </div>
    </div>`;
};

const generateSummaryBar = (summary: PDFSummary): string => {
    return `
    <div class="summary-bar">
        <div class="summary-item">
            <div class="summary-label">إجمالي الموظفين</div>
            <div class="summary-value">${summary.totalEmployees}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">إجمالي المبالغ المحولة</div>
            <div class="summary-value">${Math.round(summary.totalTransferAmount).toLocaleString('ar-SA')} ر.س</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">عدد الفروع</div>
            <div class="summary-value">${summary.branchSummaries.length}</div>
        </div>
        ${summary.totalLoansAmount < 0 ? `
        <div class="summary-item">
            <div class="summary-label">إجمالي السلف</div>
            <div class="summary-value">${Math.round(Math.abs(summary.totalLoansAmount)).toLocaleString('ar-SA')} ر.س</div>
        </div>
        ` : ''}
    </div>`;
};

const generateSponsorSummary = (summary: PDFSummary): string => {
    return `
    <div class="sponsor-summary-section">
        <div class="section-title">إجمالي الرواتب حسب الكفيل</div>
        <div class="sponsor-grid">
            ${summary.sponsorSummaries.map(s => `
                <div class="sponsor-card">
                    <span class="sponsor-name">${s.sponsorNameAr || s.sponsorName}</span>
                    <span class="sponsor-total">${Math.round(s.totalTransfer).toLocaleString('ar-SA')} ر.س</span>
                </div>
            `).join('')}
        </div>
    </div>`;
};

const generateBranchTables = (data: SalaryPDFData[], summary: PDFSummary): string => {
    const branchGroups = data.reduce((groups, item) => {
        if (!groups[item.branch]) {
            groups[item.branch] = [];
        }
        groups[item.branch].push(item);
        return groups;
    }, {} as Record<string, SalaryPDFData[]>);

    const branchEntries = Object.entries(branchGroups);

    return `
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
                            <th>المبلغ</th>
                            ${hasLoans ? '<th>سلفة</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${branchData.map(item => `
                            <tr>
                                <td>${item.employeeNameAr || item.employeeName}</td>
                                <td class="amount">${Math.round(item.transferAmount).toLocaleString('ar-SA')}</td>
                                ${hasLoans ? `<td class="loan">${item.hasLoanNote ? Math.round(item.loanAmount || 0).toLocaleString('ar-SA') : '-'}</td>` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="branch-footer">
                    <span>إجمالي:</span>
                    <span class="footer-total">${Math.round(branchSummary.totalTransfer).toLocaleString('ar-SA')} ر.س</span>
                </div>

                ${hasLoans ? `
                <div class="loan-notes">
                    ${branchData.filter(item => item.hasLoanNote).map(item => `
                        <div>• ${item.employeeNameAr || item.employeeName}: سلفة ${Math.round(item.loanAmount || 0).toLocaleString('ar-SA')} ر.س</div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
            `;
        }).join('')}
    </div>`;
};

export const generateHTML = (data: SalaryPDFData[], selectedMonth: string): string => {
    const summary = calculateSummaries(data);
    const monthNameAr = new Date(selectedMonth).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
    const monthNameEn = new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        ${getSalaryPDFStyles()}
    </style>
</head>
<body>
    <div class="page-wrapper">
        <div class="content">
            ${generatePageHeader(monthNameAr)}
            ${generateSummaryBar(summary)}
            ${generateSponsorSummary(summary)}
            ${generateBranchTables(data, summary)}
        </div>

        <div class="page-footer">
            <span>EKKA BARBERSHOP - ${monthNameEn}</span>
        </div>
    </div>
</body>
</html>`;
};
