export const dynamic = 'force-dynamic';

import ArteCard from '@/components/ArteCard';
import { api } from '@/lib/api';
import type { ArteMarcial } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Artes Marciales' };

export default async function ArtesMacialesPage() {
  const artes = await api.get<ArteMarcial[]>('/artes-marciales').catch(() => [] as ArteMarcial[]);

  return (
    <div className="py-12">
      <div className="page-container">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold text-white mb-3">Artes Marciales</h1>
          <p className="text-gray-400">
            Explora cada disciplina y descubre cuáles son compatibles con tu situación física actual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artes.map((arte) => (
            <ArteCard key={arte.id} arte={arte} />
          ))}
        </div>

        {artes.length === 0 && (
          <p className="text-center text-gray-500 py-20">No hay artes marciales registradas todavía.</p>
        )}
      </div>
    </div>
  );
}
