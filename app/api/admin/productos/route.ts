import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Datos no válidos', details: result.error.flatten() }, { status: 400 });
    }

    const { name, description, price, categoryName, image, stock } = result.data;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    // Buscar o crear categoría
    let category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName, slug: categoryName.toLowerCase() },
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        image,
        images: [image],
        stock,
        categoryId: category.id,
        variants: {
          create: [
            { size: 'M', stock: Math.floor(stock / 2) },
            { size: 'L', stock: Math.ceil(stock / 2) },
          ],
        },
      },
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 });
  }
}
