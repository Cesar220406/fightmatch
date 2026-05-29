'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { getToken, isEditor } from '@/lib/auth'
import type { Noticia } from '@/types'

const CATEGORIAS = ['boxeo', 'mma', 'judo', 'taekwondo', 'olimpico', 'wrestling', 'kickboxing']

export default function EditarNoticiaPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [form, setForm] = useState<Partial<Noticia> & { contenido: string }>({
    titulo: '', subtitulo: '', contenido: '', resumen: '',
    imagen_url: '', imagen_alt: '', categoria: 'boxeo',
    autor: 'Redacción FightMatch', publicado: false, destacada: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditor()) { router.push('/auth/login'); return }
    const token = getToken()
    // Fetch from admin endpoint to get unpublished too
    api.get<Noticia>(`/noticias/${params.slug}`, token ?? undefined)
      .then(n => {
        setForm({
          titulo:       n.titulo,
          subtitulo:    n.subtitulo ?? '',
          contenido:    n.contenido ?? '',
          resumen:      n.resumen ?? '',
          imagen_url:   n.imagen_url ?? '',
          imagen_alt:   n.imagen_alt ?? '',
          categoria:    n.categoria,
          autor:        n.autor,
          publicado:    n.publicado,
          destacada:    n.destacada,
        })
      })
      .catch(() => setError('No se pudo cargar la noticia'))
      .finally(() => setLoading(false))
  }, [params.slug, router])

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const token = getToken()
      await api.put(`/noticias/${params.slug}`, form, token ?? undefined)
      router.push('/admin/noticias')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full bg-[#111111] border border-[#2a2a2a] text-[#f0f0f0] placeholder-[#555555] px-3 py-2.5 text-sm focus:outline-none focus:border-[#d4a017] transition-colors'
  const labelClass = 'block text-xs text-[#888888] uppercase tracking-widest font-semibold mb-1.5'

  if (loading) {
    return (
      <div className="py-14">
        <div className="page-container max-w-4xl">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-[#111111] border border-[#1a1a1a]" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-14">
      <div className="page-container max-w-4xl">
        <nav className="text-xs text-[#888888] mb-6 flex items-center gap-2 uppercase tracking-widest font-semibold">
          <Link href="/admin" className="hover:text-[#d4a017] transition-colors">Admin</Link>
          <span>/</span>
          <Link href="/admin/noticias" className="hover:text-[#d4a017] transition-colors">Noticias</Link>
          <span>/</span>
          <span className="text-[#f0f0f0]">Editar</span>
        </nav>

        <div className="flex items-center gap-4 mb-8">
          <div>
            <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Admin</p>
            <h1 className="font-display text-4xl text-white uppercase tracking-wide">Editar noticia</h1>
          </div>
          <Link
            href={`/noticias/${params.slug}`}
            target="_blank"
            className="ml-auto text-xs text-[#888888] hover:text-[#d4a017] transition-colors uppercase tracking-widest"
          >
            Ver en web →
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClass}>Título *</label>
            <input
              type="text"
              className={inputClass}
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              maxLength={300}
            />
          </div>

          <div>
            <label className={labelClass}>Subtítulo</label>
            <input
              type="text"
              className={inputClass}
              value={form.subtitulo}
              onChange={e => set('subtitulo', e.target.value)}
              maxLength={400}
            />
          </div>

          <div>
            <label className={labelClass}>Resumen / Meta description</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.resumen}
              onChange={e => set('resumen', e.target.value)}
              maxLength={500}
            />
            <p className="text-[10px] text-[#555555] mt-1">{form.resumen?.length ?? 0} / 500</p>
          </div>

          <div>
            <label className={labelClass}>Contenido HTML *</label>
            <textarea
              className={`${inputClass} font-mono text-xs`}
              rows={18}
              value={form.contenido}
              onChange={e => set('contenido', e.target.value)}
            />
            <p className="text-[10px] text-[#555555] mt-1">
              ~{Math.round((form.contenido?.replace(/<[^>]+>/g, '') ?? '').split(/\s+/).length)} palabras
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>URL de imagen</label>
              <input
                type="url"
                className={inputClass}
                value={form.imagen_url}
                onChange={e => set('imagen_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>Alt de imagen</label>
              <input
                type="text"
                className={inputClass}
                value={form.imagen_alt}
                onChange={e => set('imagen_alt', e.target.value)}
                maxLength={200}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Categoría *</label>
              <select
                className={inputClass}
                value={form.categoria}
                onChange={e => set('categoria', e.target.value)}
              >
                {CATEGORIAS.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Autor</label>
              <input
                type="text"
                className={inputClass}
                value={form.autor}
                onChange={e => set('autor', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.publicado ?? false}
                onChange={e => set('publicado', e.target.checked)}
                className="w-4 h-4 accent-[#d4a017]"
              />
              <span className="text-sm text-[#f0f0f0]">Publicar</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.destacada ?? false}
                onChange={e => set('destacada', e.target.checked)}
                className="w-4 h-4 accent-[#d4a017]"
              />
              <span className="text-sm text-[#f0f0f0]">Destacada</span>
            </label>
          </div>

          {error && <p className="text-[#c41e1e] text-sm">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 px-8"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link href="/admin/noticias" className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
