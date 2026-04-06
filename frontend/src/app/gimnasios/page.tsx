export const dynamic = 'force-dynamic';

import GimnasioCard from '@/components/GimnasioCard';
import { api } from '@/lib/api';
import type { Gimnasio, Lesion, ArteMarcial } from '@/types';

interface SearchParams {
  ciudad?: string;
  arte?: string;
  lesion?: string;
  page?: string;
}

async function getData(params: SearchParams) {
  const qs = new URLSearchParams();
  if (params.ciudad) qs.set('ciudad', params.ciudad);
  if (params.arte)   qs.set('arte', params.arte);
  if (params.lesion) qs.set('lesion_id', params.lesion.split(',')[0]); // primera lesión para el filtro principal
  qs.set('page', params.page ?? '1');

  const [gimnasios, lesionesAll, artesAll] = await Promise.all([
    api.get<Gimnasio[]>(`/gimnasios?${qs.toString()}`).catch(() => [] as Gimnasio[]),
    api.get<Lesion[]>('/lesiones').catch(() => [] as Lesion[]),
    api.get<ArteMarcial[]>('/artes-marciales').catch(() => [] as ArteMarcial[]),
  ]);
  return { gimnasios, lesionesAll, artesAll };
}

export default async function GimnasiosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { gimnasios, lesionesAll, artesAll } = await getData(searchParams);

  const lesionActiva = searchParams.lesion
    ? lesionesAll.filter((l) => searchParams.lesion!.split(',').map(Number).includes(l.id))
    : [];

  return (
    <div className="py-12">
      <div className="page-container">
        {/* Cabecera */}
        <div className="mb-8">
          <h1 className="section-title text-3xl">Gimnasios</h1>
          {lesionActiva.length > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              Mostrando gimnasios compatibles con:{' '}
              {lesionActiva.map((l) => (
                <span key={l.id} className="badge-yellow ml-1">{l.nombre}</span>
              ))}
            </p>
          )}
          {searchParams.ciudad && (
            <p className="mt-1 text-sm text-gray-400">
              Ciudad: <span className="text-white font-medium">{searchParams.ciudad}</span>
            </p>
          )}
        </div>

        {/* Filtros inline */}
        <form method="GET" className="flex flex-wrap gap-3 mb-8">
          <input
            name="ciudad"
            defaultValue={searchParams.ciudad}
            placeholder="Ciudad..."
            className="input w-48"
          />
          <select name="arte" defaultValue={searchParams.arte} className="input w-52">
            <option value="">Todas las artes</option>
            {artesAll.map((a) => (
              <option key={a.id} value={a.slug}>{a.nombre}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
          {(searchParams.ciudad || searchParams.arte || searchParams.lesion) && (
            <a href="/gimnasios" className="btn-secondary">Limpiar</a>
          )}
        </form>

        {/* Grid */}
        {gimnasios.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p>No se encontraron gimnasios con esos filtros.</p>
            <a href="/gimnasios" className="mt-4 inline-block text-brand-400 hover:text-brand-300 text-sm">
              Ver todos los gimnasios
            </a>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">{gimnasios.length} resultados</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gimnasios.map((g) => (
                <GimnasioCard key={g.id} g={g} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
