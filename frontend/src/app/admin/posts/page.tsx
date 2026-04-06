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
      setMsg('Post creado correctamente.');
      setForm({ titulo: '', slug: '', resumen: '', contenido: '', imagen_portada: '', estado: 'borrador', etiquetas: '' });
      cargar();
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  const estadoColor: Record<string, string> = {
    publicado: 'badge-green', borrador: 'badge-gray', archivado: 'badge-red',
  };

  return (
    <div className="p-8">
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Gestión</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide">Blog — Posts</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #c41e1e' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">Nuevo post</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            {[
              { name: 'titulo',         label: 'Título *',              type: 'input',    req: true },
              { name: 'slug',           label: 'Slug (auto)',           type: 'input',    req: true },
              { name: 'resumen',        label: 'Resumen',               type: 'textarea', rows: 2 },
              { name: 'imagen_portada', label: 'URL imagen portada',    type: 'input',    ph: 'https://...' },
              { name: 'etiquetas',      label: 'Etiquetas (coma sep.)', type: 'input',    ph: 'boxeo, lesiones' },
            ].map(({ name, label, type, req, rows, ph }) => (
              <div key={name}>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">{label}</label>
                {type === 'textarea' ? (
                  <textarea name={name} value={(form as Record<string, string>)[name]} onChange={onChange} rows={rows ?? 2} className="input resize-none" />
                ) : (
                  <input name={name} value={(form as Record<string, string>)[name]} onChange={onChange} required={req} className="input" placeholder={ph} />
                )}
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Contenido (HTML) *</label>
              <textarea name="contenido" value={form.contenido} onChange={onChange} required rows={6} className="input resize-none font-mono text-xs" placeholder="<p>Texto del artículo...</p>" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Estado</label>
              <select name="estado" value={form.estado} onChange={onChange} className="input bg-[#111111]">
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicar ahora</option>
              </select>
            </div>

            {msg && (
              <p className={`text-xs font-semibold uppercase tracking-wider ${msg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {msg}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Guardando...' : 'Crear post'}
            </button>
          </form>
        </div>

        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #d4a017' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">
            Posts <span className="text-[#d4a017]">({posts.length})</span>
          </h2>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {posts.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2.5 border border-[#1a1a1a]"
                style={{ backgroundColor: i % 2 === 0 ? '#111111' : '#0d0d0d' }}
              >
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-[#f0f0f0] truncate">{p.titulo}</p>
                  <p className="text-xs text-[#444444]">{p.autor_nombre}</p>
                </div>
                <span className={estadoColor[p.estado] ?? 'badge-gray'}>{p.estado}</span>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-xs text-[#888888] uppercase tracking-widest py-4">No hay posts publicados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
