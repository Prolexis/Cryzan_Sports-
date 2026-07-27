'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Download, RefreshCw, BarChart2, Plus, Calendar, ShieldCheck, AlertCircle, Loader } from 'lucide-react';

interface Report {
  id: string;
  type: string;
  format: string;
  status: string;
  fileName: string | null;
  createdAt: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [salesMonth, setSalesMonth] = useState('2026-07');
  const [salesFormat, setSalesFormat] = useState('PDF');

  const [clubName, setClubName] = useState('');
  const [representativeName, setRepresentativeName] = useState('');

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      if (!res.ok) {
        throw new Error('No autorizado o error al cargar reportes');
      }
      const data = await res.json();
      setReports(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Poll every 5 seconds to update PENDING reports dynamically
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async (payload: any) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al solicitar reporte');
      }
      fetchReports();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getReportNameLabel = (type: string) => {
    switch (type) {
      case 'VENTAS_MENSUAL':
        return 'Ventas Mensuales';
      case 'INVENTARIO_DEVOLUCIONES':
        return 'Inventario y Devoluciones';
      case 'RECLAMO_CONSTANCIA':
        return 'Constancia de Reclamación';
      case 'B2B_CONTRATO':
        return 'Contrato Suministro B2B';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand-red text-xs font-black uppercase tracking-widest bg-brand-red/10 border border-brand-red/30 px-3 py-1 rounded-full w-max">
              <ShieldCheck className="w-3.5 h-3.5" /> Módulo Admin
            </div>
            <h1 className="text-3xl font-black text-white">Panel de Reportes y Documentos</h1>
            <p className="text-brand-muted text-sm">Generación asíncrona de reportes contables, inventario y B2B.</p>
          </div>
          <button
            onClick={fetchReports}
            className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-700 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Actualizar Lista
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CONTROLES DE GENERACIÓN */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* VENTAS */}
            <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
                <BarChart2 className="w-4 h-4 text-brand-red" /> Ventas Mensuales
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Seleccionar Mes</label>
                  <input
                    type="month"
                    value={salesMonth}
                    onChange={(e) => setSalesMonth(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-red transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Formato de Exportación</label>
                  <select
                    value={salesFormat}
                    onChange={(e) => setSalesFormat(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-red transition"
                  >
                    <option value="PDF">PDF (Elegante imprimible)</option>
                    <option value="DOCX">Word (Editable / DOCX)</option>
                  </select>
                </div>
                <button
                  onClick={() => handleGenerateReport({ type: 'VENTAS_MENSUAL', format: salesFormat, monthStr: salesMonth })}
                  disabled={actionLoading}
                  className="w-full bg-brand-red hover:bg-brand-redHover disabled:bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Solicitar Reporte
                </button>
              </div>
            </div>

            {/* INVENTARIO */}
            <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
                <Calendar className="w-4 h-4 text-brand-red" /> Inventario & Devoluciones
              </h3>
              <p className="text-[11px] text-brand-muted">
                Genera el resumen de existencias críticas (menos de 5 unidades) y el consolidado de solicitudes de devolución.
              </p>
              <button
                onClick={() => handleGenerateReport({ type: 'INVENTARIO_DEVOLUCIONES', format: 'PDF' })}
                disabled={actionLoading}
                className="w-full bg-brand-red hover:bg-brand-redHover disabled:bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Generar PDF Inventario
              </button>
            </div>

            {/* CONTRATOS B2B */}
            <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
                <FileText className="w-4 h-4 text-brand-red" /> Contrato B2B (Word)
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Nombre del Club</label>
                  <input
                    type="text"
                    placeholder="Ej: Trujillo FC"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-red placeholder-gray-600 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Representante Legal</label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos Mendoza"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-red placeholder-gray-600 transition"
                  />
                </div>
                <button
                  onClick={() => handleGenerateReport({ type: 'B2B_CONTRATO', format: 'DOCX', clubName, representativeName })}
                  disabled={actionLoading || !clubName || !representativeName}
                  className="w-full bg-brand-red hover:bg-brand-redHover disabled:bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Generar Contrato DOCX
                </button>
              </div>
            </div>

          </div>

          {/* HISTORIAL DE REPORTES GENERADOS */}
          <div className="lg:col-span-2 bg-brand-card rounded-3xl border border-gray-800 p-6 space-y-4 shadow-xl">
            <h2 className="text-white font-bold text-base tracking-tight pb-2 border-b border-gray-800">Cola de Reportes Activos</h2>

            {loading ? (
              <div className="flex items-center justify-center py-20 gap-2 text-brand-muted text-xs">
                <Loader className="w-4 h-4 animate-spin text-brand-red" /> Cargando reportes...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-20 text-brand-muted text-xs border border-dashed border-gray-800 rounded-2xl">
                No has solicitado reportes todavía. Solicita uno en el menú lateral.
              </div>
            ) : (
              <div className="space-y-3.5">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-gray-900/60 border border-gray-800 hover:border-gray-700 p-4 rounded-xl flex justify-between items-center transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-xs">
                          {getReportNameLabel(report.type)}
                        </span>
                        <span className="text-[9px] bg-brand-red/10 border border-brand-red/20 text-brand-red font-bold px-2 py-0.5 rounded uppercase">
                          {report.format}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        ID: <code className="text-gray-400">{report.id.slice(0, 8)}</code> | Solicitado: {new Date(report.createdAt).toLocaleString('es-PE')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* STATUS BADGE */}
                      {report.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
                          <Loader className="w-3 h-3 animate-spin" /> En Cola
                        </span>
                      ) : report.status === 'FAILED' ? (
                        <span className="text-[10px] text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full font-bold">
                          Fallido
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                          Listo
                        </span>
                      )}

                      {/* DOWNLOAD BUTTON */}
                      {report.status === 'COMPLETED' && (
                        <a
                          href={`/api/admin/reports/download/${report.id}`}
                          download
                          className="bg-brand-red hover:bg-brand-redHover text-white text-[10px] font-bold p-2.5 rounded-lg transition flex items-center justify-center"
                          title="Descargar Reporte"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
