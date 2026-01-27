import { BRAND_COLORS } from './salary-pdf-constants';

export const getSalaryPDFStyles = (): string => {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
        }

        html, body {
            width: 100%;
            min-height: 100%;
            background: ${BRAND_COLORS.cream};
        }

        body {
            direction: rtl;
            color: ${BRAND_COLORS.darkGray};
            line-height: 1.5;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        .page-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 15px 20px;
            background: ${BRAND_COLORS.cream};
        }

        .content {
            flex: 1;
        }

         .header {
             text-align: center;
             margin-bottom: 20px;
             width: 100%;
         }

         .header-content {
             display: flex;
             align-items: center;
             justify-content: center;
             gap: 15px;
         }
         
         .logo-container {
             width: 100%;
             display: flex;
             justify-content: center;
             margin-bottom: 10px;
         }

         .logo-img {
             width: 60%;
             max-width: 476px;
             height: auto;
             object-fit: contain;
             margin: 0 auto;
         }

        .header-text {
            text-align: right;
        }

        .report-title {
            font-size: 18px;
            color: ${BRAND_COLORS.gold};
            font-weight: 700;
        }

        .report-subtitle {
            font-size: 11px;
            color: #666;
            margin-top: 2px;
        }

        .summary-bar {
            background: linear-gradient(135deg, ${BRAND_COLORS.gold} 0%, ${BRAND_COLORS.goldDark} 100%);
            padding: 10px 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-around;
            color: white;
        }

        .summary-item {
            text-align: center;
        }

        .summary-label {
            font-size: 10px;
            opacity: 0.9;
        }

        .summary-value {
            font-size: 16px;
            font-weight: bold;
        }

        .sponsor-summary-section {
            background: white;
            border: 1px solid ${BRAND_COLORS.goldLight};
            border-radius: 8px;
            margin-bottom: 15px;
            padding: 10px;
        }

        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: ${BRAND_COLORS.darkGray};
            margin-bottom: 8px;
            padding-right: 5px;
            border-right: 3px solid ${BRAND_COLORS.gold};
        }

        .sponsor-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .sponsor-card {
            flex: 1;
            min-width: 180px;
            background: ${BRAND_COLORS.lightGray};
            padding: 10px 14px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }

        .sponsor-name {
            font-size: 12px;
            font-weight: 600;
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: right;
        }

        .sponsor-total {
            font-size: 13px;
            font-weight: bold;
            color: ${BRAND_COLORS.goldDark};
            flex-shrink: 0;
            white-space: nowrap;
        }

        .branches-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .branch-card {
            background: white;
            border: 1px solid ${BRAND_COLORS.goldLight};
            border-radius: 8px;
            overflow: hidden;
        }

        .branch-header {
            background: ${BRAND_COLORS.darkGray};
            color: white;
            padding: 8px 10px;
            font-size: 12px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .branch-badge {
            background: ${BRAND_COLORS.gold};
            color: ${BRAND_COLORS.darkGray};
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }

        th {
            background: ${BRAND_COLORS.lightGray};
            color: ${BRAND_COLORS.darkGray};
            padding: 6px 8px;
            text-align: right;
            font-weight: bold;
            font-size: 10px;
            border-bottom: 2px solid ${BRAND_COLORS.goldLight};
        }

        td {
            padding: 6px 8px;
            border-bottom: 1px solid #eee;
            text-align: right;
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
            padding: 8px 10px;
            font-weight: bold;
            font-size: 11px;
            color: ${BRAND_COLORS.darkGray};
            border-top: 1px solid ${BRAND_COLORS.gold};
            display: flex;
            justify-content: space-between;
        }

        .footer-total {
            color: ${BRAND_COLORS.goldDark};
        }

        .loan-notes {
            padding: 6px 10px;
            background: #fffbeb;
            font-size: 10px;
            color: #92400e;
            border-top: 1px dashed ${BRAND_COLORS.goldLight};
        }

        .page-footer {
            margin-top: 10px;
            padding-top: 8px;
            border-top: 2px solid ${BRAND_COLORS.gold};
            text-align: center;
            font-size: 10px;
            font-weight: 600;
            color: ${BRAND_COLORS.darkGray};
        }
    `;
};
