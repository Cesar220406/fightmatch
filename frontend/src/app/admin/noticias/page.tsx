'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { getToken, isEditor } from '@/lib/auth'
import type { Noticia } from '@/types'

const CAT_COLORS: Record<string, string> = {
  boxeo: '#c41e1e', mma: '#d85a30', judo: '#4a90e2',
  taekwondo: '#8b0000', olimpico: '#d4a017', wrestling: '#52b788', kickboxing: '#7c5cbf',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminNoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!isEditor()) { router.push('/auth/login'); return }
    const token = getToken()
    api.get<Noticia[]>('/noticias/admin/todas', token ?? undefined)
      .then(setNoticias)
      .catch(() => setError('No se pudieron cargar las noticias'))
      .finally(() => setLoading(false))
  }, [router])

  async function togglePublicar(slug: string) {
    const token = getToken()
    try {
      const updated = await api.patch<{ slug: string; publicado: boolean }>(
        `/noticias/${slug}/publicar`, {}, token ?? undefined
      )
      setNoticias(prev =>
        prev.map(n => n.slug === slug ? { ...n, publicado: updated.publicado } : n)
      )
    } catch {
      alert('Error al cambiar estado')
    }
  }

  async function borrar(slug: string) {
    if (!confirm(`¿Eliminar "${slug}"? Esta acción no se puede deshacer.`)) return
    const token = getToken()
    try {
      await api.delete(`/noticias/${slug}`, token ?? undefined)
      setNoticias(prev => prev.filter(n => n.slug !== slug))
    } catch {
      alert('Error al eliminar')
    }
  }

  return (
    <div className="py-14">
      <div className="page-container max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#888888] mb-6 flex items-center gap-2 uppercase tracking-widest font-semibold">
          <Link href="/admin" className="hover:text-[#d4a017] transition-colors">Admin</Link>
          <span className="text-[#2a2a2a]">/</span>
          <span className="text-[#f0f0f0]">Noticias</span>
        </nav>

        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Admin</p>
            <h1 className="font-display text-4xl text-white uppercase tracking-wide">Noticias</h1>
          </div>
          <Link href="/admin/noticias/nueva" className="btn-primary text-xs px-5 py-2.5">
            + Nueva noticia
          </Link>
        </div>

        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-14 bg-[#111111] border border-[#1a1a1a]" />
            ))}
          </div>
        )}

        {error && <p className="text-[#c41e1e] text-sm">{error}</p>}

        {!loading && noticias.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-[#555555]">No hay noticias todavía.</p>
            <Link href="/admin/noticias/nueva" className="text-[#d4a017] text-sm mt-3 inline-block">
              Crear la primera noticia →
            </Link>
          </div>
        )}

        {noticias.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-left">
                  {['Título', 'Categoría', 'Publicada', 'Destacada', 'Vistas', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} className="text-xs text-[#555555] uppercase tracking-widest font-semibold pb-3 pr-4 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {noticias.map(n => (
                  <tr key={n.slug} className="border-b border-[#111111] hover:bg-[#0d0d0d] transition-colors">
                    <td className="py-3 pr-4 max-w-xs">
                      <p className="text-[#f0f0f0] text-xs font-medium line-clamp-2 leading-snug">
                        {n.titulo}
                      </p>
                      <p className="text-[#555555] text-[10px] mt-0.5">{n.slug}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
                        style={{ background: CAT_COLORS[n.categoria] ?? '#333', color: '#fff' }}
                      >
                        {n.categoria}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => togglePublicar(n.slug)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 transition-colors ${
                          n.publicado
                            ? 'bg-[#52b788] text-black'
                            : 'bg-[#2a2a2a] text-[#888888] hover:bg-[#3a3a3a]'
                        }`}
                      >
                        {n.publicado ? 'Sí' : 'No'}
                      </button>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] ${n.destacada ? 'text-[#d4a017]' : 'text-[#555555]'}`}>
                        {n.destacada ? '★ Sí' : '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#888888] text-xs">
                      {n.views.toLocaleString('es-ES')}
                    </td>
                    <td className="py-3 pr-4 text-[#888888] text-xs whitespace-nowrap">
                      {formatDate(n.fecha_publicacion)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/noticias/${n.slug}`}
                          target="_blank"
                          className="text-[10px] text-[#888888] hover:text-[#d4a017] transition-colors uppercase tracking-widest"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/admin/noticias/${n.slug}/editar`}
                          className="text-[10px] text-[#888888] hover:text-[#f0f0f0] transition-colors uppercase tracking-widest"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => borrar(n.slug)}
                          className="text-[10px] text-[#888888] hover:text-[#c41e1e] transition-colors uppercase tracking-widest"
                        >
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
