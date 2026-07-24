'use client';

import { useState } from 'react';
import { MapPin, Plus, Trash2, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

interface Address {
  id: string;
  street: string;
  city: string;
  province: string;
  phone: string;
  isDefault: boolean;
}

export default function DireccionesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      street: 'Av. Larco 1234, Urb. California',
      city: 'Trujillo',
      province: 'La Libertad',
      phone: '+51 987 654 321',
      isDefault: true,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Trujillo');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddresses([
      ...addresses,
      {
        id: String(Date.now()),
        street,
        city,
        province: 'La Libertad',
        phone: '+51 987 654 321',
        isDefault: false,
      },
    ]);
    setShowModal(false);
    setStreet('');
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <MapPin className="w-8 h-8 text-brand-red" /> Mis Direcciones
          </h1>
          <p className="text-gray-400 text-sm mt-1">Direcciones guardadas para tus envíos en Perú</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/mi-cuenta"
            className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-bold text-white bg-brand-red hover:bg-brand-redHover px-3 py-2 rounded-lg flex items-center gap-1 shadow"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-brand-card p-6 rounded-2xl border border-gray-800 flex justify-between items-center shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base">{addr.street}</h3>
                {addr.isDefault && (
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs font-extrabold px-2 py-0.5 rounded border border-emerald-500/30">
                    Principal
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs">{addr.city}, {addr.province}</p>
              <p className="text-gray-500 text-xs">Tel: {addr.phone}</p>
            </div>
            {!addr.isDefault && (
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Nueva Dirección</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Calle / Av. / Dirección</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  placeholder="Ej. Av. España 500"
                  className="w-full bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-xl text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Ciudad / Distrito</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-xl text-white outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-red rounded-xl shadow"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
