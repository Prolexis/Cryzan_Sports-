import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RotateCcw, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDevolucionesPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/login');
  }

  const solicitudes = await prisma.refundRequest.findMany({
    include: {
      user: true,
      order: { include: { items: { include: { product: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <RotateCcw className="w-8 h-8 text-brand-red" /> Devoluciones y Reembolsos
          </h1>
          <p className="text-gray-400 text-sm mt-1">Aprobación administrativa con reversión atómica de stock en Prisma</p>
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
                <th className="p-4">Orden</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Motivo</th>
                <th className="p-4">Monto</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-400">
                    No hay solicitudes de devolución pendientes.
                  </td>
                </tr>
              ) : (
                solicitudes.map((sol) => (
                  <tr key={sol.id} className="hover:bg-gray-900/50">
                    <td className="p-4 font-bold text-white">#{sol.order.id.slice(0, 8)}</td>
                    <td className="p-4">{sol.user.name || sol.user.email}</td>
                    <td className="p-4 text-xs text-gray-300 max-w-xs">{sol.reason}</td>
                    <td className="p-4 font-black text-white">S/. {sol.order.total.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                          sol.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : sol.status === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {sol.status}
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
