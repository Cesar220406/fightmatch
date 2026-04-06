export const dynamic = 'force-dynamic';

import ArteCard from '@/components/ArteCard';
import { api } from '@/lib/api';
import type { ArteMarcial } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Artes Marciales' };

export default async function ArtesMacialesPage() {
  const artes = await api.get<ArteMarcial[]>('/artes-marciales').catch(() => [] as ArteMarcial[]);

  return (
    <div className="py-14">
      <div className="page-container">
        <div className="mb-12">
          <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Disciplinas</p>
          <h1 className="font-display text-5xl lg:text-7xl text-white uppercase tracking-wide mb-4">
            Artes Marciales
          </h1>
          <p className="text-[#888888] max-w-xl leading-relaxed">
            Explora cada disciplina y descubre cuáles son compatibles con tu situación física actual.
          </p>
        </div>

        {artes.length === 0 ? (
          <p className="text-center text-[#888888] py-20 text-sm uppercase tracking-widest">
            No hay artes marciales registradas todavía.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {artes.map((arte) => (
              <ArteCard key={arte.id} arte={arte} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
