export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { api } from '@/lib/api';
import type { Post } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Blog' };

function formatFecha(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function BlogIcon() {
  return (
    <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-9 opacity-20">
      <rect x="4" y="4" width="72" height="52" stroke="#d4a017" strokeWidth="1.5"/>
      <line x1="14" y1="18" x2="66" y2="18" stroke="#d4a017" strokeWidth="1.5"/>
      <line x1="14" y1="28" x2="66" y2="28" stroke="#d4a017" strokeWidth="1"/>
      <line x1="14" y1="36" x2="50" y2="36" stroke="#d4a017" strokeWidth="1"/>
      <line x1="14" y1="44" x2="56" y2="44" stroke="#d4a017" strokeWidth="1"/>
      <line x1="4" y1="12" x2="76" y2="12" stroke="#c41e1e" strokeWidth="2" opacity="0.6"/>
    </svg>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { etiqueta?: string; page?: string };
}) {
  const qs = new URLSearchParams();
  if (searchParams.etiqueta) qs.set('etiqueta', searchParams.etiqueta);
  qs.set('page', searchParams.page ?? '1');

  const PAGE_LIMIT = 10;
  qs.set('limit', String(PAGE_LIMIT));
  const posts = await api.get<Post[]>(`/posts?${qs.toString()}`).catch(() => [] as Post[]);

  const page = Number(searchParams.page ?? 1);
  const hasMore = posts.length === PAGE_LIMIT;
  const hasPrev = page > 1;

  function pageUrl(p: number) {
    const q = new URLSearchParams();
    if (searchParams.etiqueta) q.set('etiqueta', searchParams.etiqueta);
    q.set('page', String(p));
    return `/blog?${q.toString()}`;
  }

  const [featured, ...rest] = posts;

  return (
    <div className="py-14">
      <div className="page-container">

        <div className="mb-12">
          <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Contenido</p>
          <h1 className="font-display text-5xl lg:text-7xl text-white uppercase tracking-wide mb-4">
            Blog
          </h1>
          <p className="text-[#888888] max-w-xl leading-relaxed">
            Consejos, guías y novedades sobre artes marciales, lesiones deportivas y entrenamiento adaptado.
          </p>
        </div>

        {/* Tag filter */}
        {searchParams.etiqueta && (
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs text-[#888888] uppercase tracking-widest">Etiqueta:</span>
            <span className="badge-gold">{searchParams.etiqueta}</span>
            <a href="/blog" className="text-xs text-[#666666] hover:text-[#d4a017] transition-colors uppercase tracking-widest">
              × Limpiar
            </a>
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-[#888888] text-center py-20 text-sm uppercase tracking-widest">
            No hay artículos publicados todavía.
          </p>
        ) : (
          <>
            {/* Featured post */}
            {featured && !searchParams.etiqueta && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group block mb-12 relative overflow-hidden"
                style={{ border: '1px solid #2a2a2a', borderLeft: '4px solid #c41e1e' }}
              >
                <div className="grid md:grid-cols-2">
                  {/* Image */}
                  <div className="aspect-video md:aspect-auto md:h-72 overflow-hidden bg-[#111111]">
                    {featured.imagen_portada ? (
                      <img
                        src={featured.imagen_portada}
                        alt={featured.titulo}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#0d0d0d]">
                        <BlogIcon />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col justify-between bg-[#0d0d0d]">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="badge-red text-xs">Destacado</span>
                        {featured.etiquetas?.slice(0, 2).map((t) => (
                          <span key={t} className="badge-gray">{t}</span>
                        ))}
                      </div>
                      <h2 className="font-display text-3xl lg:text-4xl text-white uppercase tracking-wide leading-tight mb-3 group-hover:text-[#d4a017] transition-colors">
                        {featured.titulo}
                      </h2>
                      {featured.resumen && (
                        <p className="text-sm text-[#888888] leading-relaxed line-clamp-3">
                          {featured.resumen}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2a2a2a] text-xs text-[#666666]">
                      <span>{featured.autor_nombre}</span>
                      <span>{formatFecha(featured.publicado_en)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest of posts grid */}
            {(searchParams.etiqueta ? posts.length > 0 : rest.length > 0) && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchParams.etiqueta ? posts : rest).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="card group flex flex-col gap-4"
                  >
                    {/* Imagen */}
                    <div className="aspect-video overflow-hidden bg-[#111111]">
                      {post.imagen_portada ? (
                        <img
                          src={post.imagen_portada}
                          alt={post.titulo}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#0d0d0d]">
                          <BlogIcon />
                        </div>
                      )}
                    </div>

                    {/* Etiquetas */}
                    {post.etiquetas && post.etiquetas.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.etiquetas.slice(0, 3).map((t) => (
                          <span key={t} className="badge-gray">{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Título */}
                    <h2 className="font-semibold text-[#f0f0f0] leading-snug group-hover:text-[#d4a017] transition-colors flex-1">
                      {post.titulo}
                    </h2>

                    {post.resumen && (
                      <p className="text-sm text-[#888888] line-clamp-2 leading-relaxed">{post.resumen}</p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-[#666666] pt-3 border-t border-[#2a2a2a]">
                      <span className="text-[#888888]">{post.autor_nombre}</span>
                      <span>{formatFecha(post.publicado_en)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
