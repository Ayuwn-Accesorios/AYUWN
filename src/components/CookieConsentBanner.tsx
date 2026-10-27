"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const COOKIE_CONSENT_KEY = "ayuwn_cookie_consent";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Comprobar si el usuario ya aceptó o rechazó las cookies previamente
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-modal-in">
      <div className="bg-white rounded-2xl p-5 shadow-2xl border border-ink/10 flex flex-col gap-4 text-ink">
        <div className="flex items-start gap-3">
          <span className="text-2xl select-none">🍪</span>
          <div className="flex-1 text-xs sm:text-sm text-ink/80 leading-relaxed">
            <p className="font-semibold text-ink text-sm mb-1">Uso de Cookies</p>
            Utilizamos cookies propias para mejorar tu experiencia de navegación y recordar tus preferencias en la tienda. Consulta nuestras{" "}
            <Link
              href="/terminos"
              className="text-brand font-medium hover:underline underline-offset-2"
            >
              Políticas de Privacidad
            </Link>
            .
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDecline}
            className="text-xs"
          >
            Rechazar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAccept}
            className="text-xs"
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}