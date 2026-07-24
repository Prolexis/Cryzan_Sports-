import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Ingrese un código de cupón' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'El cupón no existe' }, { status: 404 });
    }

    if (new Date() > new Date(coupon.expirationDate)) {
      return NextResponse.json({ error: 'El cupón ha expirado' }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'El cupón ha alcanzado el límite de usos' }, { status: 400 });
    }

    return NextResponse.json({
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
    });
  } catch (error) {
    console.error('Error al validar cupón:', error);
    return NextResponse.json({ error: 'Error al validar el cupón' }, { status: 500 });
  }
}
