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

// --- Styles ---
// TODO: Refine styles to match your branding. Use the registered font family.
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
    marginBottom: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  companyInfo: {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
  },
  logo: {
    width: 100,
    height: 60,
    objectFit: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
    color: '#333333',
    letterSpacing: 1,
  },
  employeeDetailsBlock: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fafafa',
    direction: 'rtl',
    textAlign: 'right',
  },
  employeeDetailLine: {
    fontSize: 12,
    color: '#222',
    marginBottom: 6,
    direction: 'rtl',
    textAlign: 'right',
    lineHeight: 1.8,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    color: '#444444',
    textAlign: 'right',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '70%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f8f8f8',
    padding: 5,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  tableColAmountHeader: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f8f8f8',
    padding: 5,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '70%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: 'right',
  },
  tableColAmount: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: 'right',
  },
  tableColDateHeader: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f8f8f8',
    padding: 5,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  tableColDate: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: 'right',
  },
  summarySection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  summaryLabel: {
    fontWeight: 'bold',
    minWidth: 120,
    textAlign: 'right',
    color: '#333',
  },
  summaryValue: {
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
    color: '#222',
  },
  netSalaryValue: {
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
    fontSize: 13,
    color: '#0a7c3a',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: 'grey',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    paddingTop: 5,
  },
  loanSection: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f6f6f6',
    borderRadius: 4,
    border: '1px solid #eee',
  },
  bonusSection: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f6f6f6',
    borderRadius: 4,
    border: '1px solid #eee',
  },
});

interface PayslipDocumentProps {
  data: PayslipData;
}

// Format currency helper (simple example)
const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ر.س`;
};

export const PayslipDocument: React.FC<PayslipDocumentProps> = ({ data }) => (
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

      {/* Employee Details (Arabic only, single column, RTL) */}
      <View style={styles.employeeDetailsBlock}>
        <Text style={styles.employeeDetailLine}>الاسم: {data.employee.nameAr}</Text>
        <Text style={styles.employeeDetailLine}>الفرع: {data.employee.branch}</Text>
        <Text style={styles.employeeDetailLine}>المسمى الوظيفي: {data.employee.role}</Text>
        {data.employee.email && (
          <Text style={styles.employeeDetailLine}>البريد الإلكتروني: {data.employee.email}</Text>
        )}
      </View>

      {/* Total Sales Section */}
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

      {/* Bonuses Section */}
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
              <Text style={styles.tableColDate}>{item.date}</Text>
              <Text style={styles.tableColAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.tableCol}>{item.description}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={styles.tableColDate}></Text>
            <Text style={[styles.tableColAmount, { fontWeight: 'bold', backgroundColor: '#f8f8f8' }]}>{formatCurrency(data.bonuses.reduce((sum, b) => sum + b.amount, 0))}</Text>
            <Text style={[styles.tableCol, { fontWeight: 'bold', backgroundColor: '#f8f8f8' }]}>إجمالي المكافآت</Text>
          </View>
        </View>
      </View>

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
              <Text style={styles.tableColDate}>{item.date}</Text>
              <Text style={styles.tableColAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.tableCol}>{item.description}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={styles.tableColDate}></Text>
            <Text style={[styles.tableColAmount, { fontWeight: 'bold', backgroundColor: '#f8f8f8' }]}>{formatCurrency(data.deductions.reduce((sum, d) => sum + d.amount, 0))}</Text>
            <Text style={[styles.tableCol, { fontWeight: 'bold', backgroundColor: '#f8f8f8' }]}>إجمالي الخصميات</Text>
          </View>
        </View>
      </View>

      {/* Loans Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تفاصيل السلف</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColDateHeader}>التاريخ</Text>
            <Text style={styles.tableColAmountHeader}>المبلغ</Text>
            <Text style={styles.tableColHeader}>الوصف</Text>
          </View>
          {data.loans.map((item, index) => (
            <View style={styles.tableRow} key={`loan-${index}`}>
              <Text style={styles.tableColDate}>{item.date}</Text>
              <Text style={styles.tableColAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.tableCol}>{item.description}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={styles.tableColDate}></Text>
            <Text style={[styles.tableColAmount, { fontWeight: 'bold', backgroundColor: '#f8f8f8' }]}>{formatCurrency(data.loans.reduce((sum, l) => sum + l.amount, 0))}</Text>
            <Text style={[styles.tableCol, { fontWeight: 'bold', backgroundColor: '#f8f8f8' }]}>إجمالي السلف</Text>
          </View>
        </View>
      </View>

      {/* Summary Section (RTL, label first, then value) */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>إجمالي المستحقات:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(data.summary.totalEarnings)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>إجمالي الخصميات:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(data.summary.totalDeductions)}</Text>
        </View>
        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 5, marginTop: 5 }]}> 
          <Text style={[styles.summaryLabel, {fontSize: 13}]}>صافي الراتب المستحق:</Text>
          <Text style={styles.netSalaryValue}>{formatCurrency(data.summary.netSalary)}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        تاريخ الإصدار: {data.issueDate} - هذا كشف راتب تم إنشاؤه إلكترونياً بواسطة النظام.
      </Text>
    </Page>
  </Document>
);

export default PayslipDocument; 