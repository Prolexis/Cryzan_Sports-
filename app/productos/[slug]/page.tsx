import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailClient } from './ProductDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!product) {
      return { title: 'Producto no encontrado | Cryzan Sport' };
    }

    return {
      title: `${product.name} | Cryzan Sport Perú`,
      description: product.description,
      openGraph: {
        title: `${product.name} - Cryzan Sport`,
        description: product.description,
        images: [product.image],
      },
    };
  } catch (e) {
    return { title: 'Cryzan Sport | Tienda Deportiva' };
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product: any = null;
  let productosRelacionados: any[] = [];

  try {
    product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        variants: true,
        reviews: { include: { user: true } },
      },
    });

    if (product) {
      productosRelacionados = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
        },
        take: 4,
        include: { category: true },
      });
    }
  } catch (error) {
    console.warn('Servidor DB no accesible durante build de detalle de producto.');
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-12">
      {/* BREADCRUMBS */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/" className="hover:text-white">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-white">Productos</Link>
        <span>/</span>
        <span className="text-brand-red font-semibold">{product.name}</span>
      </div>

      {/* DETALLE PRINCIPAL */}
      <ProductDetailClient product={product} />

      {/* PRODUCTOS RELACIONADOS */}
      {productosRelacionados.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-gray-800">
          <h2 className="text-2xl font-black text-white">Productos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosRelacionados.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image={p.image}
                categoryName={p.category.name}
                stock={p.stock}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
