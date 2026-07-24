import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail, generateOrderEmailTemplate } from '@/lib/email';
import { OrderStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting por IP/Petición
    const ip = request.headers.get('x-forwarded-for') || 'anon';
    const limitCheck = await rateLimit(`checkout-${ip}`, 5, 60000);
    if (!limitCheck.success) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intente nuevamente en un minuto.' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    const { items, total, shippingCost, documentType, documentNumber, couponCode } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    // 2. Transacción Atómica prisma.$transaction
    const resultOrder = await prisma.$transaction(async (tx) => {
      // a. Verificar stock disponible para cada producto
      for (const item of items) {
        const prod = await tx.product.findUnique({ where: { id: item.id } });
        if (!prod || prod.stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto: ${item.name}`);
        }
      }

      // b. Crear la orden
      const order = await tx.order.create({
        data: {
          userId: session?.user?.id || null,
          total: total,
          shippingCost: shippingCost || 0.0,
          documentType: documentType || 'DNI',
          documentNumber: documentNumber || '47586932',
          couponCode: couponCode || null,
          status: OrderStatus.PAID,
          paymentMethod: 'Culqi / MercadoPago Sandbox',
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // c. Descontar stock atómicamente
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });

    // 3. Enviar correo transaccional de confirmación
    const userEmail = session?.user?.email || 'cliente@cryzan.com';
    await sendEmail({
      to: userEmail,
      subject: `Confirmación de Compra #${resultOrder.id.slice(0, 8)} - Cryzan Sport`,
      html: generateOrderEmailTemplate(resultOrder.id, resultOrder.total),
    });

    return NextResponse.json({ success: true, orderId: resultOrder.id });
  } catch (error: any) {
    console.error('Error atómico en checkout:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar el pago' }, { status: 400 });
  }
}
