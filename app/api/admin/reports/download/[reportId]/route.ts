import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReportService } from '@/lib/reports/ReportService';
import fs from 'fs';

export async function GET(request: Request, { params }: { params: { reportId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const report = await prisma.report.findUnique({
      where: { id: params.reportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }

    if (report.status !== 'COMPLETED' || !report.fileName) {
      return NextResponse.json({ error: 'El reporte no está listo o falló' }, { status: 400 });
    }

    const filePath = ReportService.getReportPath(report.fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'El archivo físico del reporte no existe' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    let contentType = 'application/octet-stream';

    if (report.fileName.endsWith('.docx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (report.fileName.endsWith('.html')) {
      contentType = 'text/html; charset=utf-8';
    }

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${report.fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading report:', error);
    return NextResponse.json({ error: 'Error al descargar reporte' }, { status: 500 });
  }
}
