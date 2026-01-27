import generatePayslipHTML from './payslip-html-template';

import type { PayslipData } from '@/features/manager/types/payslip';

export class PayslipPDFGenerator {
  constructor(_rtl?: boolean) {
    // HTML-to-PDF approach - RTL is handled in HTML template
  }

  async generatePayslipPDF(
    data: PayslipData,
    fileName?: string
  ): Promise<void> {
    const blob = await this.generatePayslipPDFBlob(data);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `payslip_${data.employee.nameAr}_${data.payPeriod}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async generatePayslipPDFBlob(
    data: PayslipData
  ): Promise<Blob> {
    const htmlContent = generatePayslipHTML(data);

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
    container.style.width = '794px'; // A4 width at 96 DPI
    container.style.minHeight = '1123px'; // A4 height at 96 DPI
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
        scale: 3,
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

  // Helper method to generate blob for preview (e.g., in modal)
  async generatePayslipPreviewBlob(
    data: PayslipData
  ): Promise<Blob> {
    // For preview, we might want a lower quality for faster generation
    const htmlContent = generatePayslipHTML(data);

    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.minHeight = '1123px';
    container.style.backgroundColor = '#ffffff';

    document.body.appendChild(container);

    await new Promise(resolve => setTimeout(resolve, 300));
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    try {
      const canvas = await html2canvas(container, {
        scale: 1.5, // Lower scale for faster preview
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9); // Lower quality for preview
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      return pdf.output('blob');
    } finally {
      document.body.removeChild(container);
    }
  }
}

// Export singleton instance for convenience
export const payslipPDFGenerator = new PayslipPDFGenerator();

// Re-export types for convenience
export type { PayslipData } from '@/features/manager/types/payslip';