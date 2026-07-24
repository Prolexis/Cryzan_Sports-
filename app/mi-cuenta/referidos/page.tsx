import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Users, Copy, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function ReferidosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const referralCode = user?.referralCode || `CRYZAN-${session.user.id.slice(0, 5).toUpperCase()}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-brand-red" /> Sistema de Referidos
          </h1>
          <p className="text-gray-400 text-sm mt-1">Invita amigos y ambos recibirán S/. 15 de descuento</p>
        </div>
        <Link
          href="/mi-cuenta"
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <div className="bg-brand-card p-8 rounded-3xl border border-gray-800 space-y-6 text-center shadow-xl">
        <div className="w-16 h-16 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto border border-brand-red/30">
          <Share2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Tu Código Único de Invitación</h2>
          <p className="text-gray-400 text-xs mt-1">Comparte este código con tus amigos apasionados por el deporte.</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 inline-flex items-center gap-4">
          <span className="text-2xl font-black text-brand-red tracking-widest">{referralCode}</span>
        </div>
      </div>
    </div>
  );
}
