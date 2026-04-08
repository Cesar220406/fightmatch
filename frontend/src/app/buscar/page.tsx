export const dynamic = 'force-dynamic';

import Link from 'next/link';
import ArteCard from '@/components/ArteCard';
import GimnasioCard from '@/components/GimnasioCard';
import { api } from '@/lib/api';
import type { ArteMarcial, Gimnasio, Lesion } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Resultados de búsqueda' };

interface SearchParams {
  ciudad?: string;
  lesion?: string;
}

async function getData(params: SearchParams) {
  const lesionIds = params.lesion
    ? params.lesion.split(',').map(Number).filter(Boolean)
    : [];

  const qs = new URLSearchParams();
  if (params.ciudad) qs.set('ciudad', params.ciudad);
  if (params.lesion) qs.set('lesion_id', params.lesion);

  const [artes, gimnasios, lesionesAll] = await Promise.all([
    lesionIds.length
      ? api.get<ArteMarcial[]>(`/compatibilidades?lesiones=${params.lesion}`).catch(() => [] as ArteMarcial[])
      : api.get<ArteMarcial[]>('/artes-marciales').catch(() => [] as ArteMarcial[]),
    api.get<Gimnasio[]>(`/gimnasios?${qs.toString()}&limit=12`).catch(() => [] as Gimnasio[]),
    lesionIds.length
      ? api.get<Lesion[]>('/lesiones').catch(() => [] as Lesion[])
      : Promise.resolve([] as Lesion[]),
  ]);

  const lesionesActivas = lesionIds.length
    ? lesionesAll.filter((l) => lesionIds.includes(l.id))
    : [];

  return { artes, gimnasios, lesionesActivas, lesionIds };
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-16 h-16 text-[#2a2a2a]">
      <circle cx="10.5" cy="10.5" r="6.5"/>
      <path d="M15.5 15.5 L21 21"/>
    </svg>
  );
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { artes, gimnasios, lesionesActivas, lesionIds } = await getData(searchParams);
  const tieneFilters = !!(searchParams.ciudad || searchParams.lesion);
  const tieneResultados = artes.length > 0 || gimnasios.length > 0;

  return (
    <div className="py-14">
      <div className="page-container">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">
            Resultados
          </p>
          <h1 className="font-display text-5xl lg:text-6xl text-white uppercase tracking-wide mb-3">
            {lesionIds.length > 0 ? 'Opciones para ti' : 'Gimnasios'}
          </h1>

          {/* Active filters */}
          {tieneFilters && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {searchParams.ciudad && (
                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#888888]"
                  style={{ border: '1px solid #2a2a2a' }}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                    <path d="M8 1.5 C5.5 1.5 3.5 3.5 3.5 6 C3.5 9.5 8 14.5 8 14.5 C8 14.5 12.5 9.5 12.5 6 C12.5 3.5 10.5 1.5 8 1.5 Z"/>
                    <circle cx="8" cy="6" r="1.5"/>
                  </svg>
                  {searchParams.ciudad}
                </span>
              )}
              {lesionesActivas.map((l) => (
                <span key={l.id} className="badge-yellow">{l.nombre}</span>
              ))}
              <Link
                href="/buscar"
                className="text-xs text-[#444444] hover:text-[#d4a017] uppercase tracking-widest transition-colors"
              >
                × Limpiar
              </Link>
            </div>
          )}
        </div>

        {/* No results */}
        {!tieneResultados && (
          <div className="text-center py-24">
            <div className="flex justify-center mb-4">
              <SearchIcon />
            </div>
            <p className="font-display text-4xl text-[#2a2a2a] mb-3 uppercase">Sin resultados</p>
            <p className="text-sm text-[#666666] uppercase tracking-widest mb-8">
              No encontramos gimnasios compatibles con tu búsqueda.
            </p>
            <a href="/" className="btn-primary">Volver al inicio</a>
          </div>
        )}

        {/* ── Artes marciales compatibles ──────────────────── */}
        {artes.length > 0 && (
          <section className="mb-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                {lesionIds.length > 0 ? (
                  <>
                    <p className="text-xs text-[#c41e1e] uppercase tracking-widest font-semibold mb-1">
                      Compatible con tus lesiones
                    </p>
                    <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                      Artes marciales recomendadas
                    </h2>
                  </>
                ) : (
                  <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                    Artes marciales
                  </h2>
                )}
              </div>
              <Link
                href="/artes-marciales"
                className="text-xs font-semibold uppercase tracking-widest text-[#888888] hover:text-[#d4a017] transition-colors"
              >
                Ver todas →
              </Link>
            </div>

            {lesionIds.length > 0 && artes.length === 0 ? (
              <p className="text-sm text-[#666666] uppercase tracking-widest py-8 text-center border border-[#2a2a2a]">
                Ninguna arte marcial es compatible con todas tus lesiones combinadas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {artes.slice(0, 8).map((arte) => (
                  <ArteCard key={arte.id} arte={arte} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Divider */}
        {artes.length > 0 && gimnasios.length > 0 && (
          <div className="border-t border-[#2a2a2a] mb-16" />
        )}

        {/* ── Gimnasios ────────────────────────────────────── */}
        {tieneResultados && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                {lesionIds.length > 0 ? (
                  <>
                    <p className="text-xs text-[#c41e1e] uppercase tracking-widest font-semibold mb-1">
                      Ofrecen artes marciales compatibles
                    </p>
                    <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                      Gimnasios cerca de ti
                    </h2>
                  </>
                ) : (
                  <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                    {searchParams.ciudad ? `Gimnasios en ${searchParams.ciudad}` : 'Gimnasios'}
                  </h2>
                )}
              </div>
              <Link
                href={`/gimnasios${searchParams.lesion ? `?lesion=${searchParams.lesion}` : ''}`}
                className="text-xs font-semibold uppercase tracking-widest text-[#888888] hover:text-[#d4a017] transition-colors"
              >
                Ver todos →
              </Link>
            </div>

            {gimnasios.length === 0 ? (
              <div className="text-center py-16 border border-[#2a2a2a]">
                <p className="text-sm text-[#666666] uppercase tracking-widest">
                  No hay gimnasios{searchParams.ciudad ? ` en ${searchParams.ciudad}` : ''} con esos criterios.
                </p>
                <a
                  href={`/gimnasios`}
                  className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-[#d4a017] hover:text-[#e8b520] transition-colors"
                >
                  Ver todos los gimnasios →
                </a>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#888888] uppercase tracking-widest mb-6">
                  {gimnasios.length} resultado{gimnasios.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gimnasios.map((g) => (
                    <GimnasioCard key={g.id} g={g} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Back link */}
        <div className="mt-14 pt-8 border-t border-[#2a2a2a]">
          <a href="/" className="text-xs text-[#888888] hover:text-[#d4a017] uppercase tracking-widest transition-colors">
            ← Nueva búsqueda
          </a>
        </div>
      </div>
    </div>
  );
}
