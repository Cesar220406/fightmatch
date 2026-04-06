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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { etiqueta?: string; page?: string };
}) {
  const qs = new URLSearchParams();
  if (searchParams.etiqueta) qs.set('etiqueta', searchParams.etiqueta);
  qs.set('page', searchParams.page ?? '1');

  const posts = await api.get<Post[]>(`/posts?${qs.toString()}`).catch(() => [] as Post[]);

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

        {posts.length === 0 ? (
          <p className="text-[#888888] text-center py-20 text-sm uppercase tracking-widest">
            No hay artículos publicados todavía.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
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
                    <div className="flex h-full items-center justify-center text-4xl text-[#333333]">📝</div>
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
      </div>
    </div>
  );
}
