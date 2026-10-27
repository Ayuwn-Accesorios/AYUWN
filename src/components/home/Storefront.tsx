'use client';

import { useCallback, useState } from 'react';
import HeaderNav from '@/components/layout/HeaderNav';
import FloatingHero from '@/components/hero/HeroScene';
import ProductGrid from '@/components/products/ProductGrid';
import CartDrawer from '@/components/layout/CartDrawer';
import ReviewsSection from '@/components/review/ReviewsSection';

// Este componente existe para guardar el texto de búsqueda y pasárselo
// al header (que lo escribe) y a la grilla (que lo usa para filtrar).
export default function Storefront() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      document
        .getElementById('catalogo')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      <HeaderNav onSearch={handleSearch} />
      <FloatingHero />
      <ProductGrid searchQuery={searchQuery} />
      <ReviewsSection />
      <CartDrawer />
    </>
  );
}