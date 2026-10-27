'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { formatCLP } from '@/lib/format';
import { Product } from '@/types/products';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
  priority?: boolean;
}

export default function ProductCard({
  product,
  onOpenModal,
  priority = false,
}: ProductCardProps) {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.img_url
      ? [product.img_url]
      : [];

  const mainImage = images[0];

  const totalStock = product.variants.reduce(
    (sum, v) => sum + v.stocks.reduce((s, e) => s + e.stock, 0),
    0
  );
  const isOutOfStock = totalStock <= 0;

  // Lógica de variantes, precios y descuento
  const cheapestVariant =
    product.variants.length > 0
      ? product.variants.reduce((prev, curr) => {
          const prevFinal =
            prev.discount_percent > 0
              ? prev.price * (1 - prev.discount_percent / 100)
              : prev.price;
          const currFinal =
            curr.discount_percent > 0
              ? curr.price * (1 - curr.discount_percent / 100)
              : curr.price;
          return currFinal < prevFinal ? curr : prev;
        })
      : null;

  const finalPrice = cheapestVariant
    ? cheapestVariant.discount_percent > 0
      ? cheapestVariant.price * (1 - cheapestVariant.discount_percent / 100)
      : cheapestVariant.price
    : 0;

  const originalPrice = cheapestVariant ? cheapestVariant.price : 0;
  const hasDiscount = cheapestVariant ? cheapestVariant.discount_percent > 0 : false;

  // Conteo de colores / variantes actualizado para usar la interfaz 'colors'
  const colorsCount = product.colors?.length || 0;
  const variantsCount = product.variants?.length || 0;
  
  const colorLabel =
    colorsCount === 1
      ? product.colors[0].color_name
      : colorsCount > 1
      ? `${colorsCount} colores`
      : variantsCount === 1
      ? '1 opción'
      : `${variantsCount} opciones`;

  // Badge a mostrar en la esquina superior izquierda
  const badgeText = product.badge
    ? product.badge
    : product.is_new
    ? 'Novedad'
    : null;

  return (
    <article
      className={`group flex flex-col ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onOpenModal(product)}
        aria-label={product.title}
        className="relative w-full aspect-[4/5] sm:aspect-square bg-brand/10 rounded-3xl overflow-hidden text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 ring-brand block"
      >
        {/* Esquina superior izquierda: Etiqueta / Badge */}
        {badgeText && !isOutOfStock && (
          <span className="absolute top-5 left-5 z-10 text-xs font-semibold uppercase tracking-widest text-ink bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow-xs">
            {badgeText}
          </span>
        )}

        {/* Agotado: Esquina superior derecha */}
        {isOutOfStock && (
          <span className="absolute top-5 right-5 z-10 bg-ink text-white rounded-full px-2.5 py-1 text-xs font-medium">
            Agotado
          </span>
        )}

        {/* Imagen principal */}
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.title}
            fill
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/40 text-xs">
            Sin imagen
          </div>
        )}

        {/* Esquina inferior: "Mírala de cerca" y Flecha (si no está agotado) */}
        {!isOutOfStock && (
          <div className="absolute bottom-5 left-5 right-5 flex justify-between items-center z-10 pointer-events-none">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow-xs opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-300">
              Mírala de cerca
            </span>
            <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-ink shadow-xs opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight size={20} />
            </div>
          </div>
        )}
      </button>

      {/* Debajo de la imagen: Título y Precios */}
      <div className="mt-4 flex flex-col gap-1">
        <div className="flex justify-between items-baseline gap-2">
          <h3 className="text-lg font-semibold text-ink line-clamp-1 flex-1">
            {product.title}
          </h3>
          <div className="text-sm text-ink/70 flex items-baseline gap-1.5 shrink-0">
            {hasDiscount && (
              <span className="text-ink/40 line-through text-xs">
                {formatCLP(originalPrice)}
              </span>
            )}
            <span>Desde {formatCLP(finalPrice)}</span>
          </div>
        </div>

        {/* Segunda línea pequeña */}
        <span className="text-xs text-ink/50">{colorLabel}</span>
      </div>
    </article>
  );
}