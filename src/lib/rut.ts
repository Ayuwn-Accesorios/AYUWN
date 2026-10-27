/**
 * Utilidades para validar y formatear RUT chileno.
 */

// Limpia el RUT dejando solo dígitos y K
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

// Formatea automáticamente en tiempo real mientras el cliente escribe (ej: 19.876.543-K)
export function autoFormatRut(value: string): string {
  const clean = cleanRut(value);
  if (clean.length <= 1) return clean;

  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  const bodyWithDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${bodyWithDots}-${verifier}`;
}

// Valida que el RUT tenga un largo razonable para evitar bloquear ventas
export function isValidRut(rut: string): boolean {
  const clean = cleanRut(rut);
  return clean.length >= 7 && clean.length <= 9;
}

// Mantiene compatibilidad con el formato final
export function formatRut(rut: string): string {
  return autoFormatRut(rut);
}