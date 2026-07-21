import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { items, total, paymentDetails } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    // Crear la orden en PostgreSQL
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id || null,
        total: total,
        status: 'PAID',
        paymentMethod: 'Culqi / MercadoPago Sandbox',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Error al procesar checkout:', error);
    return NextResponse.json({ error: 'Error interno al procesar el pago' }, { status: 500 });
  }
}
