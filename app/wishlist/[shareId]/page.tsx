'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';

interface SharedItem {
  id: string;
  productId: string;
  variantId: string | null;
  priceAtAdd: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    stock: number;
  };
  variant?: {
    id: string;
    size: string;
    color: string | null;
    stock: number;
  } | null;
}

export default function SharedWishlistPage({ params }: { params: { shareId: string } }) {
  const { shareId } = params;
  const addItem = useCartStore((state) => state.addItem);

  const [ownerName, setOwnerName] = useState('');
  const [items, setItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchSharedWishlist() {
      try {
        const res = await fetch(`/api/wishlist/share/${shareId}`);
        if (!res.ok) {
          throw new Error('Lista de favoritos no encontrada o inválida');
        }
        const data = await res.json();
        setOwnerName(data.ownerName);
        setItems(data.items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSharedWishlist();
  }, [shareId]);

  const handleAddToCart = (item: SharedItem) => {
    const displayName = `${item.product.name} ${item.variant ? `(Talla ${item.variant.size})` : ''}`;
    addItem(
      item.variantId
        ? item.variantId
        : { id: item.productId, name: displayName, price: item.product.price, image: item.product.image }
    );

    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center bg-brand-card p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-3">
          <div className="w-16 h-16 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center mx-auto text-brand-red mb-2">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          {loading ? (
            <div className="h-8 bg-gray-800 rounded-lg w-1/2 mx-auto animate-pulse"></div>
          ) : error ? (
            <h1 className="text-2xl font-black text-red-500">Lista No Disponible</h1>
          ) : (
            <h1 className="text-3xl font-black text-white">
              Favoritos de {ownerName}
            </h1>
          )}
          <p className="text-brand-muted text-sm max-w-md mx-auto">
            Descubre los artículos seleccionados por {ownerName || 'nuestro cliente'} en Cryzan Sport Trujillo.
          </p>
        </div>

        {/* CONTENIDO LISTA */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-brand-card h-40 rounded-2xl border border-gray-800 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-brand-card rounded-2xl border border-gray-800 space-y-4">
            <p className="text-gray-400">{error}</p>
            <Link href="/productos" className="inline-block bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold px-6 py-3 rounded-xl transition">
              Explorar Tienda
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-brand-card rounded-2xl border border-gray-800 space-y-4">
            <p className="text-gray-400">Esta lista de favoritos está vacía.</p>
            <Link href="/productos" className="inline-block bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold px-6 py-3 rounded-xl transition">
              Explorar Tienda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item) => {
              const isAdded = addedItemIds[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-brand-card p-5 rounded-2xl border border-gray-800 flex flex-col justify-between shadow-lg hover:border-gray-700 transition"
                >
                  <div className="flex gap-4 items-start">
                    <div className="relative w-20 h-20 rounded-xl bg-gray-900 overflow-hidden border border-gray-800 flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-white font-bold text-sm line-clamp-2">
                        {item.product.name}
                      </h3>
                      {item.variant && (
                        <span className="inline-block text-[10px] bg-brand-red/10 border border-brand-red/30 text-brand-red font-bold px-2 py-0.5 rounded-full uppercase">
                          Talla {item.variant.size}
                        </span>
                      )}
                      <p className="text-brand-red font-black text-base pt-1">
                        S/. {item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-800 flex gap-2">
                    <Link
                      href={`/productos/${item.product.slug}`}
                      className="flex-1 text-center bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold py-3 rounded-xl border border-gray-700 transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Ver Detalle
                    </Link>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.product.stock <= 0}
                      className={`flex-1 text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-brand-red hover:bg-brand-redHover text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Añadido
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" /> Agregar al Carrito
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
