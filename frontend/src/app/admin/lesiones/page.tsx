'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Lesion } from '@/types';

const zonas = ['rodilla', 'hombro', 'columna', 'tobillo', 'codo', 'muñeca', 'cadera', 'otra'];
const severidades = ['leve', 'moderada', 'grave'] as const;

const EMPTY = { nombre: '', slug: '', descripcion: '', zona_corporal: 'rodilla', severidad: 'leve' };

export default function AdminLesiones() {
  const [lesiones, setLesiones]   = useState<Lesion[]>([]);
  const [form, setForm]           = useState({ ...EMPTY });
  const [editItem, setEditItem]   = useState<Lesion | null>(null);
  const [editForm, setEditForm]   = useState({ ...EMPTY });
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');

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
      setMsg('Lesión creada correctamente.');
      setForm({ ...EMPTY });
      cargar();
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  function seleccionarEditar(l: Lesion) {
    setEditItem(l);
    setEditForm({
      nombre:       l.nombre ?? '',
      slug:         l.slug ?? '',
      descripcion:  l.descripcion ?? '',
      zona_corporal: l.zona_corporal ?? 'rodilla',
      severidad:    l.severidad ?? 'leve',
    });
    setMsg('');
  }

  function onEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  }

  async function onEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    setLoading(true); setMsg('');
    try {
      await api.put(`/lesiones/${editItem.id}`, editForm, getToken() ?? '');
      setMsg('Lesión actualizada correctamente.');
      setEditItem(null);
      cargar();
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  async function eliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await api.delete(`/lesiones/${id}`, getToken() ?? '');
      cargar();
    } catch (err: unknown) {
      setMsg(`Error al eliminar: ${err instanceof Error ? err.message : 'Error'}`);
    }
  }

  const severidadColor: Record<string, string> = {
    leve: 'badge-green', moderada: 'badge-yellow', grave: 'badge-red',
  };

  function LesionForm({ values, oc, submitLabel }: {
    values: typeof EMPTY,
    oc: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
    submitLabel: string,
  }) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Nombre *</label>
          <input name="nombre" value={values.nombre} onChange={oc} required className="input" placeholder="Rotura de LCA" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Slug (auto)</label>
          <input name="slug" value={values.slug} onChange={oc} required className="input font-mono text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Zona corporal</label>
            <select name="zona_corporal" value={values.zona_corporal} onChange={oc} className="input bg-[#111111]">
              {zonas.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Severidad</label>
            <select name="severidad" value={values.severidad} onChange={oc} className="input bg-[#111111]">
              {severidades.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Descripción</label>
          <textarea name="descripcion" value={values.descripcion} onChange={oc} rows={2} className="input resize-none" />
        </div>
        {msg && <p className={`text-xs font-semibold uppercase tracking-wider ${msg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Guardando...' : submitLabel}</button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Gestión</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide">Lesiones</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          {editItem ? (
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #d4a017' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl text-white uppercase tracking-wide">
                  Editar: <span className="text-[#d4a017]">{editItem.nombre}</span>
                </h2>
                <button onClick={() => { setEditItem(null); setMsg(''); }} className="text-xs text-[#555555] hover:text-[#888888] uppercase tracking-widest">
                  ✕ Cancelar
                </button>
              </div>
              <form onSubmit={onEditSubmit}>
                <LesionForm values={editForm} oc={onEditChange} submitLabel="Guardar cambios" />
              </form>
            </div>
          ) : (
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #c41e1e' }}>
              <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">Nueva lesión</h2>
              <form onSubmit={onSubmit}>
                <LesionForm values={form} oc={onChange} submitLabel="Crear lesión" />
              </form>
            </div>
          )}
        </div>

        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #d4a017' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">
            Existentes <span className="text-[#d4a017]">({lesiones.length})</span>
          </h2>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {lesiones.map((l, i) => (
              <div
                key={l.id}
                className="flex items-center gap-2 px-3 py-2.5 border border-[#1a1a1a]"
                style={{ backgroundColor: i % 2 === 0 ? '#111111' : '#0d0d0d' }}
              >
                <div className="flex-1 min-w-0 mr-1">
                  <p className="text-sm font-medium text-[#f0f0f0] truncate">{l.nombre}</p>
                  <p className="text-xs text-[#444444] capitalize">{l.zona_corporal}</p>
                </div>
                <span className={`${severidadColor[l.severidad] ?? 'badge-gray'} shrink-0`}>{l.severidad}</span>
                <button
                  onClick={() => seleccionarEditar(l)}
                  className="text-xs text-[#d4a017] hover:text-[#e8b520] transition-colors px-1.5 py-1 shrink-0"
                >
                  ✎
                </button>
                <button
                  onClick={() => eliminar(l.id, l.nombre)}
                  className="text-xs text-[#555555] hover:text-red-400 transition-colors px-1.5 py-1 shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
            {lesiones.length === 0 && (
              <p className="text-xs text-[#888888] uppercase tracking-widest py-4">Sin datos. Ejecuta el seed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
