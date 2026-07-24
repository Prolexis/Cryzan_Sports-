import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShoppingBag, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function MisPedidosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const ordenes = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-brand-red" /> Mis Pedidos
          </h1>
          <p className="text-gray-400 text-sm mt-1">Historial de compras realizadas en Cryzan Sport</p>
        </div>
        <Link
          href="/mi-cuenta"
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Mi Cuenta
        </Link>
      </div>

      <div className="space-y-4">
        {ordenes.length === 0 ? (
          <div className="text-center py-16 bg-brand-card rounded-2xl border border-gray-800 space-y-4">
            <p className="text-gray-400 text-lg">Aún no has realizado compras en Cryzan Sport.</p>
            <Link
              href="/productos"
              className="inline-block bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold px-6 py-3 rounded-xl shadow"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          ordenes.map((ord) => (
            <div key={ord.id} className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-800 text-xs text-gray-400 gap-2">
                <div>
                  <span className="text-white font-bold">Orden #{ord.id.slice(0, 8)}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(ord.createdAt).toLocaleDateString('es-PE')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-extrabold px-3 py-1 rounded-full uppercase ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : ord.status === 'PAID'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    }`}
                  >
                    {ord.status}
                  </span>
                  <Link
                    href={`/api/pedidos/${ord.id}/pdf`}
                    target="_blank"
                    className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white px-2.5 py-1 rounded border border-gray-700 font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5" /> Boleta PDF
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                {ord.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">
                      {item.product.name} <strong className="text-white">x{item.quantity}</strong>
                    </span>
                    <span className="text-white font-bold">S/. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-base">
                <span className="text-gray-400 text-xs">Total Pagado:</span>
                <span className="text-brand-red font-black text-xl">S/. {ord.total.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
