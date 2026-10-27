'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, CartItem } from '@/lib/useCartStore';
import { useIsHydrated } from '@/lib/useIsHydrated';
import { formatCLP } from '@/lib/format';
import { supabase } from '@/lib/supabaseClient';
import { isValidRut, autoFormatRut } from '@/lib/rut';
import { siteConfig } from '@/config/siteConfig';

function buildWhatsAppMessage(
  orderId: number,
  items: CartItem[],
  total: number,
  name: string,
  rut: string,
  deliveryType: 'delivery' | 'retiro',
  paymentMethod: 'transferencia' | 'efectivo',
  address: string,
  notes: string
): string {
  const lines: string[] = [];

  lines.push(`*¡Hola! Gracias por tu compra en ${siteConfig.name}.*`);
  lines.push(`*ID de Compra: #${orderId}*`);
  lines.push('Hemos registrado tu pedido con el siguiente detalle:');
  lines.push('──────────────────────────────');
  lines.push('');
  lines.push('*DATOS DEL CLIENTE*');
  lines.push(`• *Nombre:* ${name}`);
  lines.push(`• *RUT:* ${rut}`);
  lines.push(`• *Entrega:* ${deliveryType === 'delivery' ? 'Despacho a domicilio' : 'Retiro en tienda'}`);
  lines.push(`• *Forma de Pago:* ${paymentMethod === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo'}`);

  if (deliveryType === 'delivery' && address) {
    lines.push(`• *Dirección:* ${address}`);
  }

  lines.push('');
  lines.push('*DETALLE DE PRODUCTOS*');
  items.forEach((item) => {
    const details = [item.selected_label, item.selected_color].filter(Boolean).join(' - ');
    const metaText = details ? ` (${details})` : '';

    lines.push(`• *${item.quantity}x* ${item.product_title}${metaText} ── *${formatCLP(item.unit_price * item.quantity)}*`);
  });

  lines.push('');
  lines.push('──────────────────────────────');
  lines.push(`*TOTAL A PAGAR: ${formatCLP(total)}*`);
  lines.push('──────────────────────────────');

  if (notes.trim()) {
    lines.push('');
    lines.push(`*Notas:* _${notes.trim()}_`);
  }

  lines.push('');
  lines.push('Por favor, confirma este mensaje para comenzar a preparar tu pedido. ¡Muchas gracias!');

  return lines.join('\n');
}

export default function PedidosPage() {
  const isHydrated = useIsHydrated();

  const storeCart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  const cart = isHydrated ? storeCart : [];
  const total = cart.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);

  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'retiro'>('retiro');
  const [paymentMethod, setPaymentMethod] = useState<'transferencia' | 'efectivo'>('transferencia');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSent, setOrderSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Ingresa tu nombre.');
      return;
    }
    if (!isValidRut(rut)) {
      setError('Ingresa un RUT válido.');
      return;
    }
    if (deliveryType === 'delivery' && !address.trim()) {
      setError('Ingresa la dirección de despacho.');
      return;
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    if (!whatsappNumber) {
      setError('El número de WhatsApp de la tienda no está configurado todavía. Contacta al administrador.');
      return;
    }

    setSubmitting(true);

    const itemsPayload = cart.map((item) => ({
      product_id: item.product_id,
      product_title: item.product_title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      variant_id: item.variant_id,
      color_id: item.color_id,
      label_name: item.selected_label,
      color_name: item.selected_color,
    }));

    const { data: newOrderId, error: orderError } = await supabase.rpc('create_order', {
      p_customer_name: name.trim(),
      p_rut: rut,
      p_delivery_type: deliveryType,
      p_delivery_address: deliveryType === 'delivery' ? address.trim() : null,
      p_notes: `[Pago: ${paymentMethod}] ${notes.trim()}`.trim(),
      p_total: total,
      p_items: itemsPayload,
    });

    setSubmitting(false);

    if (orderError || !newOrderId) {
      setError(
        orderError?.message?.includes('Sin stock suficiente')
          ? 'Uno de los productos ya no tiene stock suficiente. Vuelve al catálogo y ajusta tu carrito.'
          : `No se pudo registrar el pedido: ${orderError?.message || 'error desconocido'}`
      );
      return;
    }

    const message = buildWhatsAppMessage(
      newOrderId,
      cart,
      total,
      name.trim(),
      rut,
      deliveryType,
      paymentMethod,
      address,
      notes
    );
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    clearCart();
    setOrderSent(true);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-ink/60 font-medium">
        Cargando...
      </div>
    );
  }

  if (orderSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="bg-white border border-ink/10 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-4">
          <h2 className="text-2xl font-bold text-ink">¡Pedido enviado!</h2>
          <p className="text-sm text-ink/70 leading-relaxed">
            Se abrió WhatsApp con tu pedido. Confírmalo ahí para que la tienda lo reciba.
          </p>
          <Link
            href="/"
            className="inline-block w-full py-3 px-6 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-all"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="bg-white border border-ink/10 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-4">
          <h2 className="text-2xl font-bold text-ink">Tu carrito está vacío</h2>
          <p className="text-sm text-ink/70 leading-relaxed">
            Agrega productos desde el catálogo antes de continuar.
          </p>
          <Link
            href="/"
            className="inline-block w-full py-3 px-6 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-all"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-ink/60 hover:text-ink transition-colors"
        >
          ← Volver al catálogo
        </Link>

        <h1 className="text-3xl font-extrabold text-ink">Finalizar Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Resumen del pedido */}
          <div className="lg:col-span-5 bg-white border border-ink/10 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
            <h3 className="text-lg font-bold text-ink border-b border-ink/10 pb-3">
              Tu pedido
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 items-center text-sm">
                  {item.img_url && (
                    <Image
                      src={item.img_url}
                      alt={item.product_title}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover bg-neutral-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink truncate">{item.product_title}</p>

                    {(item.selected_label || item.selected_color) && (
                      <p className="text-xs text-ink/60 truncate">
                        {[item.selected_label, item.selected_color].filter(Boolean).join(' · ')}
                      </p>
                    )}

                    <p className="text-xs text-ink/50">
                      {item.quantity} × {formatCLP(item.unit_price)}
                    </p>
                  </div>
                  <span className="font-bold text-ink shrink-0">
                    {formatCLP(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-ink/10 flex justify-between items-center text-lg font-bold text-ink">
              <span>Total</span>
              <span className="text-brand">{formatCLP(total)}</span>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-7 bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-neutral-50 border border-ink/15 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">RUT</label>
                <input
                  type="text"
                  value={rut}
                  onChange={(e) => setRut(autoFormatRut(e.target.value))}
                  placeholder="12.345.678-9"
                  maxLength={12}
                  required
                  className="w-full bg-neutral-50 border border-ink/15 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">Tipo de Entrega</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('retiro')}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      deliveryType === 'retiro'
                        ? 'bg-ink text-white border-ink'
                        : 'bg-neutral-50 text-ink/70 border-ink/15 hover:border-ink/30'
                    }`}
                  >
                    Retiro en tienda
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      deliveryType === 'delivery'
                        ? 'bg-ink text-white border-ink'
                        : 'bg-neutral-50 text-ink/70 border-ink/15 hover:border-ink/30'
                    }`}
                  >
                    Despacho
                  </button>
                </div>
              </div>

              {deliveryType === 'delivery' && (
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">
                    Dirección de despacho
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full bg-neutral-50 border border-ink/15 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">Forma de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      paymentMethod === 'transferencia'
                        ? 'bg-ink text-white border-ink'
                        : 'bg-neutral-50 text-ink/70 border-ink/15 hover:border-ink/30'
                    }`}
                  >
                    Transferencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      paymentMethod === 'efectivo'
                        ? 'bg-ink text-white border-ink'
                        : 'bg-neutral-50 text-ink/70 border-ink/15 hover:border-ink/30'
                    }`}
                  >
                    Efectivo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">
                  Notas del pedido (opcional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: entregar después de las 18:00"
                  className="w-full bg-neutral-50 border border-ink/15 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none"
                />
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-brand text-white font-bold text-sm shadow-sm hover:bg-brand/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Enviar Pedido por WhatsApp'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}