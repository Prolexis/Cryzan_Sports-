'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, CheckCircle2, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryName?: string;
  stock?: number;
}

export function ProductCard({ id, name, price, image, categoryName, stock }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { data: session } = useSession();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const isFav = isInWishlist(id);

  const handleAdd = () => {
    addItem({ id, name, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push('/login');
      return;
    }
    toggleWishlist(id);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="bg-brand-card rounded-xl overflow-hidden border border-brand-border shadow-xl flex flex-col justify-between relative"
    >
      <div className="relative h-56 w-full bg-gray-900 overflow-hidden group">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition duration-300"
        />
        {categoryName && (
          <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-brand-red text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-brand-red/30">
            {categoryName}
          </span>
        )}
        <button
          onClick={handleToggleFav}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-gray-800 text-gray-300 hover:text-brand-red transition duration-200 z-10"
          title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'text-brand-red fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-brand-text font-bold text-lg line-clamp-1">{name}</h3>
          <p className="text-brand-muted text-xs mt-1">
            Stock disponible: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stock ?? 50} unidades</span>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-brand-muted">Precio</span>
            <span className="text-2xl font-black text-brand-text">S/. {price.toFixed(2)}</span>
          </div>

          <button
            onClick={handleAdd}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition shadow-md ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-red hover:bg-brand-redHover text-white'
            }`}
          >
            {added ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Añadido
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
