import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminOrdenesPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/login');
  }

  const ordenes = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-yellow-400" /> Gestión de Órdenes
          </h1>
          <p className="text-gray-400 text-sm mt-1">Monitoreo y cambio de estado de pedidos en Cryzan Sport</p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Admin
        </Link>
      </div>

      <div className="bg-brand-card rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
              <tr>
                <th className="p-4">Orden ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Artículos</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {ordenes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400">
                    No hay órdenes registradas.
                  </td>
                </tr>
              ) : (
                ordenes.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-900/50">
                    <td className="p-4 font-mono text-xs text-brand-red font-bold">{ord.id.slice(0, 8)}...</td>
                    <td className="p-4 font-semibold text-white">{ord.user?.name || ord.user?.email || 'Invitado'}</td>
                    <td className="p-4 text-xs text-gray-400">
                      {new Date(ord.createdAt).toLocaleDateString('es-PE')}
                    </td>
                    <td className="p-4 text-xs">
                      {ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="p-4 font-black text-white">S/. {ord.total.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : ord.status === 'PAID'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : ord.status === 'SHIPPED'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : ord.status === 'CANCELLED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
