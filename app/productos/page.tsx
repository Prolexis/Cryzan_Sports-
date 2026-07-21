'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/ProductSkeleton';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: { name: string; slug: string };
}

function ProductosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedCategory = searchParams?.get('categoria') || 'todos';
  const initialSearch = searchParams?.get('buscar') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (selectedCategory !== 'todos') query.set('category', selectedCategory);
        if (search) query.set('search', search);

        const res = await fetch(`/api/productos?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error cargando productos:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, search]);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (cat === 'todos') {
      params.delete('categoria');
    } else {
      params.set('categoria', cat);
    }
    router.push(`/productos?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* HEADER CATALOGO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white">Catálogo de Productos</h1>
          <p className="text-gray-400 text-sm mt-1">Explora nuestro equipamiento y vestimenta oficial Cryzan Sport</p>
        </div>

        {/* BUSCADOR */}
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition"
          />
        </div>
      </div>

      {/* FILTROS POR CATEGORIA */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 uppercase tracking-wider pr-2">
          <Filter className="w-4 h-4" /> Categorías:
        </span>

        {['todos', 'polos', 'zapatillas', 'pelotas', 'casacas'].map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
              selectedCategory === cat
                ? 'bg-brand-red text-white shadow-md'
                : 'bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* LISTA DE PRODUCTOS CON SKELETON LOADERS */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <ProductSkeleton key={n} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-brand-card rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-lg">No se encontraron productos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              image={p.image}
              categoryName={p.category.name}
              stock={p.stock}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 py-10 text-center">Cargando productos...</div>}>
      <ProductosContent />
    </Suspense>
  );
}
