"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { siteConfig } from "@/config/siteConfig";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "Tu correo aún no está confirmado. Confírmalo en Supabase (Authentication → Users).";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
  if (m.includes("fetch") || m.includes("network"))
    return "No hay conexión con el servidor. Revisa tu internet.";
  return "No se pudo iniciar sesión. Intenta de nuevo.";
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fail = (msg: string) => {
    setError(msg);
    setLoading(false);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) return fail(friendlyError(authError.message));

      const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
      if (rpcError) {
        await supabase.auth.signOut();
        return fail("No se pudo verificar tu permiso de administrador.");
      }
      if (!isAdmin) {
        await supabase.auth.signOut();
        return fail("Este usuario no tiene permisos de administrador.");
      }

      setLoading(false);
      setDone(true);
      // Navegación completa: evita la redirección cacheada del router de Next.
      window.location.assign("/admin");
    } catch {
      fail("Ocurrió un error inesperado. Intenta de nuevo.");
    }
  }

  return (
    <form
      className="w-full max-w-sm flex flex-col gap-5 rounded-3xl border border-ink/10 bg-white p-8 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-1 mb-2 text-center">
        <h2 className="text-2xl font-bold text-ink">Bienvenido</h2>
        <p className="text-sm text-ink/60">Acceso al panel de {siteConfig.name}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-ink" htmlFor="email">
          Correo electrónico
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || done}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-ink" htmlFor="password">
          Contraseña
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || done}
          required
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600"
        >
          {error}
        </p>
      )}

      <Button className="w-full mt-2" type="submit" isLoading={loading} disabled={done}>
        {done ? "¡Conectado!" : loading ? "Iniciando sesión…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}