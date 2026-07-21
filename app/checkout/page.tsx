'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle, Lock, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    cardNumber: '4557 8800 1234 5678',
    cardName: 'CLIENTE PRUEBA',
    expiry: '12/28',
    cvv: '123',
  });

  const total = getTotalPrice();

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total,
          paymentDetails: formData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderId(data.orderId);
        setSuccess(true);
        clearCart();
      }
    } catch (err) {
      console.error('Error al pagar:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-brand-card p-10 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white">¡Pago Exitoso con MercadoPago / Culqi!</h1>
        <p className="text-gray-300 text-sm">
          Tu compra en <strong>Cryzan Sport</strong> ha sido procesada correctamente.
        </p>
        <div className="bg-gray-900 p-4 rounded-xl text-xs font-mono text-gray-400 border border-gray-800">
          Orden ID: <span className="text-brand-red font-bold">{orderId}</span>
        </div>
        <button
          onClick={() => router.push('/productos')}
          className="bg-brand-red hover:bg-brand-redHover text-white font-bold px-8 py-3 rounded-xl transition"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-red" /> Checkout Seguro Sandbox
          </h1>
          <p className="text-gray-400 text-xs mt-1">Integración MercadoPago / Culqi Perú</p>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
          <Lock className="w-3 h-3" /> SSL 256-bit
        </span>
      </div>

      <form onSubmit={handlePay} className="bg-brand-card p-8 rounded-2xl border border-gray-800 shadow-xl space-y-6">
        <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 flex items-center justify-between text-sm">
          <span className="text-gray-400">Monto Total a Pagar:</span>
          <span className="text-2xl font-black text-brand-red">S/. {total.toFixed(2)}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Número de Tarjeta (Prueba)</label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
              required
              className="w-full bg-gray-900 border border-gray-700 px-4 py-3 rounded-xl text-white text-sm focus:border-brand-red outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre en la Tarjeta</label>
            <input
              type="text"
              value={formData.cardName}
              onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
              required
              className="w-full bg-gray-900 border border-gray-700 px-4 py-3 rounded-xl text-white text-sm focus:border-brand-red outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Expiración (MM/AA)</label>
              <input
                type="text"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                required
                className="w-full bg-gray-900 border border-gray-700 px-4 py-3 rounded-xl text-white text-sm focus:border-brand-red outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">CVV</label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                required
                className="w-full bg-gray-900 border border-gray-700 px-4 py-3 rounded-xl text-white text-sm focus:border-brand-red outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-red hover:bg-brand-redHover text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
        >
          {loading ? 'Procesando Pago Sandbox...' : `Pagar S/. ${total.toFixed(2)}`}
        </button>

        <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transacción simulada en entorno de pruebas Culqi / MercadoPago
        </p>
      </form>
    </div>
  );
}
