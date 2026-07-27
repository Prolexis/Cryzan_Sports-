'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';

export default function LibroReclamacionesPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    documentType: 'DNI',
    documentNumber: '',
    phone: '',
    email: '',
    type: 'RECLAMO', // RECLAMO o QUEJA
    description: '',
    request: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reclamaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar reclamación');
      }

      setSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-muted hover:text-white transition text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <div className="flex items-center gap-2 text-brand-red font-black text-xs uppercase tracking-widest bg-brand-red/10 border border-brand-red/30 px-3 py-1.5 rounded-full">
            <BookOpen className="w-3.5 h-3.5" /> Libro Digital
          </div>
        </div>

        {success ? (
          /* SUCCESS DISPLAY */
          <div className="bg-brand-card border border-gray-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">Reclamación Registrada</h1>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Tu solicitud ha sido recibida conforme a las regulaciones de INDECOPI. Te responderemos en un plazo máximo de 15 días hábiles.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm mx-auto space-y-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Número de Registro</span>
              <p className="text-2xl font-black text-brand-red tracking-wider">{success.claimNumber}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href={`/api/reclamaciones/download-receipt/${success.reportId}`}
                download
                className="bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold px-6 py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Descargar Constancia PDF
              </a>
              <Link
                href="/"
                className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-6 py-4 rounded-xl border border-gray-700 transition flex items-center justify-center"
              >
                Ir a la Tienda
              </Link>
            </div>
          </div>
        ) : (
          /* FORM DISPLAY */
          <div className="bg-brand-card border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="space-y-2 border-b border-gray-800 pb-5">
              <h1 className="text-3xl font-black text-white tracking-tight">Libro de Reclamaciones</h1>
              <p className="text-brand-muted text-sm">
                Conforme a la Ley N° 29571. Llena los siguientes campos con veracidad para canalizar tu caso.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* TIPO */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tipo de Solicitud</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition"
                  >
                    <option value="RECLAMO">RECLAMO (Disconformidad relacionada a los productos o servicios)</option>
                    <option value="QUEJA">QUEJA (Disconformidad con la calidad del servicio o atención al cliente)</option>
                  </select>
                </div>

                {/* NOMBRE */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nombre Completo</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Ej: Juan Pérez Díaz"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red placeholder-gray-600 transition"
                  />
                </div>

                {/* TIPO DOC */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tipo de Documento</label>
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition"
                  >
                    <option value="DNI">DNI (Persona Natural)</option>
                    <option value="RUC">RUC (Empresas)</option>
                    <option value="CE">Carnet de Extranjería</option>
                  </select>
                </div>

                {/* NÚMERO DOC */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Número de Documento</label>
                  <input
                    type="text"
                    name="documentNumber"
                    required
                    placeholder="Ej: 47586932"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red placeholder-gray-600 transition"
                  />
                </div>

                {/* TELÉFONO */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Ej: 987654321"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red placeholder-gray-600 transition"
                  />
                </div>

                {/* EMAIL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Ej: cliente@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red placeholder-gray-600 transition"
                  />
                </div>

                {/* DETALLE */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Descripción del Hecho (Queja o Reclamo)</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    placeholder="Describe a detalle lo ocurrido con el producto o servicio adquirido..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red placeholder-gray-600 transition resize-none"
                  />
                </div>

                {/* PRETENSIÓN */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pretensión (¿Qué solicitas de Cryzan Sport?)</label>
                  <textarea
                    name="request"
                    required
                    rows={3}
                    placeholder="Ej: Solicito la devolución del importe de S/. 150.00 o el cambio del producto por defecto de fábrica."
                    value={formData.request}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red placeholder-gray-600 transition resize-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-red hover:bg-brand-redHover disabled:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Procesando e Iniciando Generación de PDF...' : 'Enviar Reclamación'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
