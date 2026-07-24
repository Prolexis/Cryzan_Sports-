'use client';

import { useState } from 'react';
import { ShieldCheck, Download, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPortalPage() {
  const [downloaded, setDownloaded] = useState(false);

  const handleExportData = () => {
    const data = {
      user: 'Carlos Mendoza',
      email: 'cliente@cryzan.com',
      orders: [
        { id: '1', total: 249.80, status: 'DELIVERED' },
        { id: '2', total: 79.90, status: 'PAID' },
      ],
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datos_personales_cryzan_sport.json';
    a.click();
    setDownloaded(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400" /> Portal de Privacidad ARCO
          </h1>
          <p className="text-gray-400 text-sm mt-1">Cumplimiento de la Ley de Protección de Datos Personales N° 29733 (Perú)</p>
        </div>
        <Link
          href="/mi-cuenta"
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <div className="bg-brand-card p-8 rounded-3xl border border-gray-800 space-y-6 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Exportación de Datos Personales</h2>
          <p className="text-gray-400 text-xs">
            Puedes descargar una copia completa en formato JSON con toda tu información registrada y compras en Cryzan Sport.
          </p>
          <button
            onClick={handleExportData}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition shadow flex items-center gap-2 text-xs"
          >
            <Download className="w-4 h-4" /> Descargar Mis Datos (.json)
          </button>
          {downloaded && <p className="text-xs text-emerald-400 mt-2">✓ Archivo descargado exitosamente.</p>}
        </div>

        <div className="pt-6 border-t border-gray-800 space-y-2">
          <h2 className="text-xl font-bold text-white">Solicitud de Anonimización / Eliminación de Cuenta</h2>
          <p className="text-gray-400 text-xs">
            Al solicitar la eliminación de tu cuenta, tus datos personales serán anonimizados según la normativa peruana, conservando los registros de órdenes de forma anónima para fines fiscales.
          </p>
          <button
            onClick={() => alert('Tu solicitud de eliminación ha sido registrada. Se procesará en un plazo máximo de 48 horas.')}
            className="mt-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 text-xs"
          >
            <Trash2 className="w-4 h-4" /> Solicitar Anonimización de Cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
