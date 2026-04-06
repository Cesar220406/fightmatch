import Link from 'next/link';
import type { Gimnasio } from '@/types';

export default function GimnasioCard({ g }: { g: Gimnasio }) {
  return (
    <Link href={`/gimnasios/${g.slug}`} className="card group flex flex-col gap-3">
      {/* Imagen */}
      <div className="aspect-video w-full overflow-hidden bg-[#111111]">
        {g.imagen_url ? (
          <img
            src={g.imagen_url}
            alt={g.nombre}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-[#333333]">🥊</div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#f0f0f0] leading-snug group-hover:text-[#d4a017] transition-colors">
            {g.nombre}
          </h3>
          {g.verificado && (
            <span className="badge-green shrink-0">Verificado</span>
          )}
        </div>

        {g.ciudad && (
          <p className="text-xs text-[#888888] flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-[#d4a017]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {g.ciudad}{g.provincia ? `, ${g.provincia}` : ''}
          </p>
        )}

        {/* Artes marciales */}
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

      {/* Precio */}
      {g.precio_desde && (
        <div className="mt-auto pt-3 border-t border-[#2a2a2a] text-xs text-[#888888]">
          Desde <span className="font-semibold text-[#d4a017]">{g.precio_desde}€/mes</span>
        </div>
      )}
    </Link>
  );
}
