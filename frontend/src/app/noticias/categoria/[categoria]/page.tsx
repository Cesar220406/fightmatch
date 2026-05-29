export const revalidate = 3600;

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Noticia } from '@/types';
import { api } from '@/lib/api';
import { CAT_COLORS } from '../../page';

const CATEGORIAS = ['boxeo', 'mma', 'judo', 'taekwondo', 'olimpico', 'wrestling', 'kickboxing'];

const CAT_LABELS: Record<string, string> = {
  boxeo: 'Boxeo', mma: 'MMA', judo: 'Judo', taekwondo: 'Taekwondo',
  olimpico: 'Olímpico', wrestling: 'Wrestling', kickboxing: 'Kickboxing',
};

const CAT_DESC: Record<string, string> = {
  boxeo:      'Noticias de boxeo: combates, campeonatos, análisis técnicos y actualidad del boxeo mundial y español.',
  mma:        'Noticias de MMA: UFC, ONE Championship, resultados, análisis y novedades del mundo de las artes marciales mixtas.',
  judo:       'Noticias de judo: Grand Slam, Campeonatos del Mundo, resultados españoles y análisis técnicos.',
  taekwondo:  'Noticias de taekwondo: competiciones olímpicas, resultados españoles y análisis del deporte.',
  olimpico:   'Cobertura de artes marciales olímpicas: judo, taekwondo, lucha y boxeo en los Juegos Olímpicos.',
  wrestling:  'Noticias de lucha olímpica: resultados, competiciones y actualidad del wrestling en España y el mundo.',
  kickboxing: 'Noticias de kickboxing: Glory Kickboxing, resultados, rankings y actualidad de la disciplina.',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  if (!CATEGORIAS.includes(params.categoria)) return { title: 'Categoría no encontrada' };
  const label = CAT_LABELS[params.categoria];
  return {
    title: `Noticias de ${label} | Fight News by FightMatch`,
    description: CAT_DESC[params.categoria] ?? `Últimas noticias de ${label} en FightMatch.`,
  };
}

export default async function CategoriaPage({ params }: { params: { categoria: string } }) {
  const { categoria } = params;
  if (!CATEGORIAS.includes(categoria)) notFound();

  const noticias = await api
    .get<Noticia[]>(`/noticias?categoria=${categoria}&limit=30`)
    .catch(() => [] as Noticia[]);

  const catColor = CAT_COLORS[categoria] ?? '#888888';
  const catLabel = CAT_LABELS[categoria];
  const hero = noticias[0];
  const resto = noticias.slice(1);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Cabecera de categoría */}
      <div className="border-b py-8" style={{ borderBottomColor: catColor, borderBottomWidth: 3 }}>
        <div className="page-container">
          <nav className="text-[10px] text-[#555555] mb-4 flex items-center gap-2 uppercase tracking-widest font-semibold">
            <Link href="/" className="hover:text-[#d4a017] transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/noticias" className="hover:text-[#d4a017] transition-colors">Noticias</Link>
            <span>/</span>
            <span style={{ color: catColor }}>{catLabel}</span>
          </nav>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 mb-3 inline-block"
                style={{ background: catColor, color: '#fff' }}
              >
                {catLabel}
              </span>
              <h1 className="font-display text-5xl lg:text-7xl text-white uppercase tracking-wide leading-none">
                {catLabel}
              </h1>
              <p className="text-sm text-[#888888] mt-2 max-w-xl">
                {CAT_DESC[categoria]}
              </p>
            </div>

            {/* Otras categorías */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.filter((c) => c !== categoria).map((c) => (
                <Link
                  key={c}
                  href={`/noticias/categoria/${c}`}
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border transition-colors hover:text-white"
                  style={{ borderColor: CAT_COLORS[c] ?? '#2a2a2a', color: CAT_COLORS[c] ?? '#888888' }}
                >
                  {CAT_LABELS[c]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-10">
        {noticias.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#555555] text-lg">No hay noticias en esta categoría todavía.</p>
            <Link href="/noticias" className="text-[#d4a017] text-sm mt-4 inline-block hover:underline">
              ← Volver a todas las noticias
            </Link>
          </div>
        ) : (
          <>
            {/* Hero */}
            {hero && (
              <Link
                href={`/noticias/${hero.slug}`}
                className="group block relative overflow-hidden mb-8"
                style={{ minHeight: 360 }}
              >
                {hero.imagen_url ? (
                  <img
                    src={hero.imagen_url}
                    alt={hero.imagen_alt ?? ''}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, #0a0a0a 0%, ${catColor}33 100%)` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                <div
                  className="relative z-10 flex flex-col justify-end p-8 lg:p-12"
                  style={{ minHeight: 360 }}
                >
                  <h2 className="font-display text-3xl lg:text-5xl text-white uppercase tracking-wide leading-tight mb-3 group-hover:text-[#d4a017] transition-colors max-w-3xl">
                    {hero.titulo}
                  </h2>
                  {hero.subtitulo && (
                    <p className="text-[#cccccc] text-sm max-w-2xl mb-4">{hero.subtitulo}</p>
                  )}
                  <p className="text-xs text-[#888888]">
                    {hero.autor} · {formatDate(hero.fecha_publicacion)}
                    {hero.tiempo_lectura ? ` · ${hero.tiempo_lectura} min` : ''}
                  </p>
                </div>
              </Link>
            )}

            {/* Grid resto */}
            {resto.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {resto.map((n) => (
                  <Link
                    key={n.slug}
                    href={`/noticias/${n.slug}`}
                    className="group block border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors overflow-hidden"
                  >
                    <div className="aspect-video relative overflow-hidden bg-[#111111]">
                      {n.imagen_url ? (
                        <img
                          src={n.imagen_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: `linear-gradient(135deg, #111 0%, ${catColor}22 100%)` }}
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-base text-white uppercase tracking-wide leading-tight mb-2 group-hover:text-[#d4a017] transition-colors line-clamp-2">
                        {n.titulo}
                      </h3>
                      {n.resumen && (
                        <p className="text-xs text-[#888888] line-clamp-2 mb-3">{n.resumen}</p>
                      )}
                      <p className="text-[10px] text-[#555555] uppercase tracking-widest">
                        {formatDate(n.fecha_publicacion)}
                        {n.tiempo_lectura ? ` · ${n.tiempo_lectura} min` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
