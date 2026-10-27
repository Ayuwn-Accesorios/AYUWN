import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa tu archivo .env.local'
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as any).supabase = supabase;
}