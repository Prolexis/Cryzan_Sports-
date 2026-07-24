import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DollarSign, ShoppingBag, Clock, TrendingUp, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/login');
  }

  // 1. Agregación de ventas totales en Soles (excluyendo canceladas)
  const totalVentasResult = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { not: 'CANCELLED' } },
  });
  const totalVentas = totalVentasResult._sum.total || 0;

  // 2. Órdenes por estado
  const ordenesPendientes = await prisma.order.count({ where: { status: 'PENDING' } });
  const ordenesPagadas = await prisma.order.count({ where: { status: 'PAID' } });
  const totalOrdenes = await prisma.order.count();

  // 3. Productos más vendidos (Top 3)
  const topProductosGroup = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 3,
  });

  const topProductIds = topProductosGroup.map((item) => item.productId);
  const topProductosDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    include: { category: true },
  });

  return (
    <div className="space-y-8">
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-brand-red" /> Dashboard de Métricas
          </h1>
          <p className="text-gray-400 text-sm mt-1">Métricas reales agregadas desde la base de datos Cryzan Sport</p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Admin
        </Link>
      </div>

      {/* TARJETAS DE METRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Ventas Totales</span>
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-white">S/. {totalVentas.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Monto total generado en la tienda</p>
        </div>

        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-yellow-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Órdenes Pendientes</span>
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-white">{ordenesPendientes}</p>
          <p className="text-xs text-gray-500">Pedidos por despachar o confirmar</p>
        </div>

        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Órdenes Pagadas</span>
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-white">{ordenesPagadas}</p>
          <p className="text-xs text-gray-500">Pagos completados correctamente</p>
        </div>

        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-brand-red">
            <span className="text-xs uppercase font-extrabold tracking-wider">Total Pedidos</span>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-white">{totalOrdenes}</p>
          <p className="text-xs text-gray-500">Histórico de compras registradas</p>
        </div>
      </div>

      {/* TOP PRODUCTOS MAS VENDIDOS */}
      <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
        <h2 className="text-xl font-extrabold text-white pb-3 border-b border-gray-800">
          🔥 Productos Más Vendidos
        </h2>

        {topProductosDetails.length === 0 ? (
          <p className="text-gray-400 text-sm">Aún no hay ventas registradas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {topProductosDetails.map((prod) => (
              <div key={prod.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-2">
                <span className="text-xs font-bold text-brand-red uppercase">{prod.category.name}</span>
                <h3 className="text-white font-bold text-base line-clamp-1">{prod.name}</h3>
                <p className="text-gray-400 text-xs font-mono">S/. {prod.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
