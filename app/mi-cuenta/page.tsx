import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, User, MapPin, Heart, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function MiCuentaPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-brand-card p-8 rounded-3xl border border-gray-800 shadow-xl space-y-2">
        <h1 className="text-3xl font-black text-white">Mi Cuenta Cryzan Sport</h1>
        <p className="text-gray-400 text-sm">
          Bienvenido, <strong className="text-white">{session.user.name || session.user.email}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/mi-cuenta/pedidos"
          className="bg-brand-card p-6 rounded-2xl border border-gray-800 hover:border-brand-red transition shadow-lg space-y-4 group"
        >
          <div className="p-3 bg-brand-red/10 text-brand-red w-fit rounded-xl">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white group-hover:text-brand-red transition flex items-center justify-between">
              Mis Pedidos <ArrowRight className="w-5 h-5" />
            </h2>
            <p className="text-gray-400 text-xs">Historial de compras, estado del envío y boletas de venta en PDF.</p>
          </div>
        </Link>

        <Link
          href="/mi-cuenta/perfil"
          className="bg-brand-card p-6 rounded-2xl border border-gray-800 hover:border-brand-red transition shadow-lg space-y-4 group"
        >
          <div className="p-3 bg-brand-red/10 text-brand-red w-fit rounded-xl">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white group-hover:text-brand-red transition flex items-center justify-between">
              Mi Perfil <ArrowRight className="w-5 h-5" />
            </h2>
            <p className="text-gray-400 text-xs">Edita tus datos personales, teléfono y contraseña de acceso.</p>
          </div>
        </Link>

        <Link
          href="/mi-cuenta/direcciones"
          className="bg-brand-card p-6 rounded-2xl border border-gray-800 hover:border-brand-red transition shadow-lg space-y-4 group"
        >
          <div className="p-3 bg-brand-red/10 text-brand-red w-fit rounded-xl">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white group-hover:text-brand-red transition flex items-center justify-between">
              Mis Direcciones <ArrowRight className="w-5 h-5" />
            </h2>
            <p className="text-gray-400 text-xs">Administra tus direcciones guardadas para envíos rápidos en Perú.</p>
          </div>
        </Link>

        <Link
          href="/mi-cuenta/favoritos"
          className="bg-brand-card p-6 rounded-2xl border border-gray-800 hover:border-brand-red transition shadow-lg space-y-4 group"
        >
          <div className="p-3 bg-brand-red/10 text-brand-red w-fit rounded-xl">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white group-hover:text-brand-red transition flex items-center justify-between">
              Lista de Deseos <ArrowRight className="w-5 h-5" />
            </h2>
            <p className="text-gray-400 text-xs">Tus productos favoritos guardados para comprar más tarde.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
