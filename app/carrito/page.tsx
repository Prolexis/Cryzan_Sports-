'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, Bookmark } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';

export default function CarritoPage() {
  const router = useRouter();
  const {
    items,
    savedForLater,
    totalPrice,
    shippingCost,
    removeItem,
    updateQuantity,
    saveForLater,
    moveToCart,
    fetchCart,
    loading
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (items.length === 0 && savedForLater.length === 0) {
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
        <Link
          href="/productos"
          className="text-xs text-brand-muted hover:text-brand-text font-semibold flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-brand-border"
        >
          <ArrowLeft className="w-4 h-4" /> Seguir Comprando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LISTA DE PRODUCTOS EN CARRITO */}
        <div className="lg:col-span-2 space-y-6">
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-brand-card p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-20 h-20 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">{item.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Talla: {item.size}</p>
                      <p className="text-brand-red font-extrabold text-sm mt-1">
                        S/. {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* CONTROLES DE CANTIDAD */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="flex items-center gap-3 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={loading}
                        className="text-gray-400 hover:text-white disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-bold text-sm min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                        className="text-gray-400 hover:text-white disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right flex flex-col justify-center">
                      <p className="text-white font-black text-lg">
                        S/. {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex gap-3 justify-end mt-1">
                        <button
                          onClick={() => saveForLater(item.id)}
                          className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-0.5"
                        >
                          <Bookmark className="w-3.5 h-3.5" /> Guardar
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-500 hover:text-red-400 text-xs font-semibold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-brand-card p-8 rounded-xl border border-gray-800 text-center text-brand-muted">
              No tienes artículos activos en tu carrito.
            </div>
          )}

          {/* GUARDADOS PARA DESPUES */}
          {savedForLater.length > 0 && (
            <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-400" /> Guardados para Después
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedForLater.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-brand-border bg-gray-900/50 flex gap-4"
                  >
                    <div className="relative w-16 h-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-brand-red font-bold mt-0.5">S/. {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => moveToCart(item.id)}
                          className="text-xs text-brand-red hover:underline font-bold"
                        >
                          Mover al carrito
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-gray-500 hover:text-red-400"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RESUMEN DE COMPRA */}
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6 h-fit">
          <h2 className="text-xl font-extrabold text-white pb-4 border-b border-gray-800">
            Resumen de Compra
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal:</span>
              <span className="text-white font-semibold">S/. {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Costo de Envío:</span>
              <span className="text-white font-semibold">
                {shippingCost > 0 ? `S/. ${shippingCost.toFixed(2)}` : 'S/. 0.00 (Gratis)'}
              </span>
            </div>
            <div className="flex justify-between text-white font-black text-xl pt-4 border-t border-gray-800">
              <span>Total:</span>
              <span className="text-brand-red">S/. {(totalPrice + shippingCost).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            disabled={items.length === 0}
            className="w-full bg-brand-red hover:bg-brand-redHover disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" /> Finalizar Compra
          </button>
        </div>
      </div>
    </div>
  );
}
