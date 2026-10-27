import Image from 'next/image';
import { siteConfig } from '@/config/siteConfig';

const PUFFS = 12;

// Placeholder: un cole dibujado en SVG. Se reemplaza solo cuando
// siteConfig.hero.image tenga una ruta.
function ScrunchiePlaceholder() {
  const puffs = Array.from({ length: PUFFS }, (_, i) => {
    const angle = (i * 360) / PUFFS;
    const rad = (angle * Math.PI) / 180;
    return {
      key: i,
      cx: Number((200 + 118 * Math.cos(rad)).toFixed(1)),
      cy: Number((200 + 118 * Math.sin(rad)).toFixed(1)),
      rotation: angle + 90,
    };
  });

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={siteConfig.hero.imageAlt}
      className="size-full drop-shadow-[0_30px_40px_rgba(30,16,51,0.45)]"
    >
      {puffs.map((p) => (
        <g key={p.key} transform={`rotate(${p.rotation} ${p.cx} ${p.cy})`}>
          <ellipse
            cx={p.cx}
            cy={p.cy}
            rx="58"
            ry="36"
            strokeWidth="5"
            className="fill-white stroke-ink"
          />
          <path
            d={`M${p.cx - 34} ${p.cy} Q${p.cx} ${p.cy - 14} ${p.cx + 34} ${p.cy}`}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-ink/25"
          />
        </g>
      ))}
    </svg>
  );
}

export default function HeroImage() {
  const src = siteConfig.hero.image;

  return (
    <div className="relative aspect-square w-full">
      {src ? (
        <Image
          src={src}
          alt={siteConfig.hero.imageAlt}
          fill
          priority
          sizes="(max-width: 768px) 76vw, 544px"
          className="object-contain drop-shadow-[0_30px_40px_rgba(30,16,51,0.45)]"
        />
      ) : (
        <ScrunchiePlaceholder />
      )}
    </div>
  );
}