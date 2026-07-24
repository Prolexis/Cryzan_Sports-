'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
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
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id, name, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="bg-brand-card rounded-xl overflow-hidden border border-brand-border shadow-xl flex flex-col justify-between"
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
