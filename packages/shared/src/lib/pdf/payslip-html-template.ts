import { BRAND_COLORS } from './payslip-html-constants';
import { getPayslipStyles } from './payslip-html-styles';
import {
  calculateSalesPercentage,
  formatCurrency,
  formatDate,
  getProgressColor,
} from './payslip-html-utils';

import type { PayslipData } from '@/features/manager/types/payslip';


/** Generate HTML for individual employee payslip (RTL, Arabic, A4). */
export const generatePayslipHTML = (data: PayslipData): string => {
  const salesPercentage = calculateSalesPercentage(data.totalSales, data.targetSales);
  const progressColor = getProgressColor(salesPercentage);
  const milestonePercentages = [70, 100, 120, 150];

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>${getPayslipStyles()}</style>
</head>
<body>
    <div class="page-wrapper">
         <!-- Header with logo at top center -->
         <div class="header">
             <div class="logo-container">
                  <img src="${data.companyLogoUrl || '/logo_Header/header11.png'}" alt="${data.companyName}" class="logo-img" />
             </div>
         </div>
         
         <!-- Company info below logo -->
         <div class="company-info">
             <div>${data.companyName}</div>
             <div style="font-size: 12px; color: ${BRAND_COLORS.mediumGray}; margin-top: 5px;">
                 رواتب الموظفين - نظام إكه
             </div>
         </div>

        <!-- Title -->
        <div class="title">كشف الراتب</div>

        <!-- Pay period and issue date -->
        <div class="period-info-container">
            <div class="period-info">كشف الراتب : ${data.payPeriod}</div>
            <div class="period-info">تاريخ الإصدار : ${formatDate(data.issueDate)}</div>
        </div>

        <!-- Employee Details Block -->
        <div class="employee-details-block">
            <div class="employee-detail-line">
                <strong>اسم الموظف:</strong> ${data.employee.nameAr}
            </div>
            <div class="employee-detail-line">
                <strong>الفرع:</strong> ${data.employee.branch || 'غير محدد'}
            </div>
            <div class="employee-detail-line">
                <strong>المسمى الوظيفي:</strong> ${data.employee.role}
            </div>
            ${data.employee.salaryPlan ? `
            <div class="salary-plan-block">
                <div class="salary-plan-title">نظام الراتب: ${data.employee.salaryPlan.name}</div>
                ${data.employee.salaryPlan.config?.description ? `
                <div class="salary-plan-description">${data.employee.salaryPlan.config.description}</div>
                ` : ''}
            </div>
            ` : ''}
        </div>

        <!-- Sales Performance Section (only show if there are sales AND employee has Growth Plan) -->
        ${data.totalSales > 0 && data.targetSales && data.targetSales > 0 ? `
        <div class="section">
            <div class="section-title">أداء المبيعات</div>
            <div class="sales-performance-box">
                <div class="sales-performance-row">
                    <div class="sales-performance-label">إجمالي المبيعات:</div>
                    <div class="sales-performance-value">${formatCurrency(data.totalSales)}</div>
                </div>
                <div class="sales-performance-row">
                    <div class="sales-performance-label">هدف المبيعات:</div>
                    <div class="sales-performance-value">${formatCurrency(data.targetSales)}</div>
                </div>
                
                <!-- Progress Bar -->
                <div class="sales-progress-container">
                    <div class="sales-progress-label">النسبة:</div>
                    <div class="sales-progress-bar-wrapper">
                        <div class="sales-progress-bar-container">
                            <div class="sales-progress-bar" style="width: ${Math.min(salesPercentage, 100)}%; background-color: ${progressColor};"></div>
                            ${milestonePercentages.map((percent) => `
                            <div class="sales-milestone-marker" style="right: ${Math.min(percent, 100)}%;"></div>
                            `).join('')}
                        </div>
                        ${milestonePercentages.map((percent) => `
                        <div class="sales-milestone-label" style="right: ${Math.min(percent, 100)}%;">${percent}%</div>
                        `).join('')}
                    </div>
                    <div class="sales-progress-percentage">${salesPercentage.toFixed(1)}%</div>
                </div>
                
                ${data.commissionRate && data.commissionThreshold ? `
                <div style="margin-top: 10px; font-size: 11px; color: ${BRAND_COLORS.mediumGray}; text-align: right;">
                    <strong>نسبة العمولة:</strong> ${(data.commissionRate * 100).toFixed(1)}% على المبيعات فوق ${formatCurrency(data.commissionThreshold)}
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}

        <!-- Bonuses Section -->
        <div class="section">
            <div class="section-title">المكافآت والإضافات</div>
            ${data.bonuses.length > 0 ? `
            <table class="table">
                <thead>
                    <tr>
                        <th class="table-col-description">الوصف</th>
                        <th class="table-col-amount">المبلغ</th>
                        <th class="table-col-date">التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.bonuses.map((bonus) => `
                    <tr>
                        <td>${bonus.description}</td>
                        <td class="positive-amount">+${formatCurrency(bonus.amount)}</td>
                        <td>${formatDate(bonus.date)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : `
            <div class="empty-table-row">لا توجد مكافآت هذا الشهر</div>
            `}
        </div>

        <!-- Deductions Section -->
        <div class="section">
            <div class="section-title">الخصومات</div>
            ${data.deductions.length > 0 ? `
            <table class="table">
                <thead>
                    <tr>
                        <th class="table-col-description">الوصف</th>
                        <th class="table-col-amount">المبلغ</th>
                        <th class="table-col-date">التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.deductions.map((deduction) => `
                    <tr>
                        <td>${deduction.description}</td>
                        <td class="negative-amount">-${formatCurrency(deduction.amount)}</td>
                        <td>${formatDate(deduction.date)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : `
            <div class="empty-table-row">لا توجد خصومات هذا الشهر</div>
            `}
        </div>

        <!-- Loans Section -->
        <div class="section">
            <div class="section-title">السلف</div>
            ${data.loans.length > 0 ? `
            <table class="table">
                <thead>
                    <tr>
                        <th class="table-col-description">الوصف</th>
                        <th class="table-col-amount">المبلغ</th>
                        <th class="table-col-date">التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.loans.map((loan) => `
                    <tr>
                        <td>${loan.description}</td>
                        <td class="negative-amount">-${formatCurrency(loan.amount)}</td>
                        <td>${formatDate(loan.date)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : `
            <div class="empty-table-row">لا توجد سلف هذا الشهر</div>
            `}
        </div>

        <!-- Calculation Breakdown Section -->
        <div class="section">
            <div class="section-title">تفاصيل الحساب</div>
            <div class="calculation-breakdown-box">
                <div class="calculation-explanation">حساب الراتب الشهري:</div>
                
                <div class="calculation-formula-box">
                    <div class="calculation-formula">
                        الراتب الأساسي + العمولة + المكافآت - الخصومات - السلف = صافي الراتب
                    </div>
                </div>
                
                <div class="calculation-details-table">
                    <div class="calculation-row">
                        <div class="calculation-label">الراتب الأساسي:</div>
                        <div class="calculation-value">${formatCurrency(data.baseSalary)}</div>
                    </div>
                    <div class="calculation-row">
                        <div class="calculation-label">العمولة:</div>
                        <div class="calculation-value">${formatCurrency(data.commission)}</div>
                    </div>
                    ${data.bonuses.length > 0 ? `
                    <div class="calculation-row">
                        <div class="calculation-label">إجمالي المكافآت:</div>
                        <div class="calculation-value">${formatCurrency(data.bonuses.reduce((sum, b) => sum + b.amount, 0))}</div>
                    </div>
                    ` : ''}
                    ${data.deductions.length > 0 ? `
                    <div class="calculation-row">
                        <div class="calculation-label">إجمالي الخصومات:</div>
                        <div class="calculation-value">-${formatCurrency(data.deductions.reduce((sum, d) => sum + d.amount, 0))}</div>
                    </div>
                    ` : ''}
                    ${data.loans.length > 0 ? `
                    <div class="calculation-row">
                        <div class="calculation-label">إجمالي السلف:</div>
                        <div class="calculation-value">-${formatCurrency(data.loans.reduce((sum, l) => sum + l.amount, 0))}</div>
                    </div>
                    ` : ''}
                    
                    <div class="calculation-row calculation-total-row">
                        <div class="calculation-total-label">صافي الراتب:</div>
                        <div class="calculation-total-value">${formatCurrency(data.summary.netSalary)}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Summary Section -->
        <div class="summary-section">
            <div class="summary-row">
                <div class="summary-label">إجمالي الأرباح:</div>
                <div class="summary-value">${formatCurrency(data.summary.totalEarnings)}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">إجمالي الخصومات:</div>
                <div class="summary-value">${formatCurrency(data.summary.totalDeductions)}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">صافي الراتب:</div>
                <div class="net-salary-value">${formatCurrency(data.summary.netSalary)}</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <span>${data.companyName} - ${formatDate(data.issueDate)}</span>
            <span style="margin: 0 10px;">•</span>
            <span>مستند معتمد - الرجاء الاحتفاظ به كسجل</span>
        </div>
    </div>
</body>
</html>`;
};
