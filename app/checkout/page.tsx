'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle, Lock, ShieldCheck, Tag, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, shippingCost: dbShippingCost, clearCart, fetchCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Cupones y envíos
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [shippingRegion, setShippingRegion] = useState('trujillo');

  // Facturación DNI / RUC
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('47586932');

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = totalPrice ?? 0;
  const shippingCost = dbShippingCost ?? 0;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch('/api/cupones/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.discountType === 'PERCENTAGE') {
          const calculated = (subtotal * data.value) / 100;
          setDiscount(calculated);
          setCouponMsg(`¡Cupón ${data.code} aplicado! ${data.value}% de descuento.`);
        } else {
          setDiscount(data.value);
          setCouponMsg(`¡Cupón ${data.code} aplicado! S/. ${data.value} de descuento.`);
        }
      } else {
        setCouponMsg(data.error || 'Cupón inválido');
      }
    } catch (err) {
      setCouponMsg('Error al validar cupón');
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total,
          shippingCost,
          documentType,
          documentNumber,
          couponCode: discount > 0 ? couponCode : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderId(data.orderId);
        setSuccess(true);
        clearCart();
      } else {
        alert(data.error || 'Error al procesar el pago');
      }
    } catch (err) {
      console.error('Error en checkout:', err);
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
        <h1 className="text-3xl font-black text-white">¡Pago Exitoso en Cryzan Sport!</h1>
        <p className="text-gray-300 text-sm">
          Se ha enviado un correo electrónico de confirmación a tu cuenta.
        </p>
        <div className="bg-gray-900 p-4 rounded-xl text-xs font-mono text-gray-400 border border-gray-800">
          Orden ID: <span className="text-brand-red font-bold">{orderId}</span>
        </div>
        <button
          onClick={() => router.push('/mi-cuenta/pedidos')}
          className="bg-brand-red hover:bg-brand-redHover text-white font-bold px-8 py-3 rounded-xl transition"
        >
          Ver Mis Pedidos y Descargar Boleta PDF
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-red" /> Checkout MercadoPago / Culqi Perú
          </h1>
          <p className="text-gray-400 text-xs mt-1">Transacción atómica con envío e impuestos incluidos</p>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
          <Lock className="w-3 h-3" /> SSL 256-bit
        </span>
      </div>

      <form onSubmit={handlePay} className="bg-brand-card p-8 rounded-2xl border border-gray-800 shadow-xl space-y-6">
        {/* COMPROBANTE DE VENTA */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-white border-b border-gray-800 pb-2">Comprobante de Venta (SUNAT Peru)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Tipo Documento</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 px-3 py-2.5 rounded-xl text-white text-xs outline-none"
              >
                <option value="DNI">Boleta (DNI)</option>
                <option value="RUC">Factura (RUC)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Número de Documento</label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-xl text-white text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* CALCULO DE ENVIO */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-extrabold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-red" /> Zona de Envío en Perú
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <button
              type="button"
              onClick={() => setShippingRegion('trujillo')}
              className={`p-4 rounded-xl border text-left font-semibold transition ${
                shippingRegion === 'trujillo'
                  ? 'bg-brand-red/10 border-brand-red text-white'
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}
            >
              <span className="block font-bold">Trujillo Urbano</span>
              <span className="text-emerald-400">Envío GRATIS (S/. 0.00)</span>
            </button>

            <button
              type="button"
              onClick={() => setShippingRegion('provincias')}
              className={`p-4 rounded-xl border text-left font-semibold transition ${
                shippingRegion === 'provincias'
                  ? 'bg-brand-red/10 border-brand-red text-white'
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}
            >
              <span className="block font-bold">Provincias / Olva / Shalom</span>
              <span>Tarifa Plana (S/. 15.00)</span>
            </button>
          </div>
        </div>

        {/* CUPÓN DE DESCUENTO */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-gray-300">Cupón de Descuento (Prueba: CRYZAN15)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. CRYZAN15"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 px-4 py-2 rounded-xl text-white text-xs outline-none uppercase"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-4 py-2 rounded-xl border border-gray-700 flex items-center gap-1"
            >
              <Tag className="w-3.5 h-3.5" /> Aplicar
            </button>
          </div>
          {couponMsg && <p className="text-xs text-emerald-400 mt-1">{couponMsg}</p>}
        </div>

        {/* RESUMEN DE PRECIOS */}
        <div className="bg-gray-900/90 p-5 rounded-xl border border-gray-800 space-y-2 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal:</span>
            <span>S/. {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Descuento Cupón:</span>
              <span>- S/. {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-400">
            <span>Costo Envío:</span>
            <span>S/. {shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white font-black text-xl pt-2 border-t border-gray-800">
            <span>Total a Pagar:</span>
            <span className="text-brand-red">S/. {total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-red hover:bg-brand-redHover text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-base"
        >
          {loading ? 'Procesando Pago Seguro...' : `Pagar S/. ${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
