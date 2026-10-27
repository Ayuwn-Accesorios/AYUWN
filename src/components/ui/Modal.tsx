"use client";

import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: ModalProps) {
  // Manejo de la tecla Escape y bloqueo de scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Render en Portal para asegurar jerarquía limpia en el DOM
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Tarjeta Modal Modal-in */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-ink/10 animate-modal-in overflow-hidden ${className}`}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-4">
          {title ? (
            <h2 id="modal-title" className="text-xl font-bold text-ink tracking-tight">
              {title}
            </h2>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Cerrar modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenido principal */}
        <div className="text-ink">{children}</div>
      </div>
    </div>,
    document.body
  );
}