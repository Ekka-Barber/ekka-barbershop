import {
    generateSalaryHTML,
    calculateSummaries,
    formatMonthForFilename
} from './salary-html-generator';
import type { SalaryPDFData } from './salary-html-generator';

// Re-export types for backward compatibility
export type { SalaryPDFData } from './salary-html-generator';

export class SalaryPDFGenerator {
    constructor(_rtl?: boolean) {
        // HTML-to-PDF approach - RTL is handled in HTML template
    }

    async generateSalaryPDF(
        data: SalaryPDFData[],
        selectedMonth: string
    ): Promise<void> {
        const blob = await this.generateSalaryPDFBlob(data, selectedMonth);

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const monthName = formatMonthForFilename(selectedMonth);
        link.download = `${monthName}_SALARY.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async generateSalaryPDFBlob(
        data: SalaryPDFData[],
        selectedMonth: string
    ): Promise<Blob> {
        const summary = calculateSummaries(data);
        const htmlContent = generateSalaryHTML(data, summary, selectedMonth, false);

        // Dynamically import heavy libraries only when needed
        const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
            import('html2canvas'),
            import('jspdf')
        ]);

        // Create container div - positioned off-screen but rendered
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'fixed';
        container.style.left = '-10000px';
        container.style.top = '0';
        container.style.width = '794px';
        container.style.minHeight = '1123px';
        container.style.backgroundColor = '#ffffff';

        document.body.appendChild(container);

        // Wait for fonts and images to load
        await new Promise(resolve => setTimeout(resolve, 500));
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }

        try {
            // Render HTML to canvas - full A4 page
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 794,
                height: 1123, // Full A4 height
                windowWidth: 794,
                windowHeight: 1123,
            });

            // Create PDF - PORTRAIT A4
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // A4 dimensions: 210 x 297 mm
            // Fill entire page
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

            return pdf.output('blob');
        } finally {
            document.body.removeChild(container);
        }
    }

    async generateGrossSalaryPDF(
        data: SalaryPDFData[],
        selectedMonth: string
    ): Promise<void> {
        const blob = await this.generateGrossSalaryPDFBlob(data, selectedMonth);

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const monthName = formatMonthForFilename(selectedMonth);
        link.download = `${monthName}_GROSS_SALARY.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async generateGrossSalaryPDFBlob(
        data: SalaryPDFData[],
        selectedMonth: string
    ): Promise<Blob> {
        const summary = calculateSummaries(data);
        const htmlContent = generateSalaryHTML(data, summary, selectedMonth, true);

        // Dynamically import heavy libraries only when needed
        const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
            import('html2canvas'),
            import('jspdf')
        ]);

        // Create container div - positioned off-screen but rendered
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'fixed';
        container.style.left = '-10000px';
        container.style.top = '0';
        container.style.width = '794px';
        container.style.minHeight = '1123px';
        container.style.backgroundColor = '#ffffff';

        document.body.appendChild(container);

        // Wait for fonts and images to load
        await new Promise(resolve => setTimeout(resolve, 500));
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }

        try {
            // Render HTML to canvas - full A4 page
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 794,
                height: 1123, // Full A4 height
                windowWidth: 794,
                windowHeight: 1123,
            });

            // Create PDF - PORTRAIT A4
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // A4 dimensions: 210 x 297 mm
            // Fill entire page
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

            return pdf.output('blob');
        } finally {
            document.body.removeChild(container);
        }
    }
}
