import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { POST as reclamacionesPOST } from '@/app/api/reclamaciones/route';
import { processReportJob } from '@/lib/reports/worker';
import { ReportService } from '@/lib/reports/ReportService';
import { WordReportService } from '@/lib/reports/WordReportService';
import fs from 'fs';
import path from 'path';

async function isDbConnected(): Promise<boolean> {
  try {
    await prisma.category.findFirst();
    return true;
  } catch (error) {
    return false;
  }
}

describe('Pruebas de Generación de Reportes y Libro de Reclamaciones', () => {
  let dbAvailable = false;
  let testClaimId = '';
  let testReportId = '';

  beforeAll(async () => {
    dbAvailable = await isDbConnected();
    if (!dbAvailable) {
      console.warn('⚠️ Base de datos no disponible. Omitiendo pruebas de reportes en base de datos.');
      return;
    }

    // Clean up past test claims
    await prisma.claim.deleteMany({ where: { email: 'claim-test@test.com' } });
  });

  afterAll(async () => {
    if (!dbAvailable) return;

    // Clean up
    try {
      await prisma.claim.deleteMany({ where: { email: 'claim-test@test.com' } });
      if (testReportId) {
        await prisma.report.delete({ where: { id: testReportId } });
        // Delete files
        const reportPathHtml = ReportService.getReportPath(`${testReportId}.html`);
        if (fs.existsSync(reportPathHtml)) fs.unlinkSync(reportPathHtml);
      }
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  });

  it('debería registrar un reclamo con correlativo y encolar el reporte asíncronamente', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    const req = new Request('http://localhost:3000/api/reclamaciones', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Consumidor de Prueba',
        documentType: 'DNI',
        documentNumber: '99887766',
        phone: '999888777',
        email: 'claim-test@test.com',
        type: 'RECLAMO',
        description: 'El producto llegó con rasguños en la parte lateral.',
        request: 'Solicito el cambio de talla o reembolso.',
      }),
    });

    const res = await reclamacionesPOST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.claimNumber).toMatch(/^REC-2026-\d{4}$/);

    testClaimId = json.claimId;
    testReportId = json.reportId;

    // Verify claim exists in database
    const claim = await prisma.claim.findUnique({ where: { id: testClaimId } });
    expect(claim).toBeDefined();
    expect(claim!.fullName).toBe('Consumidor de Prueba');

    // Verify report exists in database and is PENDING
    const report = await prisma.report.findUnique({ where: { id: testReportId } });
    expect(report).toBeDefined();
    expect(report!.status).toBe('PENDING');
  });

  it('debería procesar asíncronamente el reporte de reclamación usando el worker', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    // Process the report job via the background worker
    await processReportJob({
      reportId: testReportId,
      claimId: testClaimId,
    });

    // Verify report status is now COMPLETED
    const updatedReport = await prisma.report.findUnique({ where: { id: testReportId } });
    expect(updatedReport!.status).toBe('COMPLETED');
    expect(updatedReport!.fileName).toBe(`${testReportId}.html`);

    // Verify physical file was created
    const filePath = ReportService.getReportPath(updatedReport!.fileName!);
    expect(fs.existsSync(filePath)).toBe(true);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    expect(fileContent).toContain('HOJA DE RECLAMACIÓN');
    expect(fileContent).toContain('Consumidor de Prueba');
  });

  it('debería generar correctamente un contrato B2B en formato Word (.docx)', async () => {
    const fileName = 'test-b2b-contract.docx';
    const filePath = ReportService.getReportPath(fileName);

    // Delete existing if any
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await WordReportService.generateB2BContractDocx('Club Trujillo', 'Juan Pérez', fileName);

    expect(fs.existsSync(filePath)).toBe(true);

    // Cleanup B2B contract file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
});
