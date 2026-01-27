import { BRAND_COLORS } from './salary-html-template';

export const getSalaryPDFStyles = (): string => `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'IBM Plex Sans Arabic', 'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif;
}

html, body {
    width: 794px;
    min-height: 1123px;
    background: ${BRAND_COLORS.cream};
}

body {
    direction: rtl;
    color: ${BRAND_COLORS.darkGray};
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    min-height: 1123px;
}

.page-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 30px;
    min-height: 1123px;
    background: ${BRAND_COLORS.white};
}

.content {
    flex: 1;
}

.header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 3px solid ${BRAND_COLORS.gold};
}

.logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    width: 100%;
}

.logo-img {
    width: 60%;
    max-width: 476px;
    height: auto;
    object-fit: contain;
    margin: 0 auto;
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
}

.header-text {
    text-align: center;
}

.report-title {
    font-size: 20px;
    color: ${BRAND_COLORS.gold};
    font-weight: 700;
}

.report-subtitle {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
}

.summary-bar {
    background: linear-gradient(135deg, ${BRAND_COLORS.goldDark} 0%, ${BRAND_COLORS.gold} 100%);
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 25px;
    display: flex;
    justify-content: space-around;
    color: white;
    box-shadow: 0 8px 20px rgba(168, 141, 74, 0.25);
    border: 1px solid rgba(255,255,255,0.2);
}

.summary-item {
    text-align: center;
}

.summary-label {
    font-size: 11px;
    opacity: 0.9;
}

.summary-value {
    font-size: 18px;
    font-weight: bold;
}

.sponsor-summary {
    background: white;
    border: 2px solid ${BRAND_COLORS.goldLight};
    border-radius: 12px;
    margin-bottom: 25px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    position: relative;
}

.sponsor-summary::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    background: ${BRAND_COLORS.gold};
    border-radius: 0 12px 12px 0;
}

.sponsor-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    min-width: 0;
    align-items: stretch;
}

@media print {
    .sponsor-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.sponsor-box {
    background: #f9f9f9;
    padding: 16px 14px;
    border-radius: 8px;
    border: 1px solid #eee;
    text-align: center;
    transition: all 0.3s ease;
    min-width: 0;
    min-height: 78px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.sponsor-name {
    font-size: 14px;
    color: #2d2d2d;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.6;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    width: 100%;
    min-width: 0;
}

.sponsor-total {
    font-size: 16px;
    color: ${BRAND_COLORS.goldDark};
    font-weight: bold;
}

.official-seal {
    position: absolute;
    bottom: 40px;
    left: 40px;
    width: 120px;
    height: 120px;
    border: 4px double ${BRAND_COLORS.gold};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: ${BRAND_COLORS.gold};
    font-weight: bold;
    opacity: 0.2;
    transform: rotate(-15deg);
    pointer-events: none;
    text-transform: uppercase;
}

/* TWO-COLUMN GRID FOR TABLES ONLY */
.branches-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.branch-card {
    background: white;
    border: 1px solid rgba(198, 169, 97, 0.2);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
}

.branch-header {
    background: ${BRAND_COLORS.darkGray};
    color: white;
    padding: 12px 15px;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid ${BRAND_COLORS.gold};
}

.branch-badge {
    background: ${BRAND_COLORS.gold};
    color: ${BRAND_COLORS.darkGray};
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    table-layout: fixed;
}

th {
    background: ${BRAND_COLORS.lightGray};
    color: ${BRAND_COLORS.darkGray};
    padding: 8px 10px;
    text-align: right;
    font-weight: bold;
    font-size: 11px;
    border-bottom: 2px solid ${BRAND_COLORS.goldLight};
}

th:nth-child(1) {
    width: 30%;
}

th:nth-child(2) {
    width: 40%;
}

th:nth-child(3) {
    width: 20%;
}

th:nth-child(4) {
    width: 10%;
}

td {
    padding: 8px 10px;
    border-bottom: 1px solid #eee;
    text-align: right;
    vertical-align: top;
}

td.sponsor-cell {
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    line-height: 1.4;
    font-size: 12px;
}

tr:nth-child(even) {
    background: ${BRAND_COLORS.cream};
}

.amount {
    font-weight: 600;
    color: ${BRAND_COLORS.darkGray};
}

.loan {
    color: #c0392b;
    font-weight: 600;
}

.branch-footer {
    background: ${BRAND_COLORS.lightGray};
    padding: 10px 12px;
    font-weight: bold;
    font-size: 13px;
    color: ${BRAND_COLORS.darkGray};
    border-top: 2px solid ${BRAND_COLORS.gold};
    display: flex;
    justify-content: space-between;
}

.footer-total {
    color: ${BRAND_COLORS.goldDark};
}

.loan-notes {
    padding: 8px 12px;
    background: #fffbeb;
    font-size: 11px;
    color: #92400e;
    border-top: 1px dashed ${BRAND_COLORS.goldLight};
}

.page-footer {
    margin-top: auto;
    padding-top: 15px;
    border-top: 2px solid ${BRAND_COLORS.gold};
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: ${BRAND_COLORS.darkGray};
}
`;