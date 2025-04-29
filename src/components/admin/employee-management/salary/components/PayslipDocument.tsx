import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { PayslipData } from '../../../../../types/payslip'; // Use relative path from src

// Register IBM Plex Sans Arabic font
Font.register({
  family: 'IBM Plex Sans Arabic',
  src: '/fonts/IBMPlexSansArabic-Regular.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

// Styles with improved aesthetics
const styles = StyleSheet.create({
  page: {
    fontFamily: 'IBM Plex Sans Arabic',
    direction: 'rtl',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 11,
    lineHeight: 1.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#C4A36F',
  },
  companyInfo: {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  logo: {
    width: 120,
    height: 70,
    objectFit: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#C4A36F',
    letterSpacing: 1,
  },
  employeeDetailsBlock: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#C4A36F',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#FBF7F0',
  },
  employeeDetailLine: {
    fontSize: 13,
    color: '#222',
    marginBottom: 8,
    direction: 'rtl',
    textAlign: 'right',
    lineHeight: 1.8,
  },
  section: {
    marginBottom: 20,
    display: 'flex',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#C4A36F',
    color: '#222',
    textAlign: 'right',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#C4A36F',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#C4A36F',
    minHeight: 35,
    alignItems: 'center',
  },
  tableColHeader: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#C4A36F',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FBF7F0',
    color: '#222',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'right',
  },
  tableColAmountHeader: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#C4A36F',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FBF7F0',
    color: '#222',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'right',
  },
  tableColDateHeader: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#C4A36F',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FBF7F0',
    color: '#222',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'right',
  },
  tableCol: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#C4A36F',
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: 'right',
  },
  tableColAmount: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#C4A36F',
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: 'right',
  },
  tableColDate: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#C4A36F',
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: 'right',
  },
  summarySection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FBF7F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C4A36F',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#222',
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
  summaryValue: {
    fontSize: 13,
    color: '#222',
    textAlign: 'left',
    minWidth: 120,
    marginRight: 15,
  },
  netSalaryValue: {
    fontWeight: 'bold',
    textAlign: 'left',
    minWidth: 120,
    marginRight: 15,
    fontSize: 15,
    color: '#C4A36F',
  },
  salaryPlanBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#C4A36F',
    borderTopStyle: 'dashed',
    width: '100%',
  },
  salaryPlanTitle: {
    fontSize: 13,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 6,
    direction: 'rtl',
    textAlign: 'right',
  },
  salaryPlanDescription: {
    fontSize: 11,
    color: '#666',
    direction: 'rtl',
    textAlign: 'right',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#C4A36F',
    paddingTop: 10,
  },
});

interface PayslipDocumentProps {
  data: PayslipData;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ar-SA')} ر.س`;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  // Convert any date format to YYYY-MM-DD
  return dateString.split('T')[0];
};

export const PayslipDocument: React.FC<PayslipDocumentProps> = ({ data }) => {
  // Debug log to check what data we're receiving
  console.log('Employee Data:', data.employee);
  console.log('Salary Plan:', data.employee.salaryPlan);

  const getSalaryPlanDisplay = () => {
    // Case 1: We have a properly structured salaryPlan with config
    if (data.employee.salaryPlan?.config) {
      const config = data.employee.salaryPlan.config;
      
      // If config has name and description directly
      if (typeof config.name === 'string' && typeof config.description === 'string') {
        return {
          name: config.name,
          description: config.description
        };
      }
      
      // Try to determine name and description based on plan type
      if (data.employee.salaryPlan.type === 'fixed') {
        // Get amount from blocks if available
        let amount = 0;
        if (Array.isArray(config.blocks)) {
          const fixedBlock = config.blocks.find((block: { 
            type: string; 
            config?: { 
              amount?: number 
            } 
          }) => 
            block.type === 'fixed_amount' && typeof block.config?.amount === 'number'
          );
          if (fixedBlock) {
            amount = fixedBlock.config?.amount || 0;
          }
        }
        
        return {
          name: config.name || data.employee.salaryPlan.name || 'راتب ثابت',
          description: config.description || `راتب شهري ثابت ${amount} ريال`
        };
      }
      
      // For dynamic plans
      return {
        name: config.name || data.employee.salaryPlan.name || 'خطة متغيرة',
        description: config.description || 'راتب أساسي مع عمولة مبيعات'
      };
    }

    // Case 2: Specific fallback for fixed salary plan 1800
    if (data.employee.salary_plan_id === 'a8b69d42-aaa1-4a95-8717-13fe6e99550d') {
      return {
        name: 'راتب ثابت',
        description: 'راتب شهري ثابت ١٨٠٠ ريال'
      };
    }

    // Case 3: General fallback - we know the plan ID but don't have the details
    if (data.employee.salary_plan_id) {
      return {
        name: 'خطة الراتب',
        description: `خطة راتب (${data.employee.salary_plan_id.substring(0, 8)}...)`
      };
    }

    // Default fallback
    return {
      name: 'خطة الراتب الأساسية',
      description: 'راتب شهري أساسي'
    };
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text>{data.companyName}</Text>
          </View>
          <Image style={styles.logo} src={data.companyLogoUrl} />
        </View>

        {/* Title */}
        <Text style={styles.title}>كشف الراتب الشهري - {data.payPeriod}</Text>

        {/* Employee Details */}
        <View style={styles.employeeDetailsBlock}>
          <Text style={styles.employeeDetailLine}>الاسم: {data.employee.nameAr}</Text>
          <Text style={styles.employeeDetailLine}>الفرع: {data.employee.branch}</Text>
          <Text style={styles.employeeDetailLine}>المسمى الوظيفي: {data.employee.role}</Text>
          
          {/* Salary Plan Details - Always show */}
          <View style={styles.salaryPlanBlock}>
            <Text style={styles.salaryPlanTitle}>نظام الراتب: {getSalaryPlanDisplay().name}</Text>
            <Text style={styles.salaryPlanDescription}>
              {getSalaryPlanDisplay().description}
            </Text>
          </View>
        </View>

        {/* Total Sales Section */}
        {data.totalSales > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إجمالي المبيعات لهذا الشهر</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColAmountHeader}>المبلغ</Text>
                <Text style={styles.tableColHeader}>الوصف</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableColAmount}>{formatCurrency(data.totalSales)}</Text>
                <Text style={styles.tableCol}>إجمالي المبيعات</Text>
              </View>
            </View>
          </View>
        )}

        {/* Bonuses Section - Only show if there are bonuses */}
        {data.bonuses && data.bonuses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تفاصيل المكافآت</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColDateHeader}>التاريخ</Text>
                <Text style={styles.tableColAmountHeader}>المبلغ</Text>
                <Text style={styles.tableColHeader}>الوصف</Text>
              </View>
              {data.bonuses.map((item, index) => (
                <View style={styles.tableRow} key={`bonus-${index}`}>
                  <Text style={styles.tableColDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.tableColAmount}>{formatCurrency(item.amount)}</Text>
                  <Text style={styles.tableCol}>{item.description}</Text>
                </View>
              ))}
              <View style={styles.tableRow}>
                <Text style={styles.tableColDate}></Text>
                <Text style={[styles.tableColAmount, { fontWeight: 'bold', backgroundColor: '#FBF7F0' }]}>
                  {formatCurrency(data.bonuses.reduce((sum, b) => sum + b.amount, 0))}
                </Text>
                <Text style={[styles.tableCol, { fontWeight: 'bold', backgroundColor: '#FBF7F0' }]}>
                  إجمالي المكافآت
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Deductions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل الخصميات</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColDateHeader}>التاريخ</Text>
              <Text style={styles.tableColAmountHeader}>المبلغ</Text>
              <Text style={styles.tableColHeader}>الوصف</Text>
            </View>
            {data.deductions.map((item, index) => (
              <View style={styles.tableRow} key={`deduction-${index}`}>
                <Text style={styles.tableColDate}>{formatDate(item.date)}</Text>
                <Text style={styles.tableColAmount}>{formatCurrency(item.amount)}</Text>
                <Text style={styles.tableCol}>{item.description}</Text>
              </View>
            ))}
            <View style={styles.tableRow}>
              <Text style={styles.tableColDate}></Text>
              <Text style={[styles.tableColAmount, { fontWeight: 'bold', backgroundColor: '#FBF7F0' }]}>
                {formatCurrency(data.deductions.reduce((sum, d) => sum + d.amount, 0))}
              </Text>
              <Text style={[styles.tableCol, { fontWeight: 'bold', backgroundColor: '#FBF7F0' }]}>
                إجمالي الخصميات
              </Text>
            </View>
          </View>
        </View>

        {/* Loans Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل القروض</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColDateHeader}>التاريخ</Text>
              <Text style={styles.tableColAmountHeader}>المبلغ</Text>
              <Text style={styles.tableColHeader}>الوصف</Text>
            </View>
            {data.loans.map((item, index) => (
              <View style={styles.tableRow} key={`loan-${index}`}>
                <Text style={styles.tableColDate}>{formatDate(item.date)}</Text>
                <Text style={styles.tableColAmount}>{formatCurrency(item.amount)}</Text>
                <Text style={styles.tableCol}>{item.description}</Text>
              </View>
            ))}
            <View style={styles.tableRow}>
              <Text style={styles.tableColDate}></Text>
              <Text style={[styles.tableColAmount, { fontWeight: 'bold', backgroundColor: '#FBF7F0' }]}>
                {formatCurrency(data.loans.reduce((sum, l) => sum + l.amount, 0))}
              </Text>
              <Text style={[styles.tableCol, { fontWeight: 'bold', backgroundColor: '#FBF7F0' }]}>
                إجمالي القروض
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Section with swapped columns */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryValue}>{formatCurrency(data.summary.totalEarnings)}</Text>
            <Text style={styles.summaryLabel}>:إجمالي المستحقات</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryValue}>{formatCurrency(data.summary.totalDeductions)}</Text>
            <Text style={styles.summaryLabel}>:إجمالي الخصميات</Text>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#C4A36F', paddingTop: 10, marginTop: 10 }]}>
            <Text style={styles.netSalaryValue}>{formatCurrency(data.summary.netSalary)}</Text>
            <Text style={[styles.summaryLabel, { fontSize: 14 }]}>:صافي الراتب المستحق</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          تاريخ الإصدار: {data.issueDate} - هذا كشف راتب تم إنشاؤه إلكترونياً بواسطة النظام.
        </Text>
      </Page>
    </Document>
  );
};

export default PayslipDocument; 