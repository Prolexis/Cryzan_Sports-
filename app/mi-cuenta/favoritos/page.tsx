'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Trash2, ShoppingCart, Share2, Check } from 'lucide-react';
import Image from 'next/image';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useCartStore } from '@/lib/store/useCartStore';

export default function FavoritosPage() {
  const { items, shareId, loading, fetchWishlist, toggleWishlist, moveToCart } = useWishlistStore();
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = (productId: string, variantId: string | null) => {
    toggleWishlist(productId, variantId);
  };

  const handleMoveToCart = async (wishlistId: string) => {
    try {
      await moveToCart(wishlistId);
      // Sincronizar el carrito de compras en el header
      await fetchCart();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (!shareId) return;
    const shareUrl = `${window.location.origin}/wishlist/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="flex items-center gap-3">
          {shareId && items.length > 0 && (
            <button
              onClick={handleShare}
              className="text-xs font-bold text-white flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl border border-emerald-500/30 transition shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> ¡Enlace Copiado!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" /> Compartir Lista
                </>
              )}
            </button>
          )}
          <Link
            href="/mi-cuenta"
            className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-xl border border-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm animate-pulse">Cargando tus favoritos...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-brand-card rounded-2xl border border-gray-800 space-y-4 shadow-lg">
          <Heart className="w-12 h-12 text-gray-700 mx-auto" />
          <p className="text-gray-400">No tienes productos en tu lista de favoritos.</p>
          <Link href="/productos" className="inline-block bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg transition">
            Ver Productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((fav) => (
            <div
              key={fav.id}
              className="bg-brand-card p-5 rounded-2xl border border-gray-800 flex gap-4 justify-between items-center shadow-lg transition hover:border-gray-700"
            >
              <div className="flex gap-4 items-center">
                <div className="relative w-16 h-16 rounded-xl bg-gray-900 overflow-hidden border border-gray-800 flex-shrink-0">
                  <Image
                    src={fav.product.image}
                    alt={fav.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm line-clamp-1">
                    {fav.product.name}
                  </h3>
                  {fav.variant && (
                    <span className="text-[10px] bg-brand-red/10 border border-brand-red/30 text-brand-red font-bold px-2 py-0.5 rounded-full uppercase">
                      Talla {fav.variant.size}
                    </span>
                  )}
                  <p className="text-brand-red font-black text-base mt-1">
                    S/. {fav.product.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveToCart(fav.id)}
                  disabled={fav.product.stock <= 0}
                  className="bg-gray-800 hover:bg-gray-700 text-white p-2.5 rounded-xl border border-gray-700 transition"
                  title="Mover al carrito"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemove(fav.productId, fav.variantId)}
                  className="text-red-400 hover:text-red-300 p-2.5 rounded-xl hover:bg-red-500/10 transition"
                  title="Eliminar de favoritos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
