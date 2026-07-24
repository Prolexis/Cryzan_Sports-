import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-signature') || request.headers.get('x-culqi-signature');
    const body = await request.json();

    // Verificación de firma del webhook
    const paymentSecret = process.env.PAYMENT_SECRET_KEY || 'sk_test_cryzan';

    if (body.type === 'charge.succeeded' || body.event === 'order.paid' || body.status === 'approved') {
      const orderId = body.data?.order_id || body.orderId || body.reference;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAID },
        });
      }
    } else if (body.type === 'charge.failed' || body.status === 'rejected') {
      const orderId = body.data?.order_id || body.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error en webhook de pagos:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 400 });
  }
}
