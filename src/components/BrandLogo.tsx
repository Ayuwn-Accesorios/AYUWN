import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Ajustamos las dimensiones para un logo rectangular (wordmark)
const LOGO_HEIGHT = {
  sm: 24,
  md: 32,
  lg: 40,
} as const;

const LOGO_WIDTH = {
  sm: 90,
  md: 120,
  lg: 150,
} as const;

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center select-none transition-opacity hover:opacity-90 ${className}`}
    >
      <Image
        src="/logo-ayuwn.png" // Reemplaza esto con el nombre de archivo exacto en tu carpeta public
        alt="Ayüwn"
        width={LOGO_WIDTH[size]}
        height={LOGO_HEIGHT[size]}
        className="object-contain transition-transform group-hover:scale-105"
        priority
      />
    </Link>
  );
}