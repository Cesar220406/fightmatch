'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { ArteMarcial } from '@/types';

export default function AdminArtes() {
  const [artes, setArtes] = useState<ArteMarcial[]>([]);
  const [form, setForm] = useState({ nombre: '', slug: '', descripcion: '', impacto_fisico: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const data = await api.get<ArteMarcial[]>('/artes-marciales').catch(() => []);
    setArtes(data);
  }

  function slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'nombre' ? { slug: slugify(value) } : {}),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.post('/artes-marciales', form, getToken() ?? '');
      setMsg('✅ Arte marcial creada');
      setForm({ nombre: '', slug: '', descripcion: '', impacto_fisico: '' });
      cargar();
    } catch (err: unknown) {
      setMsg(`❌ ${err instanceof Error ? err.message : 'Error'}`);
    } finally { setLoading(false); }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Artes Marciales</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Nueva arte marcial</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={onChange} required className="input" placeholder="Boxeo" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Slug (auto)</label>
              <input name="slug" value={form.slug} onChange={onChange} required className="input font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={2} className="input resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Impacto físico</label>
              <textarea name="impacto_fisico" value={form.impacto_fisico} onChange={onChange} rows={2} className="input resize-none" />
            </div>
            {msg && <p className="text-sm">{msg}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Guardando...' : 'Crear arte marcial'}
            </button>
          </form>
        </div>

        {/* Listado */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Existentes ({artes.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {artes.map(a => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-800 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-white">{a.nombre}</p>
                  <p className="text-xs text-gray-500 font-mono">{a.slug}</p>
                </div>
              </div>
            ))}
            {artes.length === 0 && <p className="text-gray-500 text-sm">Sin datos. Ejecuta el seed.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
