'use client';

import React, { useEffect, useRef, useState } from 'react';
import BrandLogo from '@/components/BrandLogo';

interface HeaderNavProps {
  onSearch?: (query: string) => void;
}

const HIDE_THRESHOLD_PX = 96;

export default function HeaderNav({ onSearch }: HeaderNavProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  const lastScrollY = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickingRef = useRef(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(query);
    }, 350);
  };

  const handleClearSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchQuery('');
    onSearch?.('');
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const scrolledDown = currentScrollY > lastScrollY.current;
          const pastThreshold = currentScrollY > HIDE_THRESHOLD_PX;

          setIsHeaderHidden(() => {
            if (isSearchFocused) return false;
            if (!pastThreshold) return false;
            return scrolledDown;
          });

          lastScrollY.current = currentScrollY;
          tickingRef.current = false;
        });

        tickingRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchFocused]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-ink text-white transition-transform duration-300 ${
        isHeaderHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* LADO IZQUIERDO: Marca / Logo (se oculta en móviles pequeños) */}
        <div
          className="hidden sm:flex items-center cursor-pointer shrink-0 select-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <BrandLogo className="text-white"/>
        </div>

        {/* CENTRO: BARRA DE BÚSQUEDA */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative flex items-center w-full">
            <svg
              className="absolute left-3.5 w-4 h-4 text-white/50 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Buscar productos..."
              className="w-full bg-white/10 text-white placeholder-white/50 text-sm rounded-full pl-10 pr-9 py-2 outline-none border border-white/10 focus:border-brand focus:ring-2 focus:ring-brand transition-all"
              aria-label="Buscar productos"
            />

            {searchQuery && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClearSearch}
                className="absolute right-3 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}