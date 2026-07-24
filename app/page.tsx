import Link from 'next/link';
import { Truck, Award, Headset, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let productosDestacados: any[] = [];
  try {
    productosDestacados = await prisma.product.findMany({
      take: 4,
      include: { category: true },
    });
  } catch (error) {
    console.warn('Servidor DB no accesible durante el build estático de HomePage.');
  }

  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-900 via-zinc-900 to-red-950 border border-gray-800 p-8 sm:p-16 shadow-2xl">
        <div className="max-w-2xl space-y-6">
          <span className="inline-block bg-brand-red/20 border border-brand-red/40 text-brand-red text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
            Edición Limitada 2026
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Vive el Deporte con <span className="text-brand-red">Cryzan Sport</span>
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl font-normal leading-relaxed">
            Encuentra polos técnicos, zapatillas running, balones profesionales y casacas rompevientos. Calidad, comodidad y rendimiento para atletas exigentes.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-redHover text-white font-bold px-8 py-4 rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
            >
              Ver productos <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 flex items-start gap-4 shadow-lg">
          <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Envío Rápido</h3>
            <p className="text-gray-400 text-sm mt-1">Entregas garantizadas y seguras a todo Trujillo y el Perú.</p>
          </div>
        </div>

        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 flex items-start gap-4 shadow-lg">
          <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Alta Calidad</h3>
            <p className="text-gray-400 text-sm mt-1">Productos 100% originales con garantía oficial de marca.</p>
          </div>
        </div>

        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 flex items-start gap-4 shadow-lg">
          <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red">
            <Headset className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Soporte 24/7</h3>
            <p className="text-gray-400 text-sm mt-1">Atención al cliente personalizada y asesoría deportiva.</p>
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Productos Destacados</h2>
            <p className="text-gray-400 text-sm mt-1">Los artículos más vendidos de Cryzan Sport</p>
          </div>
          <Link href="/productos" className="text-brand-red hover:underline text-sm font-bold flex items-center gap-1">
            Ver catálogo completo &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productosDestacados.map((prod) => (
            <ProductCard
              key={prod.id}
              id={prod.id}
              name={prod.name}
              price={prod.price}
              image={prod.image}
              categoryName={prod.category.name}
              stock={prod.stock}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
