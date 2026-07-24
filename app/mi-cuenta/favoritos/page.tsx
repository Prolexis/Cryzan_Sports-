'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState([
    {
      id: '1',
      name: 'Polo Deportivo Cryzan Pro',
      price: 59.9,
      image: '/img/productos/polo.jpeg',
    },
    {
      id: '2',
      name: 'Zapatillas Running Cryzan Speed',
      price: 189.9,
      image: '/img/productos/zapatillas.jpeg',
    },
  ]);

  const handleRemove = (id: string) => {
    setFavorites(favorites.filter((item) => item.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Heart className="w-8 h-8 text-brand-red fill-current" /> Mi Lista de Favoritos
          </h1>
          <p className="text-gray-400 text-sm mt-1">Productos guardados para comprar más tarde</p>
        </div>
        <Link
          href="/mi-cuenta"
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {favorites.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-brand-card rounded-2xl border border-gray-800 space-y-4">
            <p className="text-gray-400">No tienes productos en tu lista de favoritos.</p>
            <Link href="/productos" className="inline-block bg-brand-red text-white text-xs font-bold px-6 py-3 rounded-xl shadow">
              Ver Productos
            </Link>
          </div>
        ) : (
          favorites.map((fav) => (
            <div key={fav.id} className="bg-brand-card p-6 rounded-2xl border border-gray-800 flex justify-between items-center shadow-lg">
              <div>
                <h3 className="text-white font-bold text-base">{fav.name}</h3>
                <p className="text-brand-red font-black text-lg mt-1">S/. {fav.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleRemove(fav.id)}
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
