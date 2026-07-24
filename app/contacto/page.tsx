'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import { contactSchema, ContactFormData } from '@/lib/schemas';

export default function ContactoPage() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
        reset();
      }
    } catch (err) {
      console.error('Error al enviar formulario:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black text-brand-text">Contáctanos</h1>
        <p className="text-brand-muted max-w-xl mx-auto text-sm">
          ¿Tienes alguna consulta sobre nuestros productos o envíos? Escríbenos y el equipo de Cryzan Sport te responderá a la brevedad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* INFO CONTACTO */}
        <div className="bg-brand-card p-8 rounded-2xl border border-brand-border space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-brand-text mb-6">Atención al Cliente</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-brand-muted text-sm">
                <div className="p-3 bg-brand-red/10 text-brand-red rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-brand-text">Ubicación</strong>
                  Trujillo, La Libertad - Perú
                </div>
              </li>
              <li className="flex items-center gap-3 text-brand-muted text-sm">
                <div className="p-3 bg-brand-red/10 text-brand-red rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-brand-text">Correo Oficial</strong>
                  contacto@cryzansport.com
                </div>
              </li>
              <li className="flex items-center gap-3 text-brand-muted text-sm">
                <div className="p-3 bg-brand-red/10 text-brand-red rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-brand-text">Teléfono / WhatsApp</strong>
                  +51 999 888 777
                </div>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-brand-dark rounded-xl border border-brand-border text-xs text-brand-muted">
            Horario de atención: Lunes a Sábado de 8:00 AM a 8:00 PM.
          </div>
        </div>

        {/* FORMULARIO DE CONTACTO */}
        <div className="bg-brand-card p-8 rounded-2xl border border-brand-border shadow-xl">
          {success ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-brand-text">¡Mensaje Enviado!</h3>
              <p className="text-brand-muted text-sm">
                Gracias por escribirnos. Nos pondremos en contacto contigo lo antes posible.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1">Nombre Completo</label>
                <input
                  {...register('name')}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-brand-dark border border-brand-border px-4 py-3 rounded-xl text-brand-text placeholder-brand-muted text-sm focus:border-brand-red outline-none"
                />
                {errors.name && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1">Correo Electrónico</label>
                <input
                  {...register('email')}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-brand-dark border border-brand-border px-4 py-3 rounded-xl text-brand-text placeholder-brand-muted text-sm focus:border-brand-red outline-none"
                />
                {errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1">Mensaje</label>
                <textarea
                  {...register('message')}
                  rows={4}
                  placeholder="Escribe tu consulta aquí..."
                  className="w-full bg-brand-dark border border-brand-border px-4 py-3 rounded-xl text-brand-text placeholder-brand-muted text-sm focus:border-brand-red outline-none"
                ></textarea>
                {errors.message && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-red hover:bg-brand-redHover text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> {loading ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
