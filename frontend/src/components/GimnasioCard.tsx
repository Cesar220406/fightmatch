import Link from 'next/link';
import type { Gimnasio } from '@/types';
import FavoritoBtn from './FavoritoBtn';

/* Asanoha (hemp leaf) corner ornament — very subtle */
function CornerPattern() {
  return (
    <svg
      width="36" height="36" viewBox="0 0 36 36" fill="none"
      className="absolute top-0 right-0 pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.08 }}
    >
      {/* Asanoha geometric motif */}
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

export default function GimnasioCard({ g }: { g: Gimnasio }) {
  return (
    <Link href={`/gimnasios/${g.slug}`} className="card group flex flex-col gap-3 relative overflow-hidden">
      <CornerPattern />

      {/* Imagen */}
      <div className="aspect-video w-full overflow-hidden bg-[#111111]">
        {g.imagen_url ? (
          <img
            src={g.imagen_url}
            alt={g.nombre}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
              <rect x="8" y="14" width="36" height="24" rx="0" stroke="#333333" strokeWidth="1.5"/>
              <rect x="20" y="14" width="12" height="24" stroke="#333333" strokeWidth="1.5"/>
              <rect x="14" y="20" width="8" height="12" stroke="#333333" strokeWidth="1.5"/>
              <rect x="30" y="20" width="8" height="12" stroke="#333333" strokeWidth="1.5"/>
              <circle cx="26" cy="26" r="3" stroke="#c41e1e" strokeWidth="1.5"/>
              <line x1="8" y1="38" x2="44" y2="38" stroke="#333333" strokeWidth="1.5"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#f0f0f0] leading-snug group-hover:text-[#d4a017] transition-colors flex-1">
            {g.nombre}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {g.verificado && <span className="badge-green">Verificado</span>}
            <FavoritoBtn gimnasioId={g.id} />
          </div>
        </div>

        {g.ciudad && (
          <p className="text-xs text-[#888888] flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-[#d4a017]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {g.ciudad}{g.provincia ? `, ${g.provincia}` : ''}
            {g.distancia_km != null && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#c41e1e]/10 text-[#c41e1e] border border-[#c41e1e]/20">
                a {g.distancia_km} km
              </span>
            )}
          </p>
        )}

        {g.artes && g.artes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {g.artes.slice(0, 3).map((a) => (
              <span key={a} className="badge-gray">{a}</span>
            ))}
            {g.artes.length > 3 && (
              <span className="badge-gray">+{g.artes.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {g.precio_desde && (
        <div className="mt-auto pt-3 border-t border-[#2a2a2a] text-xs text-[#888888]">
          Desde <span className="font-semibold text-[#d4a017]">{g.precio_desde}€/mes</span>
        </div>
      )}
    </Link>
  );
}
