import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enqueueJob } from '@/lib/queue';

export async function POST(request: Request) {
  try {
    const { fullName, documentType, documentNumber, phone, email, type, description, request: consumerRequest } = await request.json();

    if (!fullName || !documentType || !documentNumber || !phone || !email || !type || !description || !consumerRequest) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    if (type !== 'RECLAMO' && type !== 'QUEJA') {
      return NextResponse.json({ error: 'Tipo de reclamación inválido' }, { status: 400 });
    }

    // Generate correlative claim number REC-2026-0001
    const count = await prisma.claim.count();
    const claimNumber = `REC-2026-${String(count + 1).padStart(4, '0')}`;

    // Create the Claim record
    const claim = await prisma.claim.create({
      data: {
        claimNumber,
        fullName,
        documentType,
        documentNumber,
        phone,
        email,
        type,
        description,
        request: consumerRequest,
      },
    });

    // Create pending PDF report constancia
    const report = await prisma.report.create({
      data: {
        type: 'RECLAMO_CONSTANCIA',
        format: 'PDF',
        status: 'PENDING',
      },
    });

    // Enqueue background processing job
    await enqueueJob({
      type: 'REPORTS_GENERATION',
      payload: {
        reportId: report.id,
        claimId: claim.id,
      },
    });

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      reportId: report.id,
    });
  } catch (error: any) {
    console.error('Error submitting claim:', error);
    return NextResponse.json({ error: 'Error al enviar reclamación' }, { status: 500 });
  }
}
