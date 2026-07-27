import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReportService } from '@/lib/reports/ReportService';
import fs from 'fs';

export async function GET(request: Request, { params }: { params: { reportId: string } }) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.reportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Constancia no encontrada' }, { status: 404 });
    }

    // Security check: Only allow downloading public claims receipts from this route!
    if (report.type !== 'RECLAMO_CONSTANCIA') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (report.status !== 'COMPLETED' || !report.fileName) {
      return NextResponse.json({ error: 'La constancia se está generando. Por favor recarga en unos segundos.' }, { status: 400 });
    }

    const filePath = ReportService.getReportPath(report.fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'El archivo físico de la constancia no existe' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${report.fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading claim receipt:', error);
    return NextResponse.json({ error: 'Error al descargar constancia' }, { status: 500 });
  }
}
