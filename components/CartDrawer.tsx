'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowRight, Bookmark } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';

export function CartDrawer() {
  const {
    items,
    savedForLater,
    totalPrice,
    shippingCost,
    isDrawerOpen,
    setDrawerOpen,
    fetchCart,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    loading
  } = useCartStore();

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDrawerOpen) {
      fetchCart();
    }
  }, [isDrawerOpen, fetchCart]);

  // Close drawer on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setDrawerOpen(false);
      }
    }
    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDrawerOpen, setDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 flex justify-end">
      {/* DRAWER container */}
      <div
        ref={drawerRef}
        className="w-full max-w-md h-full bg-brand-dark text-brand-text flex flex-col shadow-2xl border-l border-brand-border animate-slide-in relative"
      >
        {/* HEADER */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-card">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-red" />
            <h2 className="text-xl font-black tracking-wide">Tu Carrito</h2>
            <span className="bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1 text-brand-muted hover:text-brand-text transition rounded-lg hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-gray-600" />
              <p className="text-brand-muted font-medium">No hay productos en el carrito.</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="bg-brand-red text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-brand-redHover transition"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-brand-card p-3 rounded-xl border border-brand-border flex gap-3 shadow-sm hover:border-gray-700 transition"
                >
                  <div className="relative w-16 h-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-brand-text line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-brand-muted mt-0.5">Talla: {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {/* Qty controls */}
                      <div className="flex items-center gap-2 bg-gray-900 border border-brand-border rounded-lg px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={loading}
                          className="text-brand-muted hover:text-brand-text disabled:opacity-50"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold min-w-[15px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loading}
                          className="text-brand-muted hover:text-brand-text disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveForLater(item.id)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5"
                          title="Guardar para después"
                        >
                          <Bookmark className="w-3 h-3" /> Guardar
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-brand-muted hover:text-brand-red"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between items-end">
                    <span className="text-sm font-black text-brand-text">
                      S/. {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SAVED FOR LATER SECTION */}
          {savedForLater.length > 0 && (
            <div className="pt-4 border-t border-brand-border space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-blue-400" /> Guardados para Después ({savedForLater.length})
              </h3>
              <div className="space-y-3">
                {savedForLater.map((item) => (
                  <div
                    key={item.id}
                    className="bg-brand-card/50 p-3 rounded-xl border border-brand-border flex gap-3 opacity-80 hover:opacity-100 transition"
                  >
                    <div className="relative w-12 h-12 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-brand-text line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-brand-muted">Talla: {item.size} • S/. {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => moveToCart(item.id)}
                          className="text-[10px] bg-brand-red/10 text-brand-red border border-brand-red/20 px-2 py-0.5 rounded hover:bg-brand-red hover:text-white transition font-bold"
                        >
                          Mover al carrito
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[10px] text-brand-muted hover:text-brand-red"
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

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="p-5 border-t border-brand-border bg-brand-card space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span>S/. {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Envío Estimado</span>
                <span>{shippingCost > 0 ? `S/. ${shippingCost.toFixed(2)}` : 'Gratis'}</span>
              </div>
              <div className="flex justify-between text-base font-black text-brand-text pt-1.5 border-t border-brand-border/40">
                <span>Total Estimado</span>
                <span className="text-brand-red text-lg">S/. {(totalPrice + shippingCost).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/carrito"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center gap-1.5 border border-brand-border bg-brand-dark text-brand-text text-sm font-bold py-3 rounded-xl hover:bg-gray-800 transition"
              >
                Ver Carrito
              </Link>
              <Link
                href="/checkout"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center gap-1.5 bg-brand-red text-white text-sm font-bold py-3 rounded-xl hover:bg-brand-redHover transition shadow-lg shadow-brand-red/10"
              >
                Comprar <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
