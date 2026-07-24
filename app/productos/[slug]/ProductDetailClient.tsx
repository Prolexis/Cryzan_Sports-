'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, CheckCircle2, ShieldCheck, Truck, Star } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';

interface Variant {
  id: string;
  size: string;
  color?: string | null;
  stock: number;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    images: string[];
    stock: number;
    category: { name: string };
    variants: Variant[];
    reviews: any[];
  };
}

export function ProductDetailClient({ product }: ProductDetailProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants?.length ? product.variants[0] : null
  );
  const [added, setAdded] = useState(false);

  const imagesList = product.images?.length ? product.images : [product.image];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: `${product.name} ${selectedVariant ? `(Talla ${selectedVariant.size})` : ''}`,
      price: product.price,
      image: product.image,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-brand-card p-8 rounded-3xl border border-gray-800 shadow-2xl">
      {/* GALERÍA DE IMÁGENES */}
      <div className="space-y-4">
        <div className="relative h-96 w-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
          <Image src={selectedImage} alt={product.name} fill className="object-cover" />
        </div>

        {imagesList.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {imagesList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                  selectedImage === img ? 'border-brand-red scale-105' : 'border-gray-800 opacity-60'
                }`}
              >
                <Image src={img} alt={`Imagen ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DETALLES DE COMPRA */}
      <div className="space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <span className="inline-block bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
            {product.category.name}
          </span>
          <h1 className="text-3xl font-black text-white">{product.name}</h1>
          <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>

          <div className="text-3xl font-black text-white pt-2">
            S/. {product.price.toFixed(2)}
          </div>

          {/* SELECTOR DE VARIANTES / TALLAS */}
          {product.variants?.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Selecciona tu Talla:
              </label>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    disabled={v.stock === 0}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                      selectedVariant?.id === v.id
                        ? 'bg-brand-red text-white border-brand-red shadow-lg'
                        : v.stock === 0
                        ? 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed line-through'
                        : 'bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800'
                    }`}
                  >
                    Talla {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STOCK DISPONIBLE */}
          <div className="text-xs">
            {currentStock > 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Stock disponible ({currentStock} unidades)
              </span>
            ) : (
              <span className="text-red-400 font-semibold">✗ Agotado en esta variante</span>
            )}
          </div>
        </div>

        {/* BOTÓN AGREGAR AL CARRITO */}
        <div className="space-y-4 pt-6 border-t border-gray-800">
          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            className={`w-full py-4 rounded-xl font-bold text-base transition shadow-xl flex items-center justify-center gap-2 ${
              currentStock === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-red hover:bg-brand-redHover text-white'
            }`}
          >
            {added ? (
              <>
                <CheckCircle2 className="w-5 h-5" /> ¡Añadido al Carrito!
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" /> Agregar al Carrito
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 pt-2">
            <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-xl border border-gray-800">
              <Truck className="w-4 h-4 text-brand-red" /> Envío rápido a Trujillo y todo el Perú
            </div>
            <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-xl border border-gray-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Garantía de producto 100% original
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
