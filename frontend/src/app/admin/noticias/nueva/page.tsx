'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { getToken } from '@/lib/auth'

const CATEGORIAS = ['boxeo', 'mma', 'judo', 'taekwondo', 'olimpico', 'wrestling', 'kickboxing']

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200)
}

export default function NuevaNoticiaPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    titulo: '', slug: '', subtitulo: '', contenido: '', resumen: '',
    imagen_url: '', imagen_alt: '', categoria: 'boxeo',
    autor: 'Redacción FightMatch', publicado: false, destacada: false,
  })
  const [slugManual, setSlugManual] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function onTituloChange(titulo: string) {
    set('titulo', titulo)
    if (!slugManual) set('slug', slugify(titulo))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo || !form.slug || !form.contenido || !form.categoria) {
      setError('Título, slug, contenido y categoría son obligatorios')
      return
    }
    setSaving(true)
    setError('')
    try {
      const token = getToken()
      const noticia = await api.post('/noticias', form, token ?? undefined)
      router.push('/admin/noticias')
      console.log('Noticia creada:', noticia)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full bg-[#111111] border border-[#2a2a2a] text-[#f0f0f0] placeholder-[#555555] px-3 py-2.5 text-sm focus:outline-none focus:border-[#d4a017] transition-colors'
  const labelClass = 'block text-xs text-[#888888] uppercase tracking-widest font-semibold mb-1.5'

  return (
    <div className="py-14">
      <div className="page-container max-w-4xl">
        <nav className="text-xs text-[#888888] mb-6 flex items-center gap-2 uppercase tracking-widest font-semibold">
          <Link href="/admin" className="hover:text-[#d4a017] transition-colors">Admin</Link>
          <span>/</span>
          <Link href="/admin/noticias" className="hover:text-[#d4a017] transition-colors">Noticias</Link>
          <span>/</span>
          <span className="text-[#f0f0f0]">Nueva</span>
        </nav>

        <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Admin</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide mb-8">Nueva noticia</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fila: titulo + slug */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Título *</label>
              <input
                type="text"
                className={inputClass}
                value={form.titulo}
                onChange={e => onTituloChange(e.target.value)}
                placeholder="Título del artículo (60-70 caracteres ideal)"
                maxLength={300}
              />
              <p className="text-[10px] text-[#555555] mt-1">{form.titulo.length} / 300 caracteres</p>
            </div>
            <div>
              <label className={labelClass}>Slug * (auto-generado)</label>
              <input
                type="text"
                className={inputClass}
                value={form.slug}
                onChange={e => { setSlugManual(true); set('slug', e.target.value) }}
                placeholder="url-del-articulo"
                maxLength={200}
              />
              <p className="text-[10px] text-[#555555] mt-1">
                URL: /noticias/<strong className="text-[#d4a017]">{form.slug || 'slug'}</strong>
              </p>
            </div>
          </div>

          {/* Subtítulo */}
          <div>
            <label className={labelClass}>Subtítulo</label>
            <input
              type="text"
              className={inputClass}
              value={form.subtitulo}
              onChange={e => set('subtitulo', e.target.value)}
              placeholder="Amplía el titular con contexto (100-120 caracteres ideal)"
              maxLength={400}
            />
          </div>

          {/* Resumen */}
          <div>
            <label className={labelClass}>Resumen / Meta description</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.resumen}
              onChange={e => set('resumen', e.target.value)}
              placeholder="Párrafo de 150-160 caracteres para SEO"
              maxLength={500}
            />
            <p className="text-[10px] text-[#555555] mt-1">{form.resumen.length} / 500 caracteres</p>
          </div>

          {/* Contenido */}
          <div>
            <label className={labelClass}>Contenido HTML *</label>
            <textarea
              className={`${inputClass} font-mono text-xs`}
              rows={16}
              value={form.contenido}
              onChange={e => set('contenido', e.target.value)}
              placeholder="<p>Contenido en HTML...</p><h2>Subtítulo</h2><p>...</p>"
            />
            <p className="text-[10px] text-[#555555] mt-1">
              ~{Math.round(form.contenido.replace(/<[^>]+>/g, '').split(/\s+/).length)} palabras
            </p>
          </div>

          {/* Fila: imagen */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>URL de imagen (opcional)</label>
              <input
                type="url"
                className={inputClass}
                value={form.imagen_url}
                onChange={e => set('imagen_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>Alt de imagen (SEO)</label>
              <input
                type="text"
                className={inputClass}
                value={form.imagen_alt}
                onChange={e => set('imagen_alt', e.target.value)}
                placeholder="Descripción para SEO (80-100 chars)"
                maxLength={200}
              />
            </div>
          </div>

          {/* Fila: categoría + autor */}
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
                placeholder="Redacción FightMatch"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.publicado}
                onChange={e => set('publicado', e.target.checked)}
                className="w-4 h-4 accent-[#d4a017]"
              />
              <span className="text-sm text-[#f0f0f0]">Publicar</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.destacada}
                onChange={e => set('destacada', e.target.checked)}
                className="w-4 h-4 accent-[#d4a017]"
              />
              <span className="text-sm text-[#f0f0f0]">Destacada (aparece en hero)</span>
            </label>
          </div>

          {error && <p className="text-[#c41e1e] text-sm">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 px-8"
            >
              {saving ? 'Guardando...' : 'Crear noticia'}
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
