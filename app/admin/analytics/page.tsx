import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BarChart3, ArrowLeft, TrendingUp, Users, ShoppingBag, CreditCard } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/login');
  }

  const totalUsuarios = await prisma.user.count();
  const totalOrdenes = await prisma.order.count();
  const ordenesCompletadas = await prisma.order.count({ where: { status: 'DELIVERED' } });

  // Simulación de métricas de embudo de conversión
  const impresiones = 1250;
  const vistasProducto = 820;
  const carritosAgregados = 340;
  const checkoutsIniciados = totalOrdenes + 15;
  const comprasCompletadas = totalOrdenes;

  const tasaConversionGlobal = ((comprasCompletadas / impresiones) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-brand-red" /> Embudo de Conversión & Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">Métricas de conversión desde la visita hasta la compra en Cryzan Sport</p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Admin
        </Link>
      </div>

      <div className="bg-brand-card p-8 rounded-3xl border border-gray-800 space-y-6 shadow-xl">
        <div className="flex justify-between items-center pb-4 border-b border-gray-800">
          <h2 className="text-xl font-extrabold text-white">Embudo de Ventas (Funnel)</h2>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
            Tasa Global: {tasaConversionGlobal}%
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-300">1. Visitas / Impresiones Totales</span>
              <span className="text-white font-bold">{impresiones}</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-300">2. Vistas de Producto</span>
              <span className="text-white font-bold">{vistasProducto} ({((vistasProducto / impresiones) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-300">3. Añadidos al Carrito</span>
              <span className="text-white font-bold">{carritosAgregados} ({((carritosAgregados / vistasProducto) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: '41%' }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-300">4. Checkouts Iniciados</span>
              <span className="text-white font-bold">{checkoutsIniciados} ({((checkoutsIniciados / carritosAgregados) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden">
              <div className="bg-yellow-500 h-full rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-brand-red font-bold">5. Compras Completadas</span>
              <span className="text-brand-red font-black">{comprasCompletadas} ({((comprasCompletadas / checkoutsIniciados) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden">
              <div className="bg-brand-red h-full rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
