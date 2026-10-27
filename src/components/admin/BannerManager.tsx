'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Banner {
  id: number;
  message: string;
  type: 'info' | 'alerta';
  active: boolean;
}

export default function BannerManager() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'alerta'>('info');
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchBanner = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_banner')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setBanner(data);
      setMessage(data.message);
      setType(data.type);
      setActive(data.active);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const payload = { message: message.trim(), type, active };

    if (banner) {
      await supabase.from('site_banner').update(payload).eq('id', banner.id);
    } else {
      const { data } = await supabase.from('site_banner').insert(payload).select().maybeSingle();
      if (data) setBanner(data);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <p className="text-center py-12 text-ink/60 font-medium">Cargando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Banner de Alerta</h2>
      </div>

      <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm max-w-md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Mensaje</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej: Envíos gratis por compras sobre $30.000 esta semana"
              required
              className="w-full bg-neutral-50 border border-ink/15 rounded-xl px-3.5 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'info' | 'alerta')}
              className="w-full bg-neutral-50 border border-ink/15 rounded-xl px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
            >
              <option value="info font-semibold">Información (marca/suave)</option>
              <option value="alerta font-semibold">Alerta (destacado dark)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-brand"
            />
            Mostrar banner en la tienda
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-6 rounded-xl bg-brand text-white font-bold text-sm shadow-sm hover:bg-brand/90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar banner'}
          </button>
        </form>
      </div>
    </div>
  );
}