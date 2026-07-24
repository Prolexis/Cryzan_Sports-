import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Truck, CheckCircle2, Clock, PackageCheck, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function DetallePedidoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) {
    notFound();
  }

  const isPaid = ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status);
  const isShipped = ['SHIPPED', 'DELIVERED'].includes(order.status);
  const isDelivered = order.status === 'DELIVERED';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Truck className="w-8 h-8 text-brand-red" /> Pedido #{order.id.slice(0, 8)}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Seguimiento en tiempo real y detalles de entrega</p>
        </div>
        <Link
          href="/mi-cuenta/pedidos"
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Pedidos
        </Link>
      </div>

      {/* LÍNEA DE TIEMPO DE ESTADO */}
      <div className="bg-brand-card p-8 rounded-3xl border border-gray-800 space-y-6 shadow-xl">
        <h2 className="text-lg font-bold text-white">Línea de Tiempo del Envío</h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          <div className={`p-4 rounded-2xl border text-center space-y-2 ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
            <Clock className="w-6 h-6 mx-auto" />
            <span className="block font-bold text-xs">1. Confirmado</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-2 ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
            <PackageCheck className="w-6 h-6 mx-auto" />
            <span className="block font-bold text-xs">2. Preparando</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-2 ${isShipped ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
            <Truck className="w-6 h-6 mx-auto" />
            <span className="block font-bold text-xs">3. En Camino</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-2 ${isDelivered ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
            <CheckCircle2 className="w-6 h-6 mx-auto" />
            <span className="block font-bold text-xs">4. Entregado</span>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
            <div>
              <span className="text-gray-400">Agencia de Envío:</span>
              <strong className="text-white ml-2">{order.carrier || 'Olva Courier'}</strong>
            </div>
            <div>
              <span className="text-gray-400">Número de Guía:</span>
              <strong className="text-brand-red font-mono ml-2">{order.trackingNumber}</strong>
            </div>
          </div>
        )}
      </div>

      {/* DETALLES DE ARTÍCULOS */}
      <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
        <h3 className="text-base font-extrabold text-white">Artículos en la Orden</h3>
        <div className="divide-y divide-gray-800">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-center text-sm">
              <span className="text-gray-300">
                {item.product.name} <strong className="text-white">x{item.quantity}</strong>
              </span>
              <span className="text-white font-bold">S/. {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
