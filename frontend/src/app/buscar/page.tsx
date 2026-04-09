'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ArteCard from '@/components/ArteCard';
import GimnasioCard from '@/components/GimnasioCard';
import { api } from '@/lib/api';
import type { ArteMarcial, Gimnasio, Lesion } from '@/types';

const RADIOS = [
  { label: '5 km',       value: 5 },
  { label: '10 km',      value: 10 },
  { label: '25 km',      value: 25 },
  { label: '50 km',      value: 50 },
  { label: 'Sin límite', value: 0 },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-16 h-16 text-[#2a2a2a]">
      <circle cx="10.5" cy="10.5" r="6.5"/>
      <path d="M15.5 15.5 L21 21"/>
    </svg>
  );
}

function BuscarContent() {
  const searchParams = useSearchParams();
  const ciudadParam  = searchParams.get('ciudad') ?? '';
  const lesionParam  = searchParams.get('lesion') ?? '';

  const [artes, setArtes]           = useState<ArteMarcial[]>([]);
  const [gimnasios, setGimnasios]   = useState<Gimnasio[]>([]);
  const [lesiones, setLesiones]     = useState<Lesion[]>([]);
  const [loading, setLoading]       = useState(true);

  // Geolocation state
  const [geoActiva, setGeoActiva]   = useState(false);
  const [geoError, setGeoError]     = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [lat, setLat]               = useState<number | null>(null);
  const [lng, setLng]               = useState<number | null>(null);
  const [radio, setRadio]           = useState(10);

  const lesionIds = lesionParam
    ? lesionParam.split(',').map(Number).filter(Boolean)
    : [];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (ciudadParam) qs.set('ciudad', ciudadParam);
      if (lesionParam) qs.set('lesion_id', lesionParam);
      if (geoActiva && lat !== null && lng !== null && radio > 0) {
        qs.set('lat', String(lat));
        qs.set('lng', String(lng));
        qs.set('radio_km', String(radio));
      }
      qs.set('limit', '24');

      const [artesData, gimData, lesionesData] = await Promise.all([
        lesionIds.length
          ? api.get<ArteMarcial[]>(`/compatibilidades?lesiones=${lesionParam}`).catch(() => [] as ArteMarcial[])
          : api.get<ArteMarcial[]>('/artes-marciales').catch(() => [] as ArteMarcial[]),
        api.get<Gimnasio[]>(`/gimnasios?${qs.toString()}`).catch(() => [] as Gimnasio[]),
        lesionIds.length
          ? api.get<Lesion[]>('/lesiones').catch(() => [] as Lesion[])
          : Promise.resolve([] as Lesion[]),
      ]);

      setArtes(artesData);
      setGimnasios(gimData);
      setLesiones(lesionesData);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciudadParam, lesionParam, geoActiva, lat, lng, radio]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function usarUbicacion() {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoActiva(true);
        setGeoLoading(false);
      },
      () => {
        setGeoError('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  }

  function desactivarGeo() {
    setGeoActiva(false);
    setLat(null);
    setLng(null);
  }

  const lesionesActivas = lesionIds.length
    ? lesiones.filter((l) => lesionIds.includes(l.id))
    : [];

  const tieneFilters    = !!(ciudadParam || lesionParam || geoActiva);
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

          {tieneFilters && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {ciudadParam && (
                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#888888]"
                  style={{ border: '1px solid #2a2a2a' }}>
                  <svg className="h-3 w-3 text-[#d4a017]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {ciudadParam}
                </span>
              )}
              {geoActiva && (
                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#888888]"
                  style={{ border: '1px solid #2a2a2a' }}>
                  <svg className="h-3 w-3 text-[#c41e1e]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {radio > 0 ? `${radio} km` : 'Zona cercana'}
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

        {/* ── Panel de geolocalización ── */}
        <div className="mb-10 p-5 border border-[#2a2a2a] bg-[#0d0d0d]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#888888] mb-3">
            Buscar por distancia
          </p>
          {!geoActiva ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={usarUbicacion}
                disabled={geoLoading}
                className="btn-primary flex items-center gap-2 text-xs"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {geoLoading ? 'Obteniendo ubicación...' : 'Usar mi ubicación'}
              </button>
              {geoError && (
                <p className="text-xs text-[#c41e1e]">{geoError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <svg className="h-4 w-4 text-[#c41e1e] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-xs text-[#f0f0f0]">
                  Ubicación activa · {lat?.toFixed(4)}, {lng?.toFixed(4)}
                </span>
                <button
                  onClick={desactivarGeo}
                  className="text-xs text-[#555555] hover:text-[#c41e1e] uppercase tracking-wider transition-colors"
                >
                  × Desactivar
                </button>
              </div>
              <div>
                <p className="text-xs text-[#555555] uppercase tracking-widest mb-3">
                  Radio de búsqueda:
                  <span className="text-[#d4a017] ml-2">{radio > 0 ? `${radio} km` : 'Sin límite'}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {RADIOS.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => setRadio(value)}
                      className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
                        radio === value
                          ? 'bg-[#c41e1e] border-[#c41e1e] text-white'
                          : 'border-[#2a2a2a] text-[#666666] hover:border-[#d4a017] hover:text-[#d4a017]'
                      }`}
                      style={{ borderRadius: 0 }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <p className="text-xs text-[#888888] uppercase tracking-widest">Buscando...</p>
          </div>
        )}

        {!loading && !tieneResultados && (
          <div className="text-center py-24">
            <div className="flex justify-center mb-4"><SearchIcon /></div>
            <p className="font-display text-4xl text-[#2a2a2a] mb-3 uppercase">Sin resultados</p>
            <p className="text-sm text-[#666666] uppercase tracking-widest mb-8">
              {geoActiva
                ? `No hay gimnasios en un radio de ${radio > 0 ? `${radio} km` : 'tu zona'}.`
                : 'No encontramos gimnasios compatibles con tu búsqueda.'}
            </p>
            <a href="/" className="btn-primary">Volver al inicio</a>
          </div>
        )}

        {!loading && tieneResultados && (
          <>
            {/* Artes marciales */}
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
                  <Link href="/artes-marciales"
                    className="text-xs font-semibold uppercase tracking-widest text-[#888888] hover:text-[#d4a017] transition-colors">
                    Ver todas →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {artes.slice(0, 8).map((arte) => <ArteCard key={arte.id} arte={arte} />)}
                </div>
              </section>
            )}

            {artes.length > 0 && gimnasios.length > 0 && (
              <div className="border-t border-[#2a2a2a] mb-16" />
            )}

            {/* Gimnasios */}
            {gimnasios.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    {geoActiva ? (
                      <>
                        <p className="text-xs text-[#c41e1e] uppercase tracking-widest font-semibold mb-1">
                          {radio > 0 ? `En un radio de ${radio} km` : 'Zona cercana'}
                        </p>
                        <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                          Gimnasios cerca de ti
                        </h2>
                      </>
                    ) : lesionIds.length > 0 ? (
                      <>
                        <p className="text-xs text-[#c41e1e] uppercase tracking-widest font-semibold mb-1">
                          Ofrecen artes marciales compatibles
                        </p>
                        <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                          Gimnasios recomendados
                        </h2>
                      </>
                    ) : (
                      <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                        {ciudadParam ? `Gimnasios en ${ciudadParam}` : 'Gimnasios'}
                      </h2>
                    )}
                  </div>
                  <Link href={`/gimnasios${lesionParam ? `?lesion=${lesionParam}` : ''}`}
                    className="text-xs font-semibold uppercase tracking-widest text-[#888888] hover:text-[#d4a017] transition-colors">
                    Ver todos →
                  </Link>
                </div>
                <p className="text-xs text-[#888888] uppercase tracking-widest mb-6">
                  {gimnasios.length} resultado{gimnasios.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gimnasios.map((g) => <GimnasioCard key={g.id} g={g} />)}
                </div>
              </section>
            )}
          </>
        )}

        <div className="mt-14 pt-8 border-t border-[#2a2a2a]">
          <a href="/" className="text-xs text-[#888888] hover:text-[#d4a017] uppercase tracking-widest transition-colors">
            ← Nueva búsqueda
          </a>
        </div>
      </div>
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs text-[#888888] uppercase tracking-widest">Cargando...</p>
      </div>
    }>
      <BuscarContent />
    </Suspense>
  );
}
