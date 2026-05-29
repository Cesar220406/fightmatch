export const revalidate = 86400;

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Noticia } from '@/types';
import { api } from '@/lib/api';
import { CAT_COLORS } from '../page';

/* Helpers */

const CAT_LABELS: Record<string, string> = {
  boxeo: 'Boxeo', mma: 'MMA', judo: 'Judo', taekwondo: 'Taekwondo',
  olimpico: 'Olímpico', wrestling: 'Wrestling', kickboxing: 'Kickboxing',
};

const ARTE_MAP: Record<string, string> = {
  boxeo: 'boxeo', mma: 'mma', judo: 'judo', taekwondo: 'taekwondo',
  wrestling: 'wrestling', kickboxing: 'kickboxing', olimpico: 'boxeo',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* Metadata */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const n = await api.get<Noticia>(`/noticias/${params.slug}`).catch(() => null);
  if (!n) return { title: 'Noticia no encontrada' };

  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fightmatch.duckdns.org';

  return {
    title: `${n.titulo} | Fight News by FightMatch`,
    description: n.resumen ?? n.subtitulo ?? n.titulo,
    alternates: { canonical: `${BASE}/noticias/${n.slug}` },
    openGraph: {
      title: n.titulo,
      description: n.resumen ?? n.subtitulo ?? '',
      type: 'article',
      publishedTime: n.fecha_publicacion,
      authors: [n.autor],
      images: n.imagen_url ? [{ url: n.imagen_url, alt: n.imagen_alt ?? n.titulo }] : [],
    },
  };
}

/* Share button (client island) */
// Import del componente de share, si existe
import ShareButton from '@/components/ShareButton';

/* Página */

export default async function NoticiaPage({ params }: { params: { slug: string } }) {
  const [noticia, relacionadas] = await Promise.all([
    api.get<Noticia>(`/noticias/${params.slug}`).catch(() => null),
    api.get<Noticia[]>(`/noticias?limit=20`).catch(() => [] as Noticia[]),
  ]);

  if (!noticia) notFound();

  // Relacionadas: misma categoría, excluyendo la actual
  const related = relacionadas
    .filter((n) => n.categoria === noticia.categoria && n.slug !== noticia.slug)
    .slice(0, 3);

  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fightmatch.duckdns.org';
  const canonicalUrl = `${BASE}/noticias/${noticia.slug}`;
  const catColor = CAT_COLORS[noticia.categoria] ?? '#888888';
  const arteSlug = ARTE_MAP[noticia.categoria] ?? noticia.categoria;
  const catLabel = CAT_LABELS[noticia.categoria] ?? noticia.categoria;
  const tiempoLectura = noticia.tiempo_lectura ?? Math.ceil((noticia.contenido?.length ?? 0) / 800);

  /* JSON-LD NewsArticle */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: noticia.titulo,
    description: noticia.resumen ?? noticia.subtitulo ?? '',
    author: { '@type': 'Person', name: noticia.autor },
    publisher: {
      '@type': 'Organization',
      name: 'FightMatch',
      url: BASE,
    },
    datePublished: noticia.fecha_publicacion,
    dateModified: noticia.fecha_publicacion,
    url: canonicalUrl,
    ...(noticia.imagen_url
      ? { image: { '@type': 'ImageObject', url: noticia.imagen_url, description: noticia.imagen_alt } }
      : {}),
    articleSection: catLabel,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-[#0a0a0a]">
        {/* Hero */}
        <div
          className="relative overflow-hidden"
          style={{ minHeight: 420 }}
        >
          {noticia.imagen_url ? (
            <img
              src={noticia.imagen_url}
              alt={noticia.imagen_alt ?? noticia.titulo}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, #0a0a0a 0%, ${catColor}22 100%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />

          <div
            className="relative z-10 flex flex-col justify-end page-container py-14"
            style={{ minHeight: 420 }}
          >
            {/* Breadcrumb */}
            <nav className="text-[10px] text-[#555555] mb-6 flex items-center gap-2 uppercase tracking-widest font-semibold">
              <Link href="/" className="hover:text-[#d4a017] transition-colors">Inicio</Link>
              <span>/</span>
              <Link href="/noticias" className="hover:text-[#d4a017] transition-colors">Noticias</Link>
              <span>/</span>
              <Link
                href={`/noticias/categoria/${noticia.categoria}`}
                className="hover:text-[#d4a017] transition-colors"
                style={{ color: catColor }}
              >
                {catLabel}
              </Link>
            </nav>

            {/* Badge */}
            <span
              className="inline-block text-xs px-3 py-1 font-bold uppercase tracking-widest mb-4 w-fit"
              style={{ background: catColor, color: '#fff' }}
            >
              {catLabel}
            </span>

            <h1
              className="font-display text-3xl sm:text-5xl lg:text-6xl text-white uppercase tracking-wide leading-tight max-w-4xl"
              style={{ textShadow: '0 2px 30px rgba(0,0,0,0.9)' }}
            >
              {noticia.titulo}
            </h1>

            {noticia.subtitulo && (
              <p className="text-[#cccccc] text-base lg:text-lg mt-4 max-w-3xl leading-relaxed">
                {noticia.subtitulo}
              </p>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div
          className="border-b border-[#1a1a1a]"
          style={{ borderTop: `3px solid ${catColor}` }}
        >
          <div className="page-container py-4">
            <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-xs text-[#888888]">
              <span className="flex items-center gap-1.5 font-semibold text-[#f0f0f0]">
                <svg className="w-3.5 h-3.5 text-[#d4a017]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                {noticia.autor}
              </span>
              <span className="hidden sm:block text-[#2a2a2a]">|</span>
              <span>{formatDate(noticia.fecha_publicacion)}</span>
              <span className="hidden sm:block text-[#2a2a2a]">|</span>
              <span>{tiempoLectura} min de lectura</span>
              <span className="hidden sm:block text-[#2a2a2a]">|</span>
              <span>{noticia.views.toLocaleString('es-ES')} lecturas</span>
              <div className="ml-auto">
                <ShareButton
                  title={noticia.titulo}
                  url={canonicalUrl}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Layout: artículo + lateral */}
        <div className="page-container py-10">
          <div className="grid lg:grid-cols-4 gap-10">
            {/* Contenido principal */}
            <div className="lg:col-span-3">
              {/* Prose content */}
              <div
                className="prose prose-invert prose-sm lg:prose-base max-w-none
                  prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wide
                  prose-headings:text-white prose-headings:text-2xl
                  prose-p:text-[#cccccc] prose-p:leading-relaxed
                  prose-a:text-[#d4a017] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-blockquote:border-l-[#c41e1e]
                  prose-blockquote:text-[#888888]"
                dangerouslySetInnerHTML={{ __html: noticia.contenido ?? '' }}
              />

              {/* Banner contextual → buscar gimnasios */}
              <div
                className="mt-10 p-6 border flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{ borderColor: catColor, borderLeftWidth: 4 }}
              >
                <div className="flex-1">
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">
                    Practica {catLabel} en España
                  </p>
                  <p className="text-sm text-[#f0f0f0]">
                    ¿Buscas gimnasios de{' '}
                    <strong className="text-white">{catLabel}</strong> cerca de ti?
                    FightMatch tiene la mayor base de datos de centros verificados en España.
                  </p>
                </div>
                <Link
                  href={`/buscar?arte=${arteSlug}`}
                  className="btn-primary shrink-0 text-xs py-2.5 px-5 whitespace-nowrap"
                >
                  Buscar gimnasios →
                </Link>
              </div>

              {/* Artículos relacionados */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h2
                    className="font-display text-2xl text-white uppercase tracking-widest mb-6 pb-4"
                    style={{ borderBottom: `2px solid ${catColor}` }}
                  >
                    También te puede interesar
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-5">
                    {related.map((n) => (
                      <Link
                        key={n.slug}
                        href={`/noticias/${n.slug}`}
                        className="group block border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors"
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
                              style={{
                                background: `linear-gradient(135deg, #111 0%, ${catColor}22 100%)`,
                              }}
                            />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-[#f0f0f0] font-medium leading-snug group-hover:text-[#d4a017] transition-colors line-clamp-3">
                            {n.titulo}
                          </p>
                          <p className="text-[10px] text-[#555555] mt-1.5 uppercase tracking-widest">
                            {formatDate(n.fecha_publicacion)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Info del artículo */}
              <div className="card-gold p-5">
                <p className="text-[10px] text-[#888888] uppercase tracking-widest mb-3">
                  Sobre este artículo
                </p>
                <div className="space-y-2 text-xs text-[#888888]">
                  <div className="flex justify-between">
                    <span>Categoría</span>
                    <span className="font-bold" style={{ color: catColor }}>
                      {catLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Autor</span>
                    <span className="text-[#f0f0f0]">{noticia.autor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lectura</span>
                    <span className="text-[#f0f0f0]">{tiempoLectura} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lecturas</span>
                    <span className="text-[#f0f0f0]">
                      {noticia.views.toLocaleString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Test */}
              <div className="border border-[#2a2a2a] p-5">
                <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">
                  ¿No sabes cuál elegir?
                </p>
                <p className="text-sm text-[#f0f0f0] mb-4 leading-relaxed">
                  Descubre qué arte marcial encaja con tu cuerpo y personalidad.
                </p>
                <Link
                  href="/test"
                  className="block text-center text-xs py-2 px-4 font-bold uppercase tracking-widest transition-colors"
                  style={{ background: catColor, color: '#fff' }}
                >
                  Hacer el test →
                </Link>
              </div>

              {/* Navegación noticias */}
              <div>
                <Link
                  href="/noticias"
                  className="text-xs text-[#888888] hover:text-[#d4a017] transition-colors uppercase tracking-widest font-semibold"
                >
                  ← Volver a Noticias
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
