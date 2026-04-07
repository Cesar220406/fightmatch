import Link from 'next/link';
import type { ArteMarcial } from '@/types';

/* Asanoha corner ornament */
function CornerPattern() {
  return (
    <svg
      width="36" height="36" viewBox="0 0 36 36" fill="none"
      className="absolute top-0 right-0 pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.08 }}
    >
      <line x1="18" y1="0"  x2="18" y2="36" stroke="#d4a017" strokeWidth="0.8"/>
      <line x1="0"  y1="18" x2="36" y2="18" stroke="#d4a017" strokeWidth="0.8"/>
      <line x1="0"  y1="0"  x2="36" y2="36" stroke="#d4a017" strokeWidth="0.8"/>
      <line x1="36" y1="0"  x2="0"  y2="36" stroke="#d4a017" strokeWidth="0.8"/>
      <circle cx="18" cy="18" r="8"  stroke="#d4a017" strokeWidth="0.8" fill="none"/>
      <circle cx="18" cy="18" r="14" stroke="#d4a017" strokeWidth="0.8" fill="none"/>
      <polygon points="18,4 32,18 18,32 4,18" stroke="#d4a017" strokeWidth="0.8" fill="none"/>
    </svg>
  );
}

const arteEmojis: Record<string, string> = {
  'bjj':        '🥋',
  'jiu':        '🥋',
  'judo':       '🥋',
  'karate':     '🥋',
  'taekwondo':  '🦵',
  'tai chi':    '☯️',
  'tai-chi':    '☯️',
  'yoga':       '🧘',
  'boxeo':      '🥊',
  'boxing':     '🥊',
  'muay':       '🥊',
  'kickbox':    '🥊',
  'sambo':      '🥋',
  'krav':       '🥊',
  'wrestling':  '🥋',
  'lucha':      '🥋',
  'mma':        '🥊',
};

function getEmoji(nombre: string): string {
  const n = nombre.toLowerCase();
  for (const [key, emoji] of Object.entries(arteEmojis)) {
    if (n.includes(key)) return emoji;
  }
  return '🥋';
}

export default function ArteCard({ arte }: { arte: ArteMarcial }) {
  return (
    <Link
      href={`/artes-marciales/${arte.slug}`}
      className="card group flex flex-col gap-3 relative overflow-hidden"
    >
      <CornerPattern />

      <div className="aspect-video w-full overflow-hidden bg-[#111111]">
        {arte.imagen_url ? (
          <img
            src={arte.imagen_url}
            alt={arte.nombre}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center" style={{ fontSize: 48 }}>
            {getEmoji(arte.nombre)}
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-[#f0f0f0] group-hover:text-[#d4a017] transition-colors">
          {arte.nombre}
        </h3>
        {arte.descripcion && (
          <p className="mt-1.5 text-sm text-[#888888] line-clamp-2 leading-relaxed">{arte.descripcion}</p>
        )}
      </div>

      {arte.impacto_fisico && (
        <p className="text-xs text-[#666666] border-t border-[#2a2a2a] pt-2.5 line-clamp-1">
          {arte.impacto_fisico}
        </p>
      )}
    </Link>
  );
}
