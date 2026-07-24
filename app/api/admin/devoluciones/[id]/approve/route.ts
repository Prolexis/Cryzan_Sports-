import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RefundStatus, OrderStatus } from '@prisma/client';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Transacción atómica de reversión de stock
    await prisma.$transaction(async (tx) => {
      const refund = await tx.refundRequest.findUnique({
        where: { id: params.id },
        include: { order: { include: { items: true } } },
      });

      if (!refund) throw new Error('Solicitud de reembolso no encontrada');

      // 1. Revertir stock de productos
      for (const item of refund.order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // 2. Actualizar estado de reembolso y orden
      await tx.refundRequest.update({
        where: { id: params.id },
        data: { status: RefundStatus.APPROVED },
      });

      await tx.order.update({
        where: { id: refund.orderId },
        data: { status: OrderStatus.CANCELLED },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error aprobando reembolso:', error);
    return NextResponse.json({ error: error.message || 'Error al aprobar reembolso' }, { status: 500 });
  }
}
