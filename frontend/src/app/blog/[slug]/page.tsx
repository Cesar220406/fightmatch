import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Post } from '@/types';
import type { Metadata } from 'next';

async function getPost(slug: string) {
  return api.get<Post>(`/posts/${slug}`).catch(() => null);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Artículo no encontrado' };
  return { title: post.titulo, description: post.resumen };
}

function formatFecha(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default async function BlogDetallePage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="py-12">
      <div className="page-container max-w-3xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/blog" className="hover:text-white transition">Blog</Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-xs">{post.titulo}</span>
        </nav>

        {/* Etiquetas */}
        {post.etiquetas && post.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.etiquetas.map((t) => (
              <Link key={t} href={`/blog?etiqueta=${t}`} className="badge-gray hover:bg-gray-700 transition">
                {t}
              </Link>
            ))}
          </div>
        )}

        {/* Título */}
        <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
          {post.titulo}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-800">
          {post.autor_avatar && (
            <img
              src={post.autor_avatar}
              alt={post.autor_nombre}
              className="h-8 w-8 rounded-full bg-gray-700"
            />
          )}
          <span className="font-medium text-gray-300">{post.autor_nombre}</span>
          <span className="text-gray-600">·</span>
          <span>{formatFecha(post.publicado_en)}</span>
        </div>

        {/* Imagen portada */}
        {post.imagen_portada && (
          <div className="aspect-video overflow-hidden rounded-2xl bg-gray-800 mb-8">
            <img src={post.imagen_portada} alt={post.titulo} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Contenido */}
        <div
          className="prose prose-invert prose-gray max-w-none
                     prose-headings:text-white prose-a:text-brand-400
                     prose-strong:text-white prose-code:text-brand-300"
          dangerouslySetInnerHTML={{ __html: post.contenido ?? '' }}
        />

        {/* Volver */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link href="/blog" className="btn-secondary">
            ← Volver al blog
          </Link>
        </div>
      </div>
    </div>
  );
}
