'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Banner {
  id: number;
  message: string;
  type: 'info' | 'alerta';
}

export default function AlertBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchBanner() {
      const { data } = await supabase
        .from('site_banner')
        .select('id, message, type')
        .eq('active', true)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      setBanner(data || null);
    }

    // 1. Hacemos la consulta inicial
    fetchBanner();

    // 2. Nos suscribimos a los cambios en tiempo real
    const channel = supabase
      .channel('banner-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_banner' },
        () => {
          fetchBanner(); // Refrescamos los datos
          setDismissed(false); // Lo volvemos a mostrar si el usuario lo había cerrado
        }
      )
      .subscribe();

    // 3. Limpiamos la suscripción si el componente se desmonta
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!banner || dismissed) return null;

  const isAlert = banner.type === 'alerta';

  return (
    <div
      className={`mt-[60px] w-full py-2.5 px-4 flex items-center justify-between text-xs sm:text-sm font-semibold transition-all border-b ${
        isAlert
          ? 'bg-ink text-white border-ink'
          : 'bg-aqua/30 text-ink border-aqua/40'
      }`}
    >
      <p className="flex-1 text-center pr-2 truncate">{banner.message}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-1 rounded-md hover:bg-black/10 transition-colors shrink-0 text-current cursor-pointer"
        aria-label="Cerrar aviso"
      >
        ✕
      </button>
    </div>
  );
}