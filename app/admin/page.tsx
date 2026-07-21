import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShieldCheck, Plus, Package } from 'lucide-react';
import Image from 'next/image';

export const revalidate = 0;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/login');
  }

  const productos = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const ordenes = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-yellow-400" /> Panel de Administración
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gestión de productos y monitoreo de órdenes de Cryzan Sport</p>
        </div>
        <span className="bg-yellow-400/10 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-yellow-400/30">
          Rol: ADMIN
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Productos</p>
          <p className="text-3xl font-black text-white">{productos.length}</p>
        </div>
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Órdenes Procesadas</p>
          <p className="text-3xl font-black text-emerald-400">{ordenes.length}</p>
        </div>
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Base de Datos</p>
          <p className="text-lg font-bold text-brand-red">cryzan_sport_db</p>
        </div>
      </div>

      {/* LISTA CRUD DE PRODUCTOS */}
      <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-800">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-red" /> Inventario de Productos
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
              <tr>
                <th className="p-3">Imagen</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {productos.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-900/50">
                  <td className="p-3">
                    <div className="relative w-12 h-12 bg-gray-900 rounded-lg overflow-hidden">
                      <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-white">{prod.name}</td>
                  <td className="p-3">
                    <span className="bg-brand-red/10 text-brand-red text-xs px-2 py-1 rounded font-bold">
                      {prod.category.name}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">S/. {prod.price.toFixed(2)}</td>
                  <td className="p-3 text-emerald-400 font-semibold">{prod.stock} unidades</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
