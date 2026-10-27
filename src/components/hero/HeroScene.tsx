'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/siteConfig';
import Typewriter from './Typewriter';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

interface FloatingImage {
  src: string;
  className: string;
}

const HERO_IMAGES: FloatingImage[] = [
  { src: '/images/lazo-aqua.png', className: 'w-24 sm:w-40 md:w-56 top-24 left-3 sm:left-10 md:left-20' },
  { src: '/images/scrunchie-negro.png', className: 'w-20 sm:w-32 md:w-44 top-24 right-3 sm:right-10 md:top-20 md:right-16' },
  { src: '/images/scrunchie-rosa.png', className: 'w-24 sm:w-36 md:w-52 bottom-10 right-3 sm:right-10 md:bottom-14 md:right-20' },
  { src: '/images/lazo-rojo.png', className: 'w-24 sm:w-36 md:w-48 bottom-10 left-3 sm:left-10 md:bottom-14 md:left-16' },
  { src: '/images/lazo-azul.png', className: 'hidden sm:block w-16 md:w-20 top-1/4 left-1/3' },
  { src: '/images/lazo-verde.png', className: 'hidden sm:block w-14 md:w-16 top-1/2 right-1/4' },
  { src: '/images/scrunchie-azul.png', className: 'hidden sm:block w-16 md:w-20 top-3/4 left-1/4' },
];

const goToCatalog = () =>
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });

function Swirls() {
  return (
    <>
      <svg
        className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 text-white/20"
        width="600" height="600" viewBox="0 0 600 600" fill="none" aria-hidden="true"
      >
        <path
          d="M515.266 181.33C377.943 51.564 128.537 136.256 50.8123 293.565C-26.9127 450.874 125.728 600 125.728 600"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        />
      </svg>
      <svg
        className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 text-white/20"
        width="700" height="700" viewBox="0 0 700 700" fill="none" aria-hidden="true"
      >
        <path
          d="M26.8838 528.274C193.934 689.816 480.051 637.218 594.397 451.983C708.742 266.748 543.953 2.22235 543.953 2.22235"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        />
      </svg>
    </>
  );
}

export default function FloatingHero({ images = HERO_IMAGES }: { images?: FloatingImage[] }) {
  return (
    <section className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-brand px-4 py-28">
      <div aria-hidden className="absolute inset-0 z-0">
        <Swirls />
      </div>

      {/* Imágenes decorativas flotando; no bloquean clics */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
        {images.map((img, i) => (
          <div
            key={i}
            className={cn('absolute aspect-square animate-float motion-reduce:animate-none', img.className)}
            style={{ animationDelay: `${i * 300}ms` }}
          >
            <Image
              src={img.src}
              alt=""
              fill
              sizes="(max-width: 768px) 112px, 224px"
              className="object-contain drop-shadow-md"
            />
          </div>
        ))}
      </div>

      <div className="relative z-20 mx-auto flex max-w-2xl flex-col items-center text-center">
        <h1 className="sr-only">
          {siteConfig.name}: {siteConfig.tagline}
        </h1>
        <p className="text-base font-semibold text-white md:text-lg">{siteConfig.tagline}</p>
        <div
          aria-hidden
          className="font-display mt-3 min-h-[1.05em] text-[clamp(3.5rem,13vw,9rem)] leading-none font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(43,16,38,0.25)]"
        >
          <Typewriter words={siteConfig.hero.words} />
        </div>
        <p className="mt-6 max-w-md text-lg leading-8 text-white/90">{siteConfig.description}</p>
        <InteractiveHoverButton text="Ver catálogo" onClick={goToCatalog} className="mt-8 w-44" />
      </div>
    </section>
  );
}