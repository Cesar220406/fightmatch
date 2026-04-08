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

/* SVG icons for each martial art archetype */
function IconPunch() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      {/* Glove */}
      <path d="M 12 38 C 8 35 6 28 10 22 C 13 17 20 16 26 18 L 52 18 C 55 18 57 20 57 23 C 57 26 55 28 52 28 L 48 28 C 50 28 52 30 52 33 C 52 36 50 38 47 38 L 43 38 C 45 38 46 40 46 42.5 C 46 45 44 47 42 47 L 36 47 C 35 49 32 50 29 49 L 20 46 C 16 45 13 42 12 38 Z" fill="#c41e1e" stroke="#d4a017" strokeWidth="1.5"/>
      {/* Knuckle lines */}
      <line x1="34" y1="18" x2="34" y2="28" stroke="#d4a017" strokeWidth="1.2" opacity="0.7"/>
      <line x1="40" y1="18" x2="40" y2="28" stroke="#d4a017" strokeWidth="1.2" opacity="0.7"/>
      <line x1="46" y1="18" x2="46" y2="28" stroke="#d4a017" strokeWidth="1.2" opacity="0.7"/>
      {/* Wrist strap */}
      <rect x="12" y="42" width="16" height="5" rx="0" fill="#d4a017" opacity="0.8"/>
      {/* Speed lines */}
      <path d="M 6 20 L 2 18" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 5 26 L 1 26" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 6 32 L 2 34" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconGrapple() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      {/* Two figures grappling — silhouette style */}
      {/* Figure A */}
      <circle cx="20" cy="14" r="5" fill="#d4a017"/>
      <path d="M 20 19 C 20 19 16 28 14 34 C 12 40 18 42 22 38 L 26 32 C 28 36 30 40 34 42 C 36 43 40 40 38 36 L 32 22 C 30 18 24 18 20 19 Z" fill="#d4a017"/>
      {/* Figure B */}
      <circle cx="44" cy="14" r="5" fill="#c41e1e"/>
      <path d="M 44 19 C 44 19 48 28 50 34 C 52 40 46 42 42 38 L 38 32 C 36 36 34 40 30 42 C 28 43 24 40 26 36 L 32 22 C 34 18 40 18 44 19 Z" fill="#c41e1e"/>
      {/* Belt */}
      <path d="M 22 28 C 28 25 36 25 42 28" stroke="#d4a017" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Ground line */}
      <line x1="8" y1="52" x2="56" y2="52" stroke="#d4a017" strokeWidth="1" opacity="0.4"/>
    </svg>
  );
}

function IconKick() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      {/* Kicking figure silhouette */}
      <circle cx="22" cy="10" r="5.5" fill="#d4a017"/>
      {/* Torso */}
      <path d="M 22 15.5 C 22 15.5 18 26 17 32 C 16 38 20 40 24 38 L 25 32 L 22 15.5 Z" fill="#d4a017"/>
      {/* Raised kicking leg */}
      <path d="M 22 22 C 28 20 36 22 42 20 C 48 18 50 14 52 10" stroke="#d4a017" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Foot */}
      <ellipse cx="52" cy="9" rx="6" ry="3.5" fill="#c41e1e" transform="rotate(-20 52 9)"/>
      {/* Standing leg */}
      <path d="M 24 38 C 22 44 20 50 22 54" stroke="#d4a017" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      {/* Speed lines from kick */}
      <path d="M 56 6 L 60 4" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M 56 10 L 62 10" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M 55 14 L 60 17" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}

function IconZen() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      {/* Yin yang inspired */}
      <circle cx="32" cy="32" r="22" stroke="#d4a017" strokeWidth="1.5" fill="none"/>
      <path d="M 32 10 C 21 10 21 32 32 32 C 43 32 43 54 32 54 A 22 22 0 0 1 32 10 Z" fill="#d4a017" opacity="0.4"/>
      <circle cx="32" cy="21" r="5" fill="#d4a017" opacity="0.7"/>
      <circle cx="32" cy="43" r="5" fill="none" stroke="#d4a017" strokeWidth="1.5"/>
      {/* Meditating figure */}
      <circle cx="32" cy="26" r="4" fill="#d4a017"/>
      <path d="M 28 31 C 26 34 24 38 25 42 C 26 40 28 38 32 37 C 36 38 38 40 39 42 C 40 38 38 34 36 31 Z" fill="#d4a017" opacity="0.8"/>
      {/* Lotus arms */}
      <path d="M 25 35 C 22 36 20 38 22 40" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M 39 35 C 42 36 44 38 42 40" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function IconWrestling() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      {/* Takedown silhouette */}
      {/* Figure A (upright) */}
      <circle cx="18" cy="12" r="5" fill="#d4a017"/>
      <path d="M 18 17 C 18 17 20 25 24 30 C 20 28 15 30 12 36 C 16 34 20 34 22 36 C 24 38 24 42 22 44" stroke="#d4a017" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Figure B (being taken down) */}
      <circle cx="46" cy="22" r="5" fill="#c41e1e"/>
      <path d="M 46 27 C 40 30 34 34 30 40 C 36 38 42 40 46 44 C 42 46 38 48 36 52" stroke="#c41e1e" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Clinch arms */}
      <path d="M 22 28 C 30 24 38 26 44 30" stroke="#d4a017" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8"/>
      {/* Ground */}
      <line x1="8" y1="56" x2="56" y2="56" stroke="#d4a017" strokeWidth="1" opacity="0.35"/>
    </svg>
  );
}

function IconDefault() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      {/* Gi/uniform lapel */}
      <path d="M 32 10 L 20 20 L 20 52 L 44 52 L 44 20 Z" fill="#1a1a1a" stroke="#d4a017" strokeWidth="1.5"/>
      {/* Lapel fold left */}
      <path d="M 32 10 L 22 22 L 28 28 Z" fill="#d4a017" opacity="0.6"/>
      {/* Lapel fold right */}
      <path d="M 32 10 L 42 22 L 36 28 Z" fill="#c41e1e" opacity="0.7"/>
      {/* Belt */}
      <rect x="20" y="34" width="24" height="4" fill="#d4a017" opacity="0.9"/>
      {/* Belt knot */}
      <rect x="28" y="32" width="8" height="8" fill="#c41e1e"/>
      {/* Decorative collar */}
      <path d="M 26 16 C 28 20 30 22 32 22 C 34 22 36 20 38 16" stroke="#d4a017" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

type ArteType = 'boxing' | 'grapple' | 'kick' | 'zen' | 'wrestling' | 'default';

function getArteType(nombre: string): ArteType {
  const n = nombre.toLowerCase();
  if (n.includes('boxe') || n.includes('boxing') || n.includes('muay') || n.includes('kickbox') || n.includes('krav') || n.includes('mma')) return 'boxing';
  if (n.includes('bjj') || n.includes('jiu') || n.includes('judo') || n.includes('sambo')) return 'grapple';
  if (n.includes('taekwondo') || n.includes('karate') || n.includes('kung') || n.includes('wushu') || n.includes('capoeira')) return 'kick';
  if (n.includes('tai') || n.includes('yoga') || n.includes('qi') || n.includes('aikido')) return 'zen';
  if (n.includes('wrestling') || n.includes('lucha') || n.includes('greco')) return 'wrestling';
  return 'default';
}

function ArteIcon({ nombre }: { nombre: string }) {
  const type = getArteType(nombre);
  if (type === 'boxing')    return <IconPunch />;
  if (type === 'grapple')   return <IconGrapple />;
  if (type === 'kick')      return <IconKick />;
  if (type === 'zen')       return <IconZen />;
  if (type === 'wrestling') return <IconWrestling />;
  return <IconDefault />;
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
          <div className="flex h-full items-center justify-center bg-[#111111]">
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
