'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ShoppingBag, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, Clock } from 'lucide-react';
import { formatCLP } from '@/lib/format';

interface OrderItemRow {
  quantity: number;
  unit_price: number;
  product_title: string;
  orders: { created_at: string } | { created_at: string }[] | null;
}

interface TopProduct {
  title: string;
  quantity: number;
  revenue: number;
}

interface DayStat {
  label: string;
  total: number;
}

interface LowStockItem {
  title: string;
  label: string;
  color_name: string;
  stock: number;
}

// Colores de la paleta Ayüwn
const DONUT_COLORS = ['#C12972', '#87D7CA', '#2B1026', '#E08AB4', '#4FB3A1'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [activeProductsCount, setActiveProductsCount] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailySales, setDailySales] = useState<DayStat[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        { count: activeCount },
        { count: totalCount },
        { count: pendingOrders },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setActiveProductsCount(activeCount ?? 0);
      setTotalProductsCount(totalCount ?? 0);
      setPendingOrdersCount(pendingOrders ?? 0);

      const { data: items } = await supabase
        .from('order_items')
        .select('quantity, unit_price, product_title, orders!inner(created_at)')
        .gte('orders.created_at', startOfMonth);

      const rows = (items ?? []) as unknown as OrderItemRow[];
      const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

      const productTotals: Record<string, TopProduct> = {};
      const dayTotals: Record<string, { label: string; total: number; timestamp: number }> = {};
      let curMonthRevenue = 0;

      rows.forEach((row) => {
        const orderInfo = Array.isArray(row.orders) ? row.orders[0] : row.orders;
        if (!orderInfo?.created_at) return;

        const date = new Date(orderInfo.created_at);
        const lineTotal = row.quantity * row.unit_price;

        if (!productTotals[row.product_title]) {
          productTotals[row.product_title] = { title: row.product_title, quantity: 0, revenue: 0 };
        }
        productTotals[row.product_title].quantity += row.quantity;
        productTotals[row.product_title].revenue += lineTotal;

        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (monthKey === currentMonthKey) {
          const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const dayLabel = date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

          if (!dayTotals[dayKey]) {
            dayTotals[dayKey] = { label: dayLabel, total: 0, timestamp: dayStart };
          }
          dayTotals[dayKey].total += lineTotal;
          curMonthRevenue += lineTotal;
        }
      });

      setMonthRevenue(curMonthRevenue);

      const sortedProducts = Object.values(productTotals)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      setTopProducts(sortedProducts);

      const formattedDays = Object.values(dayTotals)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ label, total }) => ({ label, total }));

      setDailySales(formattedDays);

      const { data: stockRows } = await supabase
        .from('variant_color_stock')
        .select(`
          stock,
          product_colors ( color_name ),
          product_variants ( label, products ( title, active ) )
        `)
        .lte('stock', 5)
        .order('stock', { ascending: true });

      const lowStock = (stockRows || [])
        .filter((row: any) => row.product_variants?.products?.active)
        .map((row: any) => ({
          title: row.product_variants?.products?.title || 'Producto',
          label: row.product_variants?.label || '',
          color_name: row.product_colors?.color_name || '',
          stock: row.stock,
        }));
      setLowStockItems(lowStock);

      setLoading(false);
    }

    loadDashboard();
  }, []);

  if (loading) return <p className="text-center py-12 text-ink/60 font-medium">Cargando estadísticas...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Dashboard</h2>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-ink/60 text-xs font-bold">
            <span>Pedidos por Confirmar</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-ink">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-ink">{pendingOrdersCount}</div>
          <span className="text-xs text-ink/60 font-medium">Pendientes de validación</span>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-ink/60 text-xs font-bold">
            <span>Ingresos del Mes</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-ink">{formatCLP(monthRevenue)}</div>
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <TrendingUp size={14} /> Ventas activas
          </div>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-ink/60 text-xs font-bold">
            <span>Productos Activos</span>
            {/* Color brand actualizado */}
            <div className="p-2 rounded-xl bg-pink-50 text-[#C12972]">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-ink">{activeProductsCount}</div>
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-ink/60">
            <ArrowUpRight size={14} /> de {totalProductsCount} totales
          </div>
        </div>
      </div>

      {/* GRÁFICOS Y ALERTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AreaChart: Ingresos Diarios */}
        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-ink">Ingresos Diarios del Mes</h3>
          {dailySales.length === 0 ? (
            <p className="text-center py-12 text-ink/50 text-xs">Aún no hay ventas en este mes.</p>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      {/* Color brand actualizado en gradiente */}
                      <stop offset="5%" stopColor="#C12972" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C12972" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#a8a29e" fontSize={11} tickLine={false} />
                  <YAxis stroke="#a8a29e" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [formatCLP(Number(val)), 'Ingreso']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  {/* Color brand actualizado en Area */}
                  <Area type="monotone" dataKey="total" stroke="#C12972" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* PieChart: Productos Más Vendidos */}
        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-ink">Distribución de Productos Más Vendidos</h3>
          {topProducts.length === 0 ? (
            <p className="text-center py-12 text-ink/50 text-xs">Sin datos de productos.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProducts}
                      dataKey="quantity"
                      nameKey="title"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {topProducts.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`${val} un.`, 'Vendidos']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full sm:w-1/2 space-y-2">
                {topProducts.map((prod, idx) => (
                  <div key={prod.title} className="flex items-start gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink truncate">{prod.title}</p>
                      <p className="text-ink/60">{prod.quantity} un. ({formatCLP(prod.revenue)})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ALERTAS DE STOCK */}
        {lowStockItems.length > 0 && (
          <div className="lg:col-span-2 bg-white border border-ink/10 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-amber-600 flex items-center gap-2">
              <AlertTriangle size={18} /> Alertas de Stock Bajo o Agotado ({lowStockItems.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {lowStockItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-neutral-50 border border-ink/10">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-xs text-ink truncate">{item.title}</p>
                    <p className="text-[11px] text-ink/60 truncate">{item.label} — {item.color_name}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      item.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.stock === 0 ? 'Agotado' : `${item.stock} un.`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}