export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Gimnasios de artes marciales',
  description: 'Encuentra el gimnasio de artes marciales ideal para ti, adaptado a tus lesiones y ubicación.',
};

import GimnasioCard from '@/components/GimnasioCard';
import { api } from '@/lib/api';
import type { Gimnasio, Lesion, ArteMarcial } from '@/types';

const PAGE_SIZE = 12;

interface SearchParams {
  ciudad?: string;
  arte?: string;
  lesion?: string;
  page?: string;
}

async function getData(params: SearchParams) {
  const page = Number(params.page ?? 1);
  const qs = new URLSearchParams();
  if (params.ciudad) qs.set('ciudad', params.ciudad);
  if (params.arte)   qs.set('arte', params.arte);
  if (params.lesion) qs.set('lesion_id', params.lesion); // pass all IDs, backend handles comma-separated
  qs.set('page', String(page));
  qs.set('limit', String(PAGE_SIZE));

  const [gimnasios, lesionesAll, artesAll] = await Promise.all([
    api.get<Gimnasio[]>(`/gimnasios?${qs.toString()}`).catch(() => [] as Gimnasio[]),
    api.get<Lesion[]>('/lesiones').catch(() => [] as Lesion[]),
    api.get<ArteMarcial[]>('/artes-marciales').catch(() => [] as ArteMarcial[]),
  ]);
  return { gimnasios, lesionesAll, artesAll, page };
}

export default async function GimnasiosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { gimnasios, lesionesAll, artesAll, page } = await getData(searchParams);

  const lesionesActivas = searchParams.lesion
    ? lesionesAll.filter((l) => searchParams.lesion!.split(',').map(Number).includes(l.id))
    : [];

  const hasFilters = !!(searchParams.ciudad || searchParams.arte || searchParams.lesion);

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    if (searchParams.ciudad) qs.set('ciudad', searchParams.ciudad);
    if (searchParams.arte)   qs.set('arte', searchParams.arte);
    if (searchParams.lesion) qs.set('lesion', searchParams.lesion);
    qs.set('page', String(p));
    return `/gimnasios?${qs.toString()}`;
  }

  const hasMore = gimnasios.length === PAGE_SIZE;
  const hasPrev = page > 1;

  return (
    <div className="py-14">
      <div className="page-container">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Directorio</p>
          <h1 className="font-display text-5xl lg:text-6xl text-white uppercase tracking-wide mb-3">
            Gimnasios
          </h1>
          {lesionesActivas.length > 0 && (
            <p className="text-sm text-[#888888] flex items-center gap-2 flex-wrap mt-2">
              Filtrando por lesión:
              {lesionesActivas.map((l) => (
                <span key={l.id} className="badge-yellow">{l.nombre}</span>
              ))}
            </p>
          )}
        </div>

        {/* Filtros */}
        <form method="GET" className="flex flex-wrap gap-3 mb-10 pb-8 border-b border-[#2a2a2a]">
          <input
            name="ciudad"
            defaultValue={searchParams.ciudad}
            placeholder="Ciudad..."
            className="input w-48"
          />
          <select name="arte" defaultValue={searchParams.arte} className="input w-52 bg-[#111111]">
            <option value="">Todas las artes</option>
            {artesAll.map((a) => (
              <option key={a.id} value={a.slug}>{a.nombre}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
          {hasFilters && (
            <a href="/gimnasios" className="btn-secondary">Limpiar</a>
          )}
        </form>

        {/* Grid */}
        {gimnasios.length === 0 ? (
          <div className="text-center py-24 text-[#888888]">
            <p className="font-display text-6xl text-[#2a2a2a] mb-4">0</p>
            <p className="text-sm uppercase tracking-widest">No se encontraron gimnasios con esos filtros.</p>
            <a href="/gimnasios" className="mt-6 inline-block text-xs font-semibold uppercase tracking-widest text-[#d4a017] hover:text-[#e8b520] transition-colors">
              Ver todos los gimnasios →
            </a>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#888888] uppercase tracking-widest mb-6">
              {gimnasios.length < PAGE_SIZE
                ? `${gimnasios.length} resultado${gimnasios.length !== 1 ? 's' : ''}`
                : `Página ${page}`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gimnasios.map((g) => (
                <GimnasioCard key={g.id} g={g} />
              ))}
            </div>

            {/* Pagination */}
            {(hasPrev || hasMore) && (
              <div className="flex items-center justify-center gap-4 mt-14 pt-8 border-t border-[#2a2a2a]">
                {hasPrev ? (
                  <a href={pageUrl(page - 1)} className="btn-secondary text-xs">← Anterior</a>
                ) : (
                  <span className="btn-secondary text-xs opacity-30 pointer-events-none">← Anterior</span>
                )}
                <span className="text-xs text-[#444444] uppercase tracking-widest font-semibold">
                  Página {page}
                </span>
                {hasMore ? (
                  <a href={pageUrl(page + 1)} className="btn-secondary text-xs">Siguiente →</a>
                ) : (
                  <span className="btn-secondary text-xs opacity-30 pointer-events-none">Siguiente →</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
