import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Award, ArrowLeft, Gift } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function PuntosFidelidadPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const pointsRecord = await prisma.loyaltyPoint.findUnique({
    where: { userId: session.user.id },
  });

  const points = pointsRecord?.points || 25;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Award className="w-8 h-8 text-yellow-400" /> Programa de Fidelidad Cryzan
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gana 1 punto por cada S/. 10 gastado en la tienda</p>
        </div>
        <Link
          href="/mi-cuenta"
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <div className="bg-brand-card p-8 rounded-3xl border border-gray-800 space-y-6 text-center shadow-xl">
        <div className="w-24 h-24 bg-yellow-400/10 border-2 border-yellow-400/30 rounded-full flex items-center justify-center mx-auto text-yellow-400 font-black text-3xl">
          {points}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">Tus Puntos Acumulados</h2>
          <p className="text-gray-400 text-xs mt-1">
            Tienes <strong className="text-yellow-400">{points} puntos</strong>. Equivale a S/. {(points * 0.5).toFixed(2)} de descuento.
          </p>
        </div>

        <button className="bg-brand-red hover:bg-brand-redHover text-white font-bold px-8 py-3 rounded-xl transition shadow-lg inline-flex items-center gap-2 text-sm">
          <Gift className="w-4 h-4" /> Canjear por Cupón de Descuento
        </button>
      </div>
    </div>
  );
}
