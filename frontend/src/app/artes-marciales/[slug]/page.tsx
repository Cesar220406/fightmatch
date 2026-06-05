/**
 * /artes-marciales/[slug]
 *
 * ISR diario para el contenido estático del arte.
 * Los gimnasios cercanos se cargan en un componente separado con Suspense
 * y su propio revalidate: 3600 (ver GimnasioCercanos).
 *
 * T4a: revalidate del contenido principal = 86400 (arte no cambia)
 * T4b: BreadcrumbList JSON-LD
 * T4c: Reading time estimado
 * T4d: ShareButton (Web Share API)
 * T4e: ArteStickyNav (anclas, desktop only)
 */

import { notFound }       from 'next/navigation';
import Link               from 'next/link';
import dynamicImport      from 'next/dynamic';
import { Suspense }       from 'react';
import type { Metadata }  from 'next';

import { api }              from '@/lib/api';
import { hasMuscleData, getMuscleData } from '@/lib/muscleData';
import {
  ARTE_NOMBRES, ARTE_CATEGORIA, ARTE_SUBTITULO, ARTE_VIDEO_ID, ARTE_VIDEO_EXTRA,
  ARTE_ORIGEN, ARTE_TIEMPO_COMPETICION, ARTE_CALLE, ARTE_CONTACTO_NIVEL,
  ARTE_STATS, ARTE_TEXTOS, ARTE_FAQ, ARTE_PATRON, ARTE_CTA_TEXT,
  ARTES_SLUGS, STATS_LABELS,
  type ArteSlug,
} from '@/lib/arteData';

import CompatibilidadTabla from '@/components/CompatibilidadTabla';
import MuscleMapSkeleton   from '@/components/skeletons/MuscleMapSkeleton';
import GymCardSkeleton     from '@/components/skeletons/GymCardSkeleton';
import VideoHighlight      from '@/components/VideoHighlight';
import ShareButton         from '@/components/ShareButton';
import ArteAccordion       from '@/components/ArteAccordion';
import ArteStickyNav       from '@/components/ArteStickyNav';
import GimnasioCard        from '@/components/GimnasioCard';

import type { ArteMarcial, Gimnasio } from '@/types';

// SSR — el contenido de compatibilidades cambia en el admin.
// T4a: los gimnasios cercanos (GimnasioCercanos) usan fetch con revalidate: 3600
// separado en un Suspense boundary propio.
export const dynamic = 'force-dynamic';

// MuscleMap solo en cliente (react-body-highlighter ESM)
const MuscleMap = dynamicImport(() => import('@/components/MuscleMap'), {
  ssr:     false,
  loading: () => <MuscleMapSkeleton size="md" />,
});

// Helpers
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fightmatch.duckdns.org';

function readingTime(slug: ArteSlug): number {
  const t = ARTE_TEXTOS[slug];
  if (!t) return 3;
  const words = [t.p1, t.p2, t.p3].join(' ').split(/\s+/).length;
  // ~200 palabras/min; +2 por el resto del contenido (stats, FAQ, etc.)
  return Math.ceil(words / 200) + 2;
}

async function getArte(slug: string) {
  return api
    .get<ArteMarcial>(`/artes-marciales/${slug}`)
    .catch(() => null);
}

// Metadata
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const s    = params.slug as ArteSlug;
  const name = ARTE_NOMBRES[s] ?? params.slug;
  const arte = await getArte(params.slug);

  return {
    title:       `${name} — guía completa | FightMatch`,
    description:
      arte?.descripcion ??
      `Todo lo que necesitas saber sobre ${name}: músculos trabajados, compatibilidad con lesiones, estadísticas y gimnasios donde practicarlo.`,
    alternates: {
      canonical: `${BASE_URL}/artes-marciales/${params.slug}`,
    },
  };
}

// Componente de gimnasios cercanos (Suspense boundary)
// fetch con revalidate propio para separar ISR del contenido estático
async function GimnasioCercanos({ arteSlug }: { arteSlug: string }) {
  let gimnasios: Gimnasio[] = [];
  try {
    const res = await fetch(
      `${process.env.API_INTERNAL_URL || 'http://backend:4000/api'}/gimnasios?arte=${arteSlug}&limit=3`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) gimnasios = await res.json();
  } catch { /* silencio */ }

  if (!gimnasios.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {gimnasios.map(g => <GimnasioCard key={g.id} g={g} />)}
    </div>
  );
}

// Barra de stats
function StatBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  const color = value >= 4 ? '#c41e1e' : value >= 3 ? '#d4a017' : '#555555';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#888888] uppercase tracking-widest">{label}</span>
        <span className="text-xs font-semibold text-[#f0f0f0]">{value}/5</span>
      </div>
      <div className="h-1.5 bg-[#1a1a1a] w-full overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// Página
export default async function ArteDetallePage(
  { params }: { params: { slug: string } }
) {
  const s       = params.slug as ArteSlug;
  const isKnown = ARTES_SLUGS.includes(s);
  const arte    = await getArte(params.slug);

  // 404 solo si ni la BD ni nuestros datos estáticos conocen este slug
  if (!arte && !isKnown) notFound();

  const nombre     = ARTE_NOMBRES[s]     ?? arte?.nombre     ?? params.slug;
  const categoria  = ARTE_CATEGORIA[s]   ?? 'Arte Marcial';
  const subtitulo  = ARTE_SUBTITULO[s]   ?? arte?.descripcion ?? '';
  const videoId    = ARTE_VIDEO_ID[s] ?? ARTE_VIDEO_EXTRA[params.slug];
  const textos     = ARTE_TEXTOS[s];
  const faq        = ARTE_FAQ[s]         ?? [];
  const stats      = ARTE_STATS[s];
  const patron     = ARTE_PATRON[s]      ?? '';
  const ctaText    = ARTE_CTA_TEXT[s]    ?? '';
  const tieneMapa  = hasMuscleData(s);
  const layers     = getMuscleData(s);
  const rTime      = readingTime(s);

  const compatibles   = arte?.compatibilidades?.filter(c => c.compatible).length  ?? 0;
  const incompatibles = arte?.compatibilidades?.filter(c => !c.compatible).length ?? 0;

  const siteUrl = `${BASE_URL}/artes-marciales/${params.slug}`;

  // JSON-LD: BreadcrumbList (T4b)
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio',         item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Artes Marciales', item: `${BASE_URL}/artes-marciales` },
      { '@type': 'ListItem', position: 3, name: nombre,            item: siteUrl },
    ],
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Sticky in-page nav (desktop) */}
      <ArteStickyNav />

      {/* ═══ SECCIÓN 1 — HERO ═══════════════════════════════════ */}
      <section
        id="intro"
        className="relative overflow-hidden bg-[#0a0a0a] border-b border-[#1a1a1a]"
        style={{
          backgroundImage: patron,
          backgroundSize:  '50px 50px',
        }}
      >
        {/* Gradiente rojo atmosférico */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 60% 30%, rgba(196,30,30,0.09) 0%, transparent 55%)',
          }}
        />

        <div className="page-container py-16 lg:py-24 relative">
          {/* Breadcrumb */}
          <nav
            className="text-[11px] text-[#555555] mb-8 flex items-center gap-1.5 uppercase tracking-widest font-semibold"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-[#d4a017] transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/artes-marciales" className="hover:text-[#d4a017] transition-colors">Artes Marciales</Link>
            <span>/</span>
            <span className="text-[#888888]">{nombre}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Columna izquierda: copy */}
            <div className="space-y-6">
              {/* Badge de categoría */}
              <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#d4a017] border border-[#d4a017]/30 bg-[#d4a017]/5">
                {categoria}
              </div>

              {/* Título */}
              <h1 className="font-display text-[clamp(3.5rem,8vw,6rem)] text-white uppercase tracking-wide leading-none">
                {nombre}
              </h1>

              {/* Subtítulo editorial */}
              {subtitulo && (
                <p className="text-xl text-[#d4a017] font-medium leading-snug max-w-md">
                  {subtitulo}
                </p>
              )}

              {/* Meta: reading time + fecha */}
              <div className="flex items-center gap-3 text-[11px] text-[#444444] uppercase tracking-widest">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                </svg>
                <span>Lectura: ~{rTime} min</span>
                <span className="text-[#2a2a2a]">·</span>
                <span>Actualizado {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
              </div>

              {/* Pills de stats rápidos */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] px-3 py-1 border border-[#2a2a2a] text-[#888888]">
                  🌍 {ARTE_ORIGEN[s] ?? '—'}
                </span>
                <span className="text-[11px] px-3 py-1 border border-[#2a2a2a] text-[#888888]">
                  {Array.from({ length: ARTE_CONTACTO_NIVEL[s] ?? 0 })
                    .map((_, i) => <span key={i} className="text-[#c41e1e]">●</span>)}{' '}
                  {Array.from({ length: 5 - (ARTE_CONTACTO_NIVEL[s] ?? 0) })
                    .map((_, i) => <span key={i} className="opacity-20">●</span>)}{' '}
                  Contacto
                </span>
                <span className="text-[11px] px-3 py-1 border border-[#2a2a2a] text-[#888888]">
                  ⏱ Primera competición: {ARTE_TIEMPO_COMPETICION[s] ?? '—'}
                </span>
                <span className={`text-[11px] px-3 py-1 border text-[#888888] ${
                  ARTE_CALLE[s] === 'Sí' ? 'border-emerald-800/50 text-emerald-500'
                  : ARTE_CALLE[s] === 'No' ? 'border-red-900/50 text-red-500'
                  : 'border-[#2a2a2a]'
                }`}>
                  {ARTE_CALLE[s] === 'Sí' ? '✓' : ARTE_CALLE[s] === 'No' ? '✗' : '~'} Defensa personal
                </span>
              </div>

              {/* CTA y share */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/buscar?arte=${params.slug}`} className="btn-primary">
                  Buscar gimnasios de {nombre} →
                </Link>
                <ShareButton title={`${nombre} — FightMatch`} url={siteUrl} />
              </div>

              {/* Stats de compatibilidad */}
              <div className="flex gap-8 pt-2 border-t border-[#1a1a1a]">
                <div>
                  <p className="font-display text-4xl text-emerald-400 leading-none">{compatibles}</p>
                  <p className="text-[10px] text-[#555555] uppercase tracking-widest mt-1">Lesiones compatibles</p>
                </div>
                <div>
                  <p className="font-display text-4xl text-[#c41e1e] leading-none">{incompatibles}</p>
                  <p className="text-[10px] text-[#555555] uppercase tracking-widest mt-1">Contraindicadas</p>
                </div>
              </div>
            </div>

            {/* Columna derecha: imagen o placeholder con patrón */}
            <div className="relative aspect-[4/3] overflow-hidden border border-[#2a2a2a]"
              style={{ backgroundImage: patron, backgroundSize: '40px 40px' }}
            >
              {arte?.imagen_url ? (
                <img
                  src={arte?.imagen_url}
                  alt={nombre}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  {/* Icono SVG genérico de luchador */}
                  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-28 opacity-15">
                    <circle cx="60" cy="22" r="14" stroke="#d4a017" strokeWidth="2"/>
                    <path d="M60 36 C60 36 48 42 42 56 L42 90 L78 90 L78 56 C72 42 60 36 60 36Z" stroke="#d4a017" strokeWidth="2" fill="none"/>
                    <path d="M42 56 L28 62 L30 80 L42 76" stroke="#d4a017" strokeWidth="2" fill="none"/>
                    <path d="M78 56 L92 62 L90 80 L78 76" stroke="#d4a017" strokeWidth="2" fill="none"/>
                  </svg>
                  <p className="text-[#333333] text-xs uppercase tracking-widest font-semibold">{nombre}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 2 — VÍDEO ════════════════════════════════════ */}
      {videoId && (
        <section id="video" className="py-16 border-b border-[#1a1a1a]">
          <div className="page-container max-w-4xl">
            <div className="mb-5">
              <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Vídeo</p>
              <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                En acción
              </h2>
            </div>
            <VideoHighlight videoId={videoId} title={`${nombre} en acción`} />
          </div>
        </section>
      )}

      {/* ═══ SECCIÓN 3 — EDITORIAL + MAPA MUSCULAR ══════════════ */}
      <section id="musculos" className="py-16 border-b border-[#1a1a1a]">
        <div className="page-container">
          <div className="mb-8">
            <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Anatomía y entrenamiento</p>
            <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
              Qué trabajarás de verdad
            </h2>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 items-start">
            {/* Texto editorial (3/5) */}
            <div className="lg:col-span-3 space-y-5">
              {textos ? (
                <>
                  <p className="text-[#888888] leading-relaxed">{textos.p1}</p>
                  <p className="text-[#888888] leading-relaxed">{textos.p2}</p>
                  <p className="text-[#888888] leading-relaxed">{textos.p3}</p>
                </>
              ) : (
                arte?.impacto_fisico && (
                  <p className="text-[#888888] leading-relaxed">{arte?.impacto_fisico}</p>
                )
              )}
            </div>

            {/* Mapa muscular (2/5) */}
            {tieneMapa ? (
              <div className="lg:col-span-2 card-gold p-5 space-y-4">
                <MuscleMap artSlug={params.slug} view="both" size="sm" />

                {/* Pills de músculos */}
                <div className="space-y-2">
                  {layers.map(layer => (
                    <div key={layer.label}>
                      <p className="text-[10px] uppercase tracking-widest mb-1.5"
                        style={{ color: layer.color }}>
                        {layer.label}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {layer.muscles.map(m => (
                          <span
                            key={m}
                            className="text-[10px] px-2 py-0.5 border font-medium capitalize"
                            style={{
                              borderColor: `${layer.color}40`,
                              color: layer.color,
                              background: `${layer.color}10`,
                            }}
                          >
                            {m.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#333333] italic">
                  Basado en análisis de movimiento de competidores de élite
                </p>
              </div>
            ) : (
              arte?.impacto_fisico && !textos && (
                <div className="lg:col-span-2 card p-5">
                  <p className="text-xs text-[#d4a017] uppercase tracking-widest mb-2">Impacto físico</p>
                  <p className="text-sm text-[#888888]">{arte?.impacto_fisico}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 4 — ESTADÍSTICAS ════════════════════════════ */}
      {stats && isKnown && (
        <section id="estadisticas" className="py-16 border-b border-[#1a1a1a]">
          <div className="page-container max-w-3xl">
            <div className="mb-8">
              <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Perfil</p>
              <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                Cómo es este arte
              </h2>
            </div>

            <div className="card p-6 space-y-5">
              {(Object.entries(STATS_LABELS) as [keyof typeof stats, string][]).map(
                ([key, label]) => (
                  <StatBar key={key} label={label} value={stats[key]} />
                )
              )}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/comparar"
                className="text-xs text-[#555555] hover:text-[#d4a017] uppercase tracking-widest transition-colors"
              >
                Comparar {nombre} con otro arte →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ COMPATIBILIDAD CON LESIONES ════════════════════════ */}
      <section className="py-16 border-b border-[#1a1a1a]">
        <div className="page-container max-w-5xl">
          <div className="mb-8">
            <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Seguridad</p>
            <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
              Compatibilidad con lesiones
            </h2>
          </div>
          <div className="card p-5 lg:p-6">
            <CompatibilidadTabla items={arte?.compatibilidades ?? []} modo="por-arte" />
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 5 — FAQ ══════════════════════════════════════ */}
      {faq.length > 0 && (
        <section id="faq" className="py-16 border-b border-[#1a1a1a]">
          <div className="page-container max-w-3xl">
            <div className="mb-8">
              <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold mb-1">
                Preguntas frecuentes
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                Lo que todo el mundo pregunta sobre {nombre}
              </h2>
            </div>
            <ArteAccordion items={faq} />
          </div>
        </section>
      )}

      {/* ═══ SECCIÓN GIMNASIOS CERCANOS ══════════════════════════ */}
      <section id="gimnasios" className="py-16 border-b border-[#1a1a1a]">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] text-[#d4a017] uppercase tracking-widest font-semibold mb-1">
                Directorio
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide">
                Gimnasios de {nombre}
              </h2>
            </div>
            <Link
              href={`/gimnasios?arte=${params.slug}`}
              className="text-xs text-[#555555] hover:text-[#d4a017] uppercase tracking-widest transition-colors hidden sm:block"
            >
              Ver todos →
            </Link>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <GymCardSkeleton key={i} />)}
            </div>
          }>
            <GimnasioCercanos arteSlug={params.slug} />
          </Suspense>

          <div className="mt-6 text-center sm:hidden">
            <Link href={`/gimnasios?arte=${params.slug}`} className="btn-ghost text-xs">
              Ver todos los gimnasios →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 6 — CTA FINAL ═══════════════════════════════ */}
      <section
        className="py-20 relative overflow-hidden"
        style={{
          backgroundImage: patron ? `${patron}, linear-gradient(to bottom, #0a0a0a, #111111)` : undefined,
          backgroundSize:  '50px 50px, auto',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(196,30,30,0.08) 0%, transparent 60%)',
          }}
        />
        <div className="page-container text-center relative z-10 max-w-2xl">
          <p className="text-[11px] text-[#555555] uppercase tracking-widest mb-3">
            ¿Ya lo tienes claro?
          </p>
          <h2 className="font-display text-4xl lg:text-5xl text-white uppercase tracking-wide mb-4">
            Empieza con {nombre}
          </h2>
          <p className="text-[#888888] leading-relaxed mb-8 max-w-md mx-auto">
            {ctaText}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/buscar?arte=${params.slug}`} className="btn-primary w-full sm:w-auto">
              Buscar gimnasios de {nombre} cerca de mí →
            </Link>
            <Link href="/test" className="btn-secondary w-full sm:w-auto">
              Hacer el test — 2 min
            </Link>
          </div>
          <p className="text-[10px] text-[#333333] uppercase tracking-widest mt-6">
            {compatibles} lesiones compatibles · {incompatibles} contraindicadas
          </p>
        </div>
      </section>
    </>
  );
}
