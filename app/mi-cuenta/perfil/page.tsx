'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { User, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PerfilPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [phone, setPhone] = useState('+51 987 654 321');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <User className="w-8 h-8 text-brand-red" /> Mi Perfil
          </h1>
          <p className="text-gray-400 text-sm mt-1">Edita tus datos personales en Cryzan Sport</p>
        </div>
        <Link
          href="/mi-cuenta"
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <form onSubmit={handleSave} className="bg-brand-card p-8 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
        {saved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Datos de perfil guardados correctamente.
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-700 px-4 py-3 rounded-xl text-white text-sm focus:border-brand-red outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Correo Electrónico (No editable)</label>
          <input
            type="email"
            value={session?.user?.email || ''}
            disabled
            className="w-full bg-gray-950 border border-gray-800 px-4 py-3 rounded-xl text-gray-500 text-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Teléfono / WhatsApp</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 px-4 py-3 rounded-xl text-white text-sm focus:border-brand-red outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-brand-red hover:bg-brand-redHover text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Guardar Cambios
        </button>
      </form>
    </div>
  );
}
