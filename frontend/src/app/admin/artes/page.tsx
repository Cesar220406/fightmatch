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
      setMsg('Arte marcial creada correctamente.');
      setForm({ nombre: '', slug: '', descripcion: '', impacto_fisico: '' });
      cargar();
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  return (
    <div className="p-8">
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Gestión</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide">Artes Marciales</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #c41e1e' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">Nueva arte marcial</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={onChange} required className="input" placeholder="Boxeo" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Slug (auto)</label>
              <input name="slug" value={form.slug} onChange={onChange} required className="input font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={2} className="input resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Impacto físico</label>
              <textarea name="impacto_fisico" value={form.impacto_fisico} onChange={onChange} rows={2} className="input resize-none" />
            </div>
            {msg && (
              <p className={`text-xs font-semibold uppercase tracking-wider ${msg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {msg}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Guardando...' : 'Crear arte marcial'}
            </button>
          </form>
        </div>

        {/* Listado */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #d4a017' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">
            Existentes <span className="text-[#d4a017]">({artes.length})</span>
          </h2>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {artes.map((a, i) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-3 py-2.5 border border-[#1a1a1a]"
                style={{ backgroundColor: i % 2 === 0 ? '#111111' : '#0d0d0d' }}
              >
                <div>
                  <p className="text-sm font-medium text-[#f0f0f0]">{a.nombre}</p>
                  <p className="text-xs text-[#444444] font-mono">{a.slug}</p>
                </div>
              </div>
            ))}
            {artes.length === 0 && (
              <p className="text-xs text-[#888888] uppercase tracking-widest py-4">Sin datos. Ejecuta el seed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
