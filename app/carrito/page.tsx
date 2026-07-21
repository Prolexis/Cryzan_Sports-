'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';

export default function CarritoPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-6 bg-brand-card p-10 rounded-2xl border border-gray-800 shadow-xl">
        <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto" />
        <h1 className="text-3xl font-extrabold text-white">Tu Carrito está Vacío 🛒</h1>
        <p className="text-gray-400">Añade productos de Cryzan Sport para comenzar tu compra.</p>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-redHover text-white font-bold px-6 py-3 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" /> Ir a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-brand-card p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-black text-white">🛒 Tu Carrito de Compras</h1>
          <p className="text-gray-400 text-sm mt-1">Revisa tus artículos antes de finalizar la compra</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
        >
          <Trash2 className="w-4 h-4" /> Vaciar Carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LISTA DE PRODUCTOS EN CARRITO */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-brand-card p-4 rounded-xl border border-gray-800 flex items-center justify-between gap-4 shadow-md"
            >
              <div className="relative w-20 h-20 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>

              <div className="flex-1">
                <h3 className="text-white font-bold text-base">{item.name}</h3>
                <p className="text-brand-red font-extrabold text-sm mt-1">
                  S/. {item.price.toFixed(2)}
                </p>
              </div>

              {/* CONTROLES DE CANTIDAD */}
              <div className="flex items-center gap-3 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="text-gray-400 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-white font-bold text-sm min-w-[20px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="text-gray-400 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <p className="text-white font-black text-lg">
                  S/. {(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-500 hover:text-red-400 text-xs mt-1"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RESUMEN DE COMPRA */}
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6 h-fit">
          <h2 className="text-xl font-extrabold text-white pb-4 border-b border-gray-800">
            Resumen de Compra
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal:</span>
              <span className="text-white font-semibold">S/. {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Envío (Trujillo / Perú):</span>
              <span className="text-emerald-400 font-semibold">GRATIS</span>
            </div>
            <div className="flex justify-between text-white font-black text-xl pt-4 border-t border-gray-800">
              <span>Total:</span>
              <span className="text-brand-red">S/. {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-brand-red hover:bg-brand-redHover text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" /> Finalizar Compra
          </button>
        </div>
      </div>
    </div>
  );
}
