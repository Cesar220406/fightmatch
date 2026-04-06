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
    <div className="py-12">
      <div className="page-container">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold text-white mb-3">Blog</h1>
          <p className="text-gray-400">
            Consejos, guías y novedades sobre artes marciales, lesiones deportivas y entrenamiento adaptado.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-20">No hay artículos publicados todavía.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="card group flex flex-col gap-4 hover:shadow-lg hover:shadow-brand-900/20"
              >
                {/* Imagen */}
                <div className="aspect-video overflow-hidden rounded-lg bg-gray-800">
                  {post.imagen_portada ? (
                    <img
                      src={post.imagen_portada}
                      alt={post.titulo}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-gray-600">📝</div>
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
                <h2 className="font-semibold text-white leading-snug group-hover:text-brand-400 transition">
                  {post.titulo}
                </h2>

                {post.resumen && (
                  <p className="text-sm text-gray-400 line-clamp-2">{post.resumen}</p>
                )}

                {/* Meta */}
                <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-800">
                  <span>{post.autor_nombre}</span>
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
