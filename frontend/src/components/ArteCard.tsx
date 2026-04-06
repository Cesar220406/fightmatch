import Link from 'next/link';
import type { ArteMarcial } from '@/types';

export default function ArteCard({ arte }: { arte: ArteMarcial }) {
  return (
    <Link
      href={`/artes-marciales/${arte.slug}`}
      className="card group flex flex-col gap-3"
    >
      <div className="aspect-video w-full overflow-hidden bg-[#111111]">
        {arte.imagen_url ? (
          <img
            src={arte.imagen_url}
            alt={arte.nombre}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-[#333333]">🥋</div>
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
