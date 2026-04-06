'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Post } from '@/types';

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState({
    titulo: '', slug: '', resumen: '', contenido: '',
    imagen_portada: '', estado: 'borrador', etiquetas: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const data = await api.get<Post[]>('/posts?page=1&limit=50').catch(() => []);
    setPosts(data);
  }

  function slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value, ...(name === 'titulo' ? { slug: slugify(value) } : {}) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const etiquetas = form.etiquetas.split(',').map(t => t.trim()).filter(Boolean);
      await api.post('/posts', { ...form, etiquetas }, getToken() ?? '');
      setMsg('✅ Post creado');
      setForm({ titulo: '', slug: '', resumen: '', contenido: '', imagen_portada: '', estado: 'borrador', etiquetas: '' });
      cargar();
    } catch (err: unknown) {
      setMsg(`❌ ${err instanceof Error ? err.message : 'Error'}`);
    } finally { setLoading(false); }
  }

  const estadoColor: Record<string, string> = {
    publicado: 'badge-green', borrador: 'badge-gray', archivado: 'badge-red',
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Blog — Posts</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Nuevo post</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Título *</label>
              <input name="titulo" value={form.titulo} onChange={onChange} required className="input" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Slug (auto)</label>
              <input name="slug" value={form.slug} onChange={onChange} required className="input font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Resumen</label>
              <textarea name="resumen" value={form.resumen} onChange={onChange} rows={2} className="input resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Contenido (HTML) *</label>
              <textarea name="contenido" value={form.contenido} onChange={onChange} required rows={6} className="input resize-none font-mono text-xs" placeholder="<p>Texto del artículo...</p>" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">URL imagen portada</label>
              <input name="imagen_portada" value={form.imagen_portada} onChange={onChange} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Etiquetas (separadas por coma)</label>
              <input name="etiquetas" value={form.etiquetas} onChange={onChange} className="input" placeholder="boxeo, lesiones, consejos" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Estado</label>
              <select name="estado" value={form.estado} onChange={onChange} className="input">
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicar ahora</option>
              </select>
            </div>
            {msg && <p className="text-sm">{msg}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Guardando...' : 'Crear post'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white mb-4">Posts publicados ({posts.length})</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {posts.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-800 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.titulo}</p>
                  <p className="text-xs text-gray-500">{p.autor_nombre}</p>
                </div>
                <span className={estadoColor[p.estado] ?? 'badge-gray'}>{p.estado}</span>
              </div>
            ))}
            {posts.length === 0 && <p className="text-gray-500 text-sm">No hay posts publicados.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
