export const dynamic = 'force-dynamic';

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
    <div className="py-14">
      <div className="page-container max-w-3xl">

        {/* Breadcrumb */}
        <nav className="text-xs text-[#888888] mb-8 flex items-center gap-2 uppercase tracking-widest font-semibold">
          <Link href="/blog" className="hover:text-[#d4a017] transition-colors">Blog</Link>
          <span className="text-[#2a2a2a]">/</span>
          <span className="text-[#f0f0f0] truncate max-w-xs normal-case tracking-normal">{post.titulo}</span>
        </nav>

        {/* Etiquetas */}
        {post.etiquetas && post.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.etiquetas.map((t) => (
              <Link key={t} href={`/blog?etiqueta=${t}`} className="badge-gold hover:bg-[#d4a017]/20 transition-colors">
                {t}
              </Link>
            ))}
          </div>
        )}

        {/* Título */}
        <h1 className="font-display text-4xl lg:text-6xl text-white uppercase tracking-wide leading-none mb-6">
          {post.titulo}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-[#888888] mb-10 pb-6 border-b border-[#2a2a2a]">
          {post.autor_avatar && (
            <img
              src={post.autor_avatar}
              alt={post.autor_nombre}
              className="h-8 w-8 bg-[#1a1a1a]"
            />
          )}
          <span className="font-medium text-[#f0f0f0]">{post.autor_nombre}</span>
          <span className="text-[#2a2a2a]">·</span>
          <span>{formatFecha(post.publicado_en)}</span>
        </div>

        {/* Imagen portada */}
        {post.imagen_portada && (
          <div className="aspect-video overflow-hidden bg-[#111111] mb-10">
            <img src={post.imagen_portada} alt={post.titulo} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Contenido */}
        <div
          className="prose prose-invert prose-gray max-w-none
                     prose-headings:text-white prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wide
                     prose-a:text-[#d4a017] prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-white prose-code:text-[#c41e1e]"
          dangerouslySetInnerHTML={{ __html: post.contenido ?? '' }}
        />

        {/* Volver */}
        <div className="mt-14 pt-8 border-t border-[#2a2a2a]">
          <Link href="/blog" className="btn-secondary">
            ← Volver al blog
          </Link>
        </div>
      </div>
    </div>
  );
}
