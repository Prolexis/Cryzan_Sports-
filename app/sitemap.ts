import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  let productUrls: any[] = [];

  try {
    const productos = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
    });

    productUrls = productos.map((p) => ({
      url: `${baseUrl}/productos/${p.slug}`,
      lastModified: p.updatedAt,
    }));
  } catch (error) {
    console.warn('Servidor DB no accesible durante prerenderizado estático de sitemap.');
  }

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/productos`, lastModified: new Date() },
    { url: `${baseUrl}/contacto`, lastModified: new Date() },
    ...productUrls,
  ];
}
