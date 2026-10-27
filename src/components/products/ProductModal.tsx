'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatCLP } from '@/lib/format';
import { Product, ProductColor, ProductVariant } from '@/types/products';
import { useCartStore, NewCartItem } from '@/lib/useCartStore';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { toast } from '@/components/ui/Toaster'; // Importamos la función global del Toast

function stockFor(variant: ProductVariant | undefined, colorId: number | undefined) {
  if (!variant || colorId == null) return 0;
  return variant.stocks.find((s) => s.color_id === colorId)?.stock ?? 0;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: NewCartItem) => void;
}

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number>(
    product.variants[0]?.id || 0
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({}); // key: `${variantId}-${colorId}`

  const cart = useCartStore((s) => s.cart);

  // Bloquear el scroll del body al abrir el modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const alreadyInCart = (variantId: number, colorId: number) => {
    const compositeId = `${variantId}-${colorId}`;
    return cart.find((c) => c.id === compositeId)?.quantity ?? 0;
  };

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.img_url
      ? [product.img_url]
      : [];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length]);

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const handleQuantityChange = (colorId: number, qty: number, maxStock: number) => {
    if (!currentVariant) return;
    const key = `${currentVariant.id}-${colorId}`;
    const validQty = Math.max(0, Math.min(qty, maxStock));
    setQuantities((prev) => ({ ...prev, [key]: validQty }));
  };

  const priceForVariant = (variant: ProductVariant) => {
    const disc = variant.discount_percent || 0;
    return disc > 0 ? variant.price * (1 - disc / 100) : variant.price;
  };

  const handleAddAll = () => {
    Object.entries(quantities).forEach(([key, qty]) => {
      if (qty <= 0) return;
      const [variantIdStr, colorIdStr] = key.split('-');
      const variant = product.variants.find((v) => v.id === parseInt(variantIdStr, 10));
      const colorObj = product.colors.find((c) => c.id === parseInt(colorIdStr, 10));
      if (!variant || !colorObj) return;

      onAddToCart({
        product_id: product.id,
        product_title: product.title,
        variant_id: variant.id,
        color_id: colorObj.id,
        selected_label: variant.label,
        selected_color: colorObj.color_name,
        unit_price: priceForVariant(variant),
        quantity: qty,
        img_url: product.img_url,
        max_stock: stockFor(variant, colorObj.id),
      });

      // Disparamos el toast con gravedad
      toast({
        severity: "info",
        title: "Agregado al carrito",
        message: `${qty}x ${product.title} (${variant.label} - ${colorObj.color_name})`,
      });
    });
    setQuantities({});
    onClose();
  };

  const totalSelectedCount = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-ink/10 hover:bg-ink/20 text-ink flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Imágenes de producto */}
          {images.length > 0 && (
            <div className="relative w-full aspect-video bg-neutral-100 rounded-xl overflow-hidden">
              <Image
                src={images[activeImageIndex] || product.img_url || ''}
                alt={product.title}
                fill
                className="object-cover transition-all duration-300"
              />
            </div>
          )}

          {/* Información principal */}
          <div>
            <span className="text-xs uppercase tracking-wider text-ink/50 font-semibold">
              {product.category_name || 'Sin categoría'}
            </span>
            <h2 className="text-xl font-bold text-ink mt-0.5">{product.title}</h2>
            {product.description && (
              <p className="text-sm text-ink/70 mt-2 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Selector de Label / Variante */}
          <div>
            <label className="text-sm font-bold text-ink block mb-2">
              Selecciona la opción:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                const finalPrice = priceForVariant(v);

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand bg-brand/10 text-brand ring-1 ring-brand'
                        : 'border-ink/15 bg-white text-ink hover:border-ink/30'
                    }`}
                  >
                    <span>{v.label} · </span>
                    <span>{formatCLP(finalPrice)}</span>
                    {v.discount_percent > 0 && (
                      <span className="ml-1 text-xs text-brand font-bold">
                        (-{v.discount_percent}%)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Colores y Cantidades */}
          <div>
            <label className="text-sm font-bold text-ink block mb-2">
              Elige el color y cantidad:
            </label>
            <div className="space-y-2">
              {product.colors.map((c) => {
                const maxStock = stockFor(currentVariant, c.id);
                const inCart = currentVariant ? alreadyInCart(currentVariant.id, c.id) : 0;
                const remainingRoom = Math.max(0, maxStock - inCart);
                const currentQty = currentVariant
                  ? quantities[`${currentVariant.id}-${c.id}`] || 0
                  : 0;
                const isOutOfStock = remainingRoom <= 0;

                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      currentQty > 0
                        ? 'border-brand bg-brand/5'
                        : isOutOfStock
                        ? 'border-ink/10 bg-neutral-100 opacity-60'
                        : 'border-ink/10 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-sm text-ink block">
                        {c.color_name}
                      </span>
                      <span className="text-xs text-ink/50">
                        {!isOutOfStock
                          ? `Disponible: ${remainingRoom}${
                              inCart > 0 ? ` (${inCart} en carrito)` : ''
                            }`
                          : 'Agotado'}
                      </span>
                    </div>

                    {isOutOfStock ? (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-md">
                        Agotado
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={currentQty <= 0}
                          onClick={() =>
                            handleQuantityChange(c.id, currentQty - 1, remainingRoom)
                          }
                          className="w-7 h-7 rounded-lg border border-ink/20 bg-white text-ink font-bold flex items-center justify-center hover:bg-neutral-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={remainingRoom}
                          value={currentQty}
                          onChange={(e) =>
                            handleQuantityChange(
                              c.id,
                              parseInt(e.target.value, 10) || 0,
                              remainingRoom
                            )
                          }
                          className="w-10 text-center text-sm font-semibold border border-ink/20 rounded-lg py-0.5 outline-none focus:border-brand text-ink"
                        />
                        <button
                          type="button"
                          disabled={currentQty >= remainingRoom}
                          onClick={() =>
                            handleQuantityChange(c.id, currentQty + 1, remainingRoom)
                          }
                          className="w-7 h-7 rounded-lg border border-ink/20 bg-white text-ink font-bold flex items-center justify-center hover:bg-neutral-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer del Modal con Total y Botón */}
        <div className="p-4 border-t border-ink/10 bg-neutral-50 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-ink/50 block">Precio unitario</span>
            <span className="text-lg font-bold text-ink">
              {formatCLP(currentVariant ? priceForVariant(currentVariant) : 0)}
            </span>
          </div>

          <div className="w-64 flex-shrink-0">
            <InteractiveHoverButton
              text={`Agregar al carrito (${totalSelectedCount})`}
              onClick={handleAddAll}
              disabled={totalSelectedCount <= 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}