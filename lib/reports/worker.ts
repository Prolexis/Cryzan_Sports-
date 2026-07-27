import { prisma } from '../prisma';
import { ReportService } from './ReportService';
import { WordReportService } from './WordReportService';
import fs from 'fs';

export async function processReportJob(payload: {
  reportId: string;
  monthStr?: string;
  claimId?: string;
  clubName?: string;
  representativeName?: string;
}) {
  const { reportId, monthStr, claimId, clubName, representativeName } = payload;

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      console.error(`[Worker Error] Report record ${reportId} not found in DB`);
      return;
    }

    const format = report.format;
    const type = report.type;

    if (format === 'PDF') {
      const fileName = `${reportId}.html`; // Served directly as HTML/PDF printable
      let htmlContent = '';

      if (type === 'VENTAS_MENSUAL') {
        htmlContent = await ReportService.generateMonthlySalesReportHtml(monthStr || '');
      } else if (type === 'INVENTARIO_DEVOLUCIONES') {
        htmlContent = await ReportService.generateInventoryRefundReportHtml();
      } else if (type === 'RECLAMO_CONSTANCIA') {
        htmlContent = await ReportService.generateClaimReceiptHtml(claimId || '');
      } else {
        throw new Error(`Unsupported PDF report type: ${type}`);
      }

      const filePath = ReportService.getReportPath(fileName);
      fs.writeFileSync(filePath, htmlContent, 'utf-8');

      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'COMPLETED',
          fileName,
        },
      });
      console.log(`[Worker Success] Report PDF ${reportId} generated successfully at ${filePath}`);
    } else if (format === 'DOCX') {
      const fileName = `${reportId}.docx`;

      if (type === 'VENTAS_MENSUAL') {
        await WordReportService.generateMonthlySalesReportDocx(monthStr || '', fileName);
      } else if (type === 'B2B_CONTRATO') {
        await WordReportService.generateB2BContractDocx(clubName || '', representativeName || '', fileName);
      } else {
        throw new Error(`Unsupported DOCX report type: ${type}`);
      }

      const filePath = ReportService.getReportPath(fileName);
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'COMPLETED',
          fileName,
        },
      });
      console.log(`[Worker Success] Report DOCX ${reportId} generated successfully at ${filePath}`);
    } else {
      throw new Error(`Unsupported report format: ${format}`);
    }
  } catch (error: any) {
    console.error(`[Worker Exception] Failed generating report ${reportId}:`, error);
    try {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'FAILED' },
      });
    } catch (e) {
      console.error('Failed updating status to FAILED in DB:', e);
    }
  }
}
