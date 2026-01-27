import { BRAND_COLORS } from './payslip-html-constants';

/** CSS styles for the payslip HTML (A4, RTL, brand colors) */
export const getPayslipStyles = (): string => `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'IBM Plex Sans Arabic', sans-serif;
    direction: rtl;
    background-color: ${BRAND_COLORS.white};
    color: ${BRAND_COLORS.darkGray};
    font-size: 11px;
    line-height: 1.7;
    margin: 0;
    padding: 0;
  }

  .page-wrapper {
    width: 794px; /* A4 width at 96 DPI */
    min-height: 1123px; /* A4 height at 96 DPI */
    background-color: ${BRAND_COLORS.white};
    position: relative;
    margin: 0 auto;
    padding: 30px;
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    width: 100%;
  }

  .company-info {
    text-align: center;
    font-weight: bold;
    font-size: 16px;
    color: ${BRAND_COLORS.darkGray};
    margin-bottom: 20px;
  }

  .logo-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .logo-img {
    width: 60%;
    max-width: 476px;
    height: auto;
    object-fit: contain;
  }

  .title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 25px;
    color: ${BRAND_COLORS.gold};
    letter-spacing: 1px;
  }

  .period-info-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .period-info {
    font-size: 12px;
    color: ${BRAND_COLORS.mediumGray};
  }

  .employee-details-block {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-bottom: 25px;
    border: 1px solid ${BRAND_COLORS.gold};
    border-radius: 4px;
    padding: 15px;
    background-color: ${BRAND_COLORS.cream};
  }

  .employee-detail-line {
    font-size: 13px;
    color: ${BRAND_COLORS.darkGray};
    margin-bottom: 8px;
    text-align: right;
    line-height: 1.8;
    width: 100%;
  }

  .section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1.5px solid ${BRAND_COLORS.gold};
    color: ${BRAND_COLORS.darkGray};
    text-align: right;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
  }

  .table thead {
    background-color: ${BRAND_COLORS.cream};
  }

  .table th {
    border: 1px solid #e0e0e0;
    padding: 8px 10px;
    color: ${BRAND_COLORS.darkGray};
    font-weight: bold;
    font-size: 12px;
    text-align: right;
  }

  .table td {
    border: 1px solid #e0e0e0;
    padding: 8px 10px;
    text-align: right;
    font-size: 11px;
  }

  .table-col-description {
    width: 40%;
  }

  .table-col-amount {
    width: 30%;
    text-align: left;
  }

  .table-col-date {
    width: 30%;
    text-align: right;
  }

  .positive-amount {
    color: ${BRAND_COLORS.positive};
  }

  .negative-amount {
    color: ${BRAND_COLORS.negative};
  }

  .summary-section {
    margin-top: 20px;
    padding: 15px;
    background-color: ${BRAND_COLORS.cream};
    border-radius: 4px;
    border: 1px solid ${BRAND_COLORS.gold};
  }

  .summary-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 0 10px;
  }

  .summary-label {
    font-size: 13px;
    color: ${BRAND_COLORS.darkGray};
    font-weight: bold;
    text-align: right;
    flex: 1;
  }

  .summary-value {
    font-size: 13px;
    color: ${BRAND_COLORS.darkGray};
    text-align: right;
    min-width: 120px;
    margin-left: 15px;
  }

  .net-salary-value {
    font-weight: bold;
    text-align: right;
    min-width: 120px;
    margin-left: 15px;
    font-size: 15px;
    color: ${BRAND_COLORS.gold};
  }

  .salary-plan-block {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed ${BRAND_COLORS.gold};
    width: 100%;
  }

  .salary-plan-title {
    font-size: 13px;
    color: ${BRAND_COLORS.darkGray};
    font-weight: bold;
    margin-bottom: 6px;
    text-align: right;
  }

  .salary-plan-description {
    font-size: 11px;
    color: ${BRAND_COLORS.mediumGray};
    text-align: right;
    line-height: 1.5;
  }

  .sales-performance-box {
    padding: 10px;
    border: 1px solid ${BRAND_COLORS.gold};
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .sales-performance-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .sales-performance-label {
    font-size: 12px;
    color: ${BRAND_COLORS.darkGray};
    font-weight: bold;
  }

  .sales-performance-value {
    font-size: 12px;
    color: ${BRAND_COLORS.darkGray};
  }

  .sales-progress-container {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    margin-bottom: 10px;
    margin-top: 5px;
  }

  .sales-progress-label {
    font-size: 12px;
    color: ${BRAND_COLORS.darkGray};
    font-weight: bold;
    margin-left: 5px;
    width: 20%;
    text-align: right;
  }

  .sales-progress-bar-wrapper {
    position: relative;
    width: 65%;
    margin: 0 10px;
  }

  .sales-progress-bar-container {
    width: 100%;
    height: 10px;
    border: 1px solid ${BRAND_COLORS.gold};
    border-radius: 5px;
    overflow: hidden;
    position: relative;
  }

  .sales-progress-bar {
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    transition: width 0.3s ease;
  }

  .sales-progress-percentage {
    width: 15%;
    font-size: 12px;
    color: ${BRAND_COLORS.darkGray};
    text-align: left;
  }

  .sales-milestone-marker {
    position: absolute;
    width: 1px;
    height: 14px;
    background-color: #666666;
    top: -2px;
    z-index: 2;
  }

  .sales-milestone-label {
    position: absolute;
    font-size: 8px;
    color: ${BRAND_COLORS.mediumGray};
    top: 16px;
    text-align: center;
    width: 30px;
    margin-right: -15px;
  }

  .calculation-breakdown-box {
    padding: 10px;
    border: 1px solid ${BRAND_COLORS.gold};
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .calculation-explanation {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 10px;
    color: ${BRAND_COLORS.darkGray};
  }

  .calculation-formula-box {
    margin-bottom: 10px;
  }

  .calculation-formula {
    font-size: 12px;
    color: ${BRAND_COLORS.darkGray};
  }

  .calculation-details-table {
    width: 100%;
  }

  .calculation-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .calculation-label {
    font-size: 12px;
    color: ${BRAND_COLORS.darkGray};
    font-weight: bold;
    text-align: right;
  }

  .calculation-value {
    font-size: 12px;
    color: ${BRAND_COLORS.darkGray};
    text-align: left;
  }

  .calculation-total-row {
    border-top: 1px solid ${BRAND_COLORS.gold};
    padding-top: 5px;
    margin-top: 5px;
  }

  .calculation-total-label {
    font-size: 12px;
    font-weight: bold;
    color: ${BRAND_COLORS.darkGray};
    text-align: right;
  }

  .calculation-total-value {
    font-size: 12px;
    font-weight: bold;
    color: ${BRAND_COLORS.gold};
    text-align: left;
  }

  .empty-table-row {
    text-align: center;
    padding: 10px;
    color: ${BRAND_COLORS.mediumGray};
    font-style: italic;
    border-bottom: 1px solid #e0e0e0;
  }

  .footer {
    position: absolute;
    bottom: 20px;
    left: 30px;
    right: 30px;
    text-align: center;
    font-size: 9px;
    color: ${BRAND_COLORS.mediumGray};
    border-top: 1px solid ${BRAND_COLORS.gold};
    padding-top: 10px;
  }

  .currency-container {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
  }

  .currency-symbol-text {
    margin-right: 4px;
    font-size: 11px;
  }

  .currency-amount-text {
    font-size: 11px;
  }
`;
