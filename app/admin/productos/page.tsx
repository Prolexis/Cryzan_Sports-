'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Search, Upload, Check, X, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: { name: string };
  variants: { id: string; size: string; stock: number }[];
}

export default function AdminProductosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(59.9);
  const [categoryName, setCategoryName] = useState('Polos');
  const [image, setImage] = useState('/img/productos/polo.jpeg');
  const [stock, setStock] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/productos');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setImage(data.url);
      }
    } catch (err) {
      console.error('Error subiendo imagen:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price: Number(price), categoryName, image, stock: Number(stock) }),
      });

      if (res.ok) {
        setShowModal(false);
        setName('');
        setDescription('');
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/admin/productos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Package className="w-8 h-8 text-brand-red" /> Gestión de Productos
          </h1>
          <p className="text-gray-400 text-sm mt-1">Administra el catálogo, imágenes y stock de variantes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-red hover:bg-brand-redHover text-white font-bold px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-brand-red outline-none"
        />
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-brand-card rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
              <tr>
                <th className="p-4">Imagen</th>
                <th className="p-4">Nombre</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Variantes & Stock</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400">
                    Cargando inventario...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400">
                    No hay productos registrados.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-900/50">
                    <td className="p-4">
                      <div className="relative w-12 h-12 bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">{p.name}</td>
                    <td className="p-4">
                      <span className="bg-brand-red/10 text-brand-red text-xs px-2.5 py-1 rounded-full font-bold uppercase">
                        {p.category.name}
                      </span>
                    </td>
                    <td className="p-4 font-black text-white">S/. {p.price.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.variants?.length ? (
                          p.variants.map((v) => (
                            <span key={v.id} className="bg-gray-800 text-xs text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                              Talla {v.size}: <strong>{v.stock}</strong>
                            </span>
                          ))
                        ) : (
                          <span className="text-emerald-400 text-xs font-semibold">{p.stock} unidades</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR PRODUCTO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-brand-card p-8 rounded-2xl border border-gray-800 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">Nuevo Producto Cryzan Sport</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ej. Polo Técnico Cryzan"
                  className="w-full bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-xl text-white outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="Detalles técnicos..."
                  className="w-full bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-xl text-white outline-none focus:border-brand-red"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Precio (S/.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-xl text-white outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Categoría</label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-xl text-white outline-none focus:border-brand-red"
                  >
                    <option value="Polos">Polos</option>
                    <option value="Zapatillas">Zapatillas</option>
                    <option value="Pelotas">Pelotas</option>
                    <option value="Casacas">Casacas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Imagen (Cloudinary / Storage Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-gray-400 bg-gray-900 border border-gray-700 rounded-xl p-2 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Stock Total Inicial</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  required
                  className="w-full bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-xl text-white outline-none focus:border-brand-red"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-brand-red text-white text-xs font-bold shadow"
                >
                  {submitting ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
