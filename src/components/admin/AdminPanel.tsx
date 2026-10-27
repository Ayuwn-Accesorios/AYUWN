'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Megaphone,
  LogOut,
  UploadCloud,
  Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { siteConfig } from '@/config/siteConfig';
import Dashboard from '@/components/admin/Dashboard';
import OrdersManager from '@/components/admin/OrdersManager';
import ProductsManager from '@/components/admin/ProductsManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import BannerManager from '@/components/admin/BannerManager';
import BulkUpload from '@/components/admin/BulkUpload';
import ReviewsManager from '@/components/admin/ReviewsManager';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'categorias', label: 'Categorías', icon: Tags },
  { id: 'importar', label: 'Carga Masiva', icon: UploadCloud },
  { id: 'resenas', label: 'Reseñas', icon: Star },
  { id: 'banner', label: 'Banner', icon: Megaphone },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminPanel() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.assign('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-ink/10 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-black">
              {siteConfig.name}
              <span className="text-brand">.</span>
            </span>
            <span className="text-xs text-white/60">Panel</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Ver tienda
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20 disabled:opacity-50"
            >
              <LogOut size={14} />
              {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <nav aria-label="Secciones del panel" className="-mx-4 overflow-x-auto px-4">
          <div className="flex w-max gap-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id ? 'page' : undefined}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  tab === id
                    ? 'bg-ink text-white shadow-sm'
                    : 'border border-ink/15 bg-white text-ink/70 hover:border-ink/30'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <main>
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'pedidos' && <OrdersManager />}
          {tab === 'productos' && <ProductsManager />}
          {tab === 'categorias' && <CategoriesManager />}
          {tab === 'importar' && <BulkUpload />}
          {tab === 'resenas' && <ReviewsManager />}
          {tab === 'banner' && <BannerManager />}
        </main>
      </div>
    </div>
  );
}