import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos no válidos', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const message = await prisma.contactMessage.create({
      data: result.data,
    });

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    console.error('Error enviando contacto:', error);
    return NextResponse.json({ error: 'Error al procesar el mensaje' }, { status: 500 });
  }
}
