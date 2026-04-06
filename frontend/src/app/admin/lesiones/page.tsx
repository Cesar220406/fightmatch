'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Lesion } from '@/types';

const zonas = ['rodilla', 'hombro', 'columna', 'tobillo', 'codo', 'muñeca', 'cadera', 'otra'];
const severidades = ['leve', 'moderada', 'grave'] as const;

export default function AdminLesiones() {
  const [lesiones, setLesiones] = useState<Lesion[]>([]);
  const [form, setForm] = useState({ nombre: '', slug: '', descripcion: '', zona_corporal: 'rodilla', severidad: 'leve' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const data = await api.get<Lesion[]>('/lesiones').catch(() => []);
    setLesiones(data);
  }

  function slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value, ...(name === 'nombre' ? { slug: slugify(value) } : {}) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.post('/lesiones', form, getToken() ?? '');
      setMsg('✅ Lesión creada');
      setForm({ nombre: '', slug: '', descripcion: '', zona_corporal: 'rodilla', severidad: 'leve' });
      cargar();
    } catch (err: unknown) {
      setMsg(`❌ ${err instanceof Error ? err.message : 'Error'}`);
    } finally { setLoading(false); }
  }

  const severidadColor: Record<string, string> = {
    leve: 'badge-green', moderada: 'badge-yellow', grave: 'badge-red',
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Lesiones</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Nueva lesión</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={onChange} required className="input" placeholder="Rotura de LCA" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Slug (auto)</label>
              <input name="slug" value={form.slug} onChange={onChange} required className="input font-mono text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Zona corporal</label>
                <select name="zona_corporal" value={form.zona_corporal} onChange={onChange} className="input">
                  {zonas.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Severidad</label>
                <select name="severidad" value={form.severidad} onChange={onChange} className="input">
                  {severidades.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={2} className="input resize-none" />
            </div>
            {msg && <p className="text-sm">{msg}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Guardando...' : 'Crear lesión'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white mb-4">Existentes ({lesiones.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {lesiones.map(l => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border border-gray-800 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-white">{l.nombre}</p>
                  <p className="text-xs text-gray-500">{l.zona_corporal}</p>
                </div>
                <span className={severidadColor[l.severidad] ?? 'badge-gray'}>{l.severidad}</span>
              </div>
            ))}
            {lesiones.length === 0 && <p className="text-gray-500 text-sm">Sin datos. Ejecuta el seed.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
