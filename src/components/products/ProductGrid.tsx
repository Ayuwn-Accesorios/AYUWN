'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '@/types/products';
import { useProducts } from '@/lib/useProducts';
import { NewCartItem, useCartStore } from '@/lib/useCartStore';
import ProductCard from '@/components/products/ProductCard';
import ProductModal from '@/components/products/ProductModal';

interface ProductGridProps {
  searchQuery?: string;
  onAddToCart?: (item: NewCartItem) => void;
}

export default function ProductGrid({
  searchQuery = '',
  onAddToCart,
}: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const addToCart = useCartStore((state) => state.addToCart);

  const ITEMS_PER_PAGE = 12;

  const { products, categories, loading, error, totalCount } = useProducts({
    activeCategory,
    searchQuery,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  // Clamp defensivo de la página actual según el totalCount
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalCount, currentPage]);

  // Reinicia la página al cambiar la búsqueda o la categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const goToPage = (page: number) => {
    setCurrentPage(page);
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddToCart = (item: NewCartItem) => {
    if (onAddToCart) {
      onAddToCart(item);
    } else {
      addToCart(item);
    }
  };

  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    const sorted = Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const withEllipsis: (number | 'ellipsis')[] = [];
    sorted.forEach((p, idx) => {
      if (idx > 0 && p - sorted[idx - 1] > 1) withEllipsis.push('ellipsis');
      withEllipsis.push(p);
    });
    return withEllipsis;
  };

  return (
    <section id="catalogo" className="w-full py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado del catálogo alineado a la izquierda */}
        <div className="flex flex-col items-start mb-12">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-8">
            <span className="block text-ink">Pequeños detalles.</span>
            <span className="block text-brand">Grandes protagonistas.</span>
          </h2>

          {/* Filtros de Categoría (Pills) alineados a la izquierda */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-ink text-white shadow-sm'
                      : 'border border-ink/15 text-ink hover:border-brand hover:text-brand bg-white'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mensajes de Estado / Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="w-full aspect-4/5 sm:aspect-square bg-brand/10 rounded-3xl animate-pulse" />
                <div className="h-5 bg-neutral-100 rounded-md w-3/4 animate-pulse" />
                <div className="h-4 bg-neutral-100 rounded-md w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-500 font-medium">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16 text-ink/60 font-medium">
            {searchQuery
              ? `No encontramos productos para "${searchQuery}"`
              : 'No hay productos disponibles.'}
          </div>
        )}

        {/* Grilla de Productos */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index === 0}
                onOpenModal={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16 flex-wrap">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-full border border-ink/15 bg-white text-ink flex items-center justify-center font-bold text-sm transition-all hover:bg-neutral-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              ‹
            </button>

            {getVisiblePages().map((p, idx) =>
              p === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-ink/40 text-sm select-none">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    p === currentPage
                      ? 'bg-brand text-white shadow-sm'
                      : 'border border-ink/15 bg-white text-ink hover:border-brand hover:text-brand'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-full border border-ink/15 bg-white text-ink flex items-center justify-center font-bold text-sm transition-all hover:bg-neutral-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </section>
  );
}