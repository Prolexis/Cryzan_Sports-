import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { orderId, reason } = await request.json();

    if (!orderId || !reason) {
      return NextResponse.json({ error: 'Especifique la orden y el motivo' }, { status: 400 });
    }

    const refund = await prisma.refundRequest.create({
      data: {
        orderId,
        userId: session.user.id,
        reason,
      },
    });

    return NextResponse.json({ success: true, refundId: refund.id });
  } catch (error) {
    console.error('Error al solicitar devolución:', error);
    return NextResponse.json({ error: 'Error al registrar solicitud' }, { status: 500 });
  }
}
