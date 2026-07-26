import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail, generateOrderEmailTemplate } from '@/lib/email';
import { OrderStatus } from '@prisma/client';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting por IP/Petición
    const ip = request.headers.get('x-forwarded-for') || 'anon';
    const limitCheck = await rateLimit(`checkout-${ip}`, 5, 60000);
    if (!limitCheck.success) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intente nuevamente en un minuto.' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    const { total, shippingCost, documentType, documentNumber, couponCode } = await request.json();

    let userId = session?.user?.id || null;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) userId = null;
    }

    // Fetch active cart from DB
    const activeCart = await prisma.cart.findFirst({
      where: userId
        ? { userId, status: 'ACTIVE' }
        : { sessionId, status: 'ACTIVE' },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true }
            }
          }
        }
      }
    });

    if (!activeCart || activeCart.items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    // 2. Transacción Atómica prisma.$transaction
    const resultOrder = await prisma.$transaction(async (tx) => {
      // a. Verificar stock disponible para cada producto usando SELECT FOR UPDATE
      for (const item of activeCart.items) {
        const variants: any[] = await tx.$queryRaw`
          SELECT * FROM "ProductVariant"
          WHERE id = ${item.productVariantId}
          FOR UPDATE
        `;
        const variant = variants[0];

        if (!variant) {
          throw new Error(`Variante no encontrada para el artículo`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto: ${item.productVariant.product.name}`);
        }
      }

      // b. Crear la orden
      const order = await tx.order.create({
        data: {
          userId: userId,
          total: total,
          shippingCost: shippingCost || 0.0,
          documentType: documentType || 'DNI',
          documentNumber: documentNumber || '47586932',
          couponCode: couponCode || null,
          status: OrderStatus.PAID,
          paymentMethod: 'Culqi / MercadoPago Sandbox',
          items: {
            create: activeCart.items.map((item: any) => ({
              productId: item.productVariant.productId,
              variantId: item.productVariantId,
              quantity: item.quantity,
              price: item.priceSnapshot,
            })),
          },
        },
      });

      // c. Descontar stock atómicamente de las variantes
      for (const item of activeCart.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // d. Limpiar carrito
      await tx.cartItem.deleteMany({
        where: { cartId: activeCart.id }
      });
      await tx.cart.delete({
        where: { id: activeCart.id }
      });

      return order;
    });

    // 3. Enviar correo transaccional de confirmación
    const userEmail = session?.user?.email || 'cliente@cryzan.com';
    try {
      await sendEmail({
        to: userEmail,
        subject: `Confirmación de Compra #${resultOrder.id.slice(0, 8)} - Cryzan Sport`,
        html: generateOrderEmailTemplate(resultOrder.id, resultOrder.total),
      });
    } catch (e) {
      console.error('Failed to send transactional email:', e);
    }

    return NextResponse.json({ success: true, orderId: resultOrder.id });
  } catch (error: any) {
    console.error('Error atómico en checkout:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar el pago' }, { status: 400 });
  }
}
