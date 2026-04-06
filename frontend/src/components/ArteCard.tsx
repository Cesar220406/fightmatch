import Link from 'next/link';
import type { ArteMarcial } from '@/types';

export default function ArteCard({ arte }: { arte: ArteMarcial }) {
  return (
    <Link
      href={`/artes-marciales/${arte.slug}`}
      className="card group flex flex-col gap-3 hover:shadow-lg hover:shadow-brand-900/20"
    >
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-800">
        {arte.imagen_url ? (
          <img
            src={arte.imagen_url}
            alt={arte.nombre}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-gray-600">🥋</div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-white group-hover:text-brand-400 transition">
          {arte.nombre}
        </h3>
        {arte.descripcion && (
          <p className="mt-1 text-sm text-gray-400 line-clamp-2">{arte.descripcion}</p>
        )}
      </div>

      {arte.impacto_fisico && (
        <p className="text-xs text-gray-500 border-t border-gray-800 pt-2 line-clamp-1">
          {arte.impacto_fisico}
        </p>
      )}
    </Link>
  );
}
