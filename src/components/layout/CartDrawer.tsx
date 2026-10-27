'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCLP } from '@/lib/format';
import { useCartStore } from '@/lib/useCartStore';
import { useIsHydrated } from '@/lib/useIsHydrated';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

interface CartDrawerProps {
  lastAddedProduct?: string | null;
}

const REMOVE_ANIMATION_MS = 220;
const TOAST_EXIT_MS = 220;

export default function CartDrawer({ lastAddedProduct }: CartDrawerProps) {
  const router = useRouter();
  const isHydrated = useIsHydrated();

  const storeCart = useCartStore((state) => state.cart);
  const storeItemCount = useCartStore((state) => state.itemCount());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const cartItems = isHydrated ? storeCart : [];
  const itemCount = isHydrated ? storeItemCount : 0;

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [displayedProduct, setDisplayedProduct] = useState<string | null>(null);
  const [isToastLeaving, setIsToastLeaving] = useState(false);

  useEffect(() => {
    if (lastAddedProduct) {
      setDisplayedProduct(lastAddedProduct);
      setIsToastLeaving(false);
    } else if (displayedProduct) {
      setIsToastLeaving(true);
      const timer = setTimeout(() => {
        setDisplayedProduct(null);
        setIsToastLeaving(false);
      }, TOAST_EXIT_MS);
      return () => clearTimeout(timer);
    }
  }, [lastAddedProduct, displayedProduct]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);

  const handleRemoveClick = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      removeItem(id);
      setRemovingId(null);
    }, REMOVE_ANIMATION_MS);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToCheckout = () => {
    setIsCartOpen(false);
    router.push('/pedidos');
  };

  return (
    <>
      {/* 1. Logo Flotante Abajo-Izquierda */}
      <button
        onClick={scrollToTop}
        aria-label="Ir al inicio"
        className="fixed bottom-5 left-5 z-40 w-16 h-16 rounded-full bg-white shadow-lg border border-ink/10 flex items-center justify-center p-0 overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-transform"
      >
        <Image
          src="/images/logo/logo.png"
          alt="Inicio"
          width={62}
          height={62}
          className="object-contain"
        />
      </button>

      {/* 2. Botón Carrito Flotante Abajo-Derecha */}
      <button
        onClick={() => setIsCartOpen(true)}
        aria-label="Ver Carrito"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-brand text-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        {itemCount > 0 && (
          <span
            key={itemCount}
            className="absolute -top-1 -right-1 bg-ink text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce-short"
          >
            {itemCount}
          </span>
        )}
      </button>

      {/* Overlay Sombra */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Panel Desplegable del Carrito */}
      <aside
        className={`fixed top-0 right-0 z-50 w-full max-w-md h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header del Carrito */}
        <div className="p-4 border-b border-ink/10 flex items-center justify-between bg-neutral-50">
          <h3 className="text-lg font-bold text-ink">Tu Carrito ({itemCount})</h3>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-ink/10 hover:bg-ink/20 text-ink font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-ink/50 space-y-2 py-12">
              <span className="text-4xl">🌸</span>
              <p className="text-sm font-medium">Tu carrito está vacío por ahora.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border border-ink/10 bg-white transition-all duration-200 ${
                  removingId === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                {item.img_url && (
                  <Image
                    src={item.img_url}
                    alt={item.product_title}
                    width={56}
                    height={56}
                    className="rounded-lg object-cover bg-neutral-100 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-ink truncate">{item.product_title}</h4>

                  {(item.selected_label || item.selected_color) && (
                    <p className="text-xs text-ink/60 truncate">
                      {[item.selected_label, item.selected_color].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  <p className="text-xs font-semibold text-brand mt-0.5">
                    {formatCLP(item.unit_price)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-md border border-ink/20 text-ink text-xs font-bold flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
                      aria-label="Restar uno"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-ink w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-md border border-ink/20 text-ink text-xs font-bold flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
                      aria-label="Sumar uno"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveClick(item.id)}
                  title="Eliminar producto"
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-xs font-bold cursor-pointer"
                  aria-label="Eliminar producto"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Resumen de Compra y Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-ink/10 bg-neutral-50 space-y-3">
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-ink/70">
                  <span className="truncate pr-2">
                    {item.product_title}
                    {item.quantity > 1 && <span className="font-bold text-ink"> ×{item.quantity}</span>}
                  </span>
                  <span className="font-semibold shrink-0">
                    {formatCLP(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <hr className="border-ink/10" />

            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <span>Total</span>
              <span className="text-lg text-brand">{formatCLP(subtotal)}</span>
            </div>

            <InteractiveHoverButton
              text="Ir a Pagar"
              onClick={handleGoToCheckout}
              className="w-full"
            />
          </div>
        )}
      </aside>

      {/* Toast Flotante */}
      {displayedProduct && !isCartOpen && (
        <div
          className={`fixed bottom-24 right-5 z-40 bg-white border border-ink/10 rounded-2xl p-3 shadow-xl flex items-center gap-3 transition-all duration-200 ${
            isToastLeaving ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <span className="text-xl">🌸</span>
          <div>
            <p className="text-xs font-bold text-ink">Agregado a tu selección</p>
            <p className="text-xs text-ink/60 truncate max-w-45">{displayedProduct}</p>
          </div>
        </div>
      )}
    </>
  );
}