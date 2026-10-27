'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatCLP } from '@/lib/format';

interface OrderItemRow {
  id: number;
  product_title: string;
  quantity: number;
  unit_price: number;
  label_name: string | null;
  color_name: string | null;
}

interface OrderRow {
  id: number;
  customer_name: string;
  rut: string | null;
  delivery_type: string;
  delivery_address: string | null;
  notes: string | null;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItemRow[];
}

type StatusFilter = 'pending' | 'confirmado' | 'rechazado';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmado: 'Confirmado',
  rechazado: 'Rechazado',
};

export default function OrdersManager() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOrders = async (status: StatusFilter) => {
    setLoading(true);
    setActionError(null);

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        rut,
        delivery_type,
        delivery_address,
        notes,
        total,
        status,
        created_at,
        order_items ( id, product_title, quantity, unit_price, label_name, color_name )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as unknown as OrderRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  const handleConfirm = async (id: number) => {
    setProcessingId(id);
    setActionError(null);
    const { error } = await supabase.rpc('confirm_order', { p_order_id: id });
    setProcessingId(null);

    if (error) {
      setActionError(`No se pudo confirmar el pedido #${id}: ${error.message}`);
      return;
    }
    fetchOrders(statusFilter);
  };

  const handleReject = async (id: number) => {
    if (!confirm(`¿Rechazar el pedido #${id}? El stock reservado se devolverá automáticamente.`)) return;

    setProcessingId(id);
    setActionError(null);
    const { error } = await supabase.rpc('reject_order', { p_order_id: id });
    setProcessingId(null);

    if (error) {
      setActionError(`No se pudo rechazar el pedido #${id}: ${error.message}`);
      return;
    }
    fetchOrders(statusFilter);
  };

  const toggleExpanded = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Pedidos</h2>
      </div>

      {/* Tabs de estado */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'confirmado', 'rechazado'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === s
                ? 'bg-ink text-white shadow-sm'
                : 'bg-white text-ink/70 border border-ink/15 hover:border-ink/30'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {actionError && (
        <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className="text-center py-12 text-ink/60 font-medium">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-center py-12 text-ink/60 font-medium">
          No hay pedidos {STATUS_LABELS[statusFilter].toLowerCase()}s.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm hover:border-ink/20 transition-all"
              >
                <div
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                  onClick={() => toggleExpanded(order.id)}
                >
                  <div className="font-extrabold text-ink text-sm">#{order.id}</div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-ink truncate">{order.customer_name}</div>
                    <div className="text-xs text-ink/60 truncate">
                      {order.delivery_type === 'delivery' ? 'Despacho' : 'Retiro en tienda'} ·{' '}
                      {new Date(order.created_at).toLocaleString('es-CL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="font-bold text-sm text-ink shrink-0">
                    {formatCLP(order.total)}
                  </div>

                  {statusFilter === 'pending' ? (
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        disabled={processingId === order.id}
                        onClick={() => handleConfirm(order.id)}
                        className="py-1.5 px-3 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand/90 transition-all disabled:opacity-50"
                      >
                        Confirmar
                      </button>
                      <button
                        disabled={processingId === order.id}
                        onClick={() => handleReject(order.id)}
                        title="Rechazar"
                        className="w-8 h-8 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center font-bold text-xs disabled:opacity-50"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'confirmado'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="bg-neutral-50 p-4 border-t border-ink/10 text-xs space-y-2">
                    {order.rut && (
                      <p className="text-ink/80">
                        <strong>RUT:</strong> {order.rut}
                      </p>
                    )}
                    {order.delivery_type === 'delivery' && order.delivery_address && (
                      <p className="text-ink/80">
                        <strong>Dirección:</strong> {order.delivery_address}
                      </p>
                    )}
                    {order.notes && (
                      <p className="text-ink/80">
                        <strong>Notas:</strong> {order.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-dashed border-ink/15 space-y-1">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between text-ink/90 py-0.5">
                          <span>
                            {item.quantity}× {item.product_title}
                            {(item.label_name || item.color_name) && (
                              <span className="text-ink/50">
                                {' '}
                                ({[item.label_name, item.color_name].filter(Boolean).join(' - ')})
                              </span>
                            )}
                          </span>
                          <span className="font-semibold">{formatCLP(item.unit_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}