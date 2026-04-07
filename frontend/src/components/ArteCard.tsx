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

/* Martial art SVG icons – inline, monochrome red */
function ArteIcon({ nombre }: { nombre: string }) {
  const n = nombre.toLowerCase();

  // Muay Thai / Kickboxing / Boxeo — boxing gloves
  if (n.includes('muay') || n.includes('boxeo') || n.includes('boxing') || n.includes('kickbox')) {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        {/* Left glove */}
        <rect x="6" y="18" width="16" height="20" rx="8" stroke="#c41e1e" strokeWidth="1.8"/>
        <rect x="10" y="14" width="8" height="10" rx="4" stroke="#c41e1e" strokeWidth="1.8"/>
        <line x1="6" y1="28" x2="22" y2="28" stroke="#c41e1e" strokeWidth="1.2" opacity="0.6"/>
        {/* Right glove */}
        <rect x="30" y="18" width="16" height="20" rx="8" stroke="#c41e1e" strokeWidth="1.8"/>
        <rect x="34" y="14" width="8" height="10" rx="4" stroke="#c41e1e" strokeWidth="1.8"/>
        <line x1="30" y1="28" x2="46" y2="28" stroke="#c41e1e" strokeWidth="1.2" opacity="0.6"/>
        {/* Impact spark */}
        <line x1="22" y1="22" x2="30" y2="22" stroke="#d4a017" strokeWidth="1.5" strokeDasharray="2 2"/>
      </svg>
    );
  }

  // BJJ / Jiu-Jitsu — ground guard silhouette
  if (n.includes('jiu') || n.includes('bjj') || n.includes('gracie')) {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        {/* Top figure (guard position) */}
        <circle cx="26" cy="10" r="5" stroke="#c41e1e" strokeWidth="1.8"/>
        <path d="M 20 16 C 16 20 14 26 16 32 C 18 36 22 38 26 38 C 30 38 34 36 36 32 C 38 26 36 20 32 16" stroke="#c41e1e" strokeWidth="1.8" fill="none"/>
        {/* Legs in guard */}
        <path d="M 14 30 C 10 34 12 42 18 42" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M 38 30 C 42 34 40 42 34 42" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Bottom figure */}
        <path d="M 16 34 C 14 40 16 46 22 46 L 30 46 C 36 46 38 40 36 34" stroke="#c41e1e" strokeWidth="1.5" fill="none" opacity="0.7"/>
      </svg>
    );
  }

  // Judo — two figures throwing
  if (n.includes('judo') || n.includes('sambo')) {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        {/* Figure 1 — throwing */}
        <circle cx="16" cy="10" r="4" stroke="#c41e1e" strokeWidth="1.8"/>
        <path d="M 16 14 L 14 22 L 10 30" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="14" y1="18" x2="24" y2="22" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Figure 2 — being thrown (airborne) */}
        <circle cx="36" cy="20" r="4" stroke="#c41e1e" strokeWidth="1.8"/>
        <path d="M 30 22 C 28 26 30 34 34 38" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="30" y1="28" x2="40" y2="24" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Ground line */}
        <line x1="8" y1="42" x2="44" y2="42" stroke="#c41e1e" strokeWidth="1.2" opacity="0.5"/>
      </svg>
    );
  }

  // Karate / Taekwondo / Kempo — punch/kick
  if (n.includes('karate') || n.includes('taekwondo') || n.includes('kempo') || n.includes('kung')) {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        {/* Figure in karate stance */}
        <circle cx="26" cy="8" r="5" stroke="#c41e1e" strokeWidth="1.8"/>
        {/* Torso */}
        <path d="M 26 13 L 26 28" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Punching arm */}
        <path d="M 26 18 L 44 16" stroke="#c41e1e" strokeWidth="2" strokeLinecap="round"/>
        {/* Impact fist */}
        <rect x="42" y="13" width="7" height="7" rx="0" stroke="#c41e1e" strokeWidth="1.5"/>
        {/* Impact lines */}
        <line x1="49" y1="14" x2="52" y2="11" stroke="#d4a017" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="49" y1="17" x2="52" y2="17" stroke="#d4a017" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="49" y1="20" x2="52" y2="23" stroke="#d4a017" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Back arm */}
        <path d="M 26 18 L 12 22" stroke="#c41e1e" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        {/* Legs in fighting stance */}
        <path d="M 26 28 L 18 42" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M 26 28 L 34 40" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  }

  // Wrestling / Lucha libre — two figures grappling
  if (n.includes('lucha') || n.includes('wrestling') || n.includes('grappling')) {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="16" cy="10" r="4" stroke="#c41e1e" strokeWidth="1.8"/>
        <circle cx="36" cy="10" r="4" stroke="#c41e1e" strokeWidth="1.8"/>
        <path d="M 16 14 C 18 20 24 24 26 24 C 28 24 34 20 36 14" stroke="#c41e1e" strokeWidth="1.8" fill="none"/>
        <path d="M 16 28 C 18 34 20 40 22 44 L 30 44 C 32 40 34 34 36 28" stroke="#c41e1e" strokeWidth="1.8" fill="none"/>
        <line x1="16" y1="20" x2="36" y2="20" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  }

  // MMA — mixed: glove + leg
  if (n.includes('mma') || n.includes('mixed') || n.includes('artes marciales mixtas')) {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="8" r="5" stroke="#c41e1e" strokeWidth="1.8"/>
        <path d="M 26 13 L 26 26" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Punch */}
        <path d="M 26 18 L 40 14" stroke="#c41e1e" strokeWidth="2" strokeLinecap="round"/>
        <rect x="38" y="11" width="7" height="7" rx="4" stroke="#c41e1e" strokeWidth="1.5"/>
        {/* Kick */}
        <path d="M 26 26 L 20 40 L 12 44" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M 26 26 L 32 38" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Impact */}
        <circle cx="10" cy="44" r="3" stroke="#d4a017" strokeWidth="1.2"/>
      </svg>
    );
  }

  // Krav Maga / self-defense
  if (n.includes('krav') || n.includes('defensa')) {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="8" r="5" stroke="#c41e1e" strokeWidth="1.8"/>
        <path d="M 22 13 L 18 30 L 22 44" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M 30 13 L 34 30 L 30 44" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Shield block */}
        <path d="M 20 20 L 10 16 L 10 28 L 20 26 Z" stroke="#c41e1e" strokeWidth="1.5" fill="none"/>
        <path d="M 32 20 L 42 18 L 44 30 L 32 26 Z" stroke="#c41e1e" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }

  // Default — stylized figure in fighting stance
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="9" r="5" stroke="#c41e1e" strokeWidth="1.8"/>
      <path d="M 26 14 L 26 30" stroke="#c41e1e" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 26 20 L 14 16 M 26 20 L 38 14" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M 26 30 L 18 44 M 26 30 L 34 44" stroke="#c41e1e" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Belt line */}
      <line x1="20" y1="26" x2="32" y2="26" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
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
          <div className="flex h-full items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
            <ArteIcon nombre={arte.nombre} />
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
