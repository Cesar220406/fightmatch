import Link from 'next/link';
import type { Gimnasio } from '@/types';

export default function GimnasioCard({ g }: { g: Gimnasio }) {
  return (
    <Link href={`/gimnasios/${g.slug}`} className="card group flex flex-col gap-3 hover:shadow-lg hover:shadow-brand-900/20">
      {/* Imagen */}
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-800">
        {g.imagen_url ? (
          <img
            src={g.imagen_url}
            alt={g.nombre}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-600">🥊</div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white leading-snug group-hover:text-brand-400 transition">
            {g.nombre}
          </h3>
          {g.verificado && (
            <span className="badge-green shrink-0">Verificado</span>
          )}
        </div>

        {g.ciudad && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="mt-auto pt-2 border-t border-gray-800 text-xs text-gray-400">
          Desde <span className="font-semibold text-white">{g.precio_desde}€/mes</span>
        </div>
      )}
    </Link>
  );
}
