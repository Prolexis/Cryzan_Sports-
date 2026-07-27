import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enqueueJob } from '@/lib/queue';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error('Error fetching admin reports:', error);
    return NextResponse.json({ error: 'Error al listar reportes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, format, monthStr, clubName, representativeName } = body;

    if (!type || !format) {
      return NextResponse.json({ error: 'Tipo y formato son obligatorios' }, { status: 400 });
    }

    // Validate type and format
    const validTypes = ['VENTAS_MENSUAL', 'INVENTARIO_DEVOLUCIONES', 'RECLAMO_CONSTANCIA', 'B2B_CONTRATO'];
    const validFormats = ['PDF', 'DOCX'];

    if (!validTypes.includes(type) || !validFormats.includes(format)) {
      return NextResponse.json({ error: 'Tipo o formato de reporte no soportado' }, { status: 400 });
    }

    if (type === 'VENTAS_MENSUAL' && !monthStr) {
      return NextResponse.json({ error: 'Para el reporte mensual de ventas debe proveer el mes' }, { status: 400 });
    }

    if (type === 'B2B_CONTRATO' && (!clubName || !representativeName)) {
      return NextResponse.json({ error: 'Para el contrato B2B debe proveer el club y representante' }, { status: 400 });
    }

    // Create Report model entry
    const report = await prisma.report.create({
      data: {
        type,
        format,
        status: 'PENDING',
      },
    });

    // Enqueue background worker processing
    await enqueueJob({
      type: 'REPORTS_GENERATION',
      payload: {
        reportId: report.id,
        monthStr,
        clubName,
        representativeName,
      },
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error initiating admin report generation:', error);
    return NextResponse.json({ error: 'Error al iniciar reporte' }, { status: 500 });
  }
}
