'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { ArteMarcial } from '@/types';

const EMPTY = { nombre: '', slug: '', descripcion: '', imagen_url: '', impacto_fisico: '' };

export default function AdminArtes() {
  const [artes, setArtes]         = useState<ArteMarcial[]>([]);
  const [form, setForm]           = useState({ ...EMPTY });
  const [editItem, setEditItem]   = useState<ArteMarcial | null>(null);
  const [editForm, setEditForm]   = useState({ ...EMPTY });
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');

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
    setForm(f => ({ ...f, [name]: value, ...(name === 'nombre' ? { slug: slugify(value) } : {}) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.post('/artes-marciales', form, getToken() ?? '');
      setMsg('Arte marcial creada correctamente.');
      setForm({ ...EMPTY });
      cargar();
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  function seleccionarEditar(a: ArteMarcial) {
    setEditItem(a);
    setEditForm({
      nombre:        a.nombre ?? '',
      slug:          a.slug ?? '',
      descripcion:   a.descripcion ?? '',
      imagen_url:    (a as unknown as Record<string, string>).imagen_url ?? '',
      impacto_fisico: a.impacto_fisico ?? '',
    });
    setMsg('');
  }

  function onEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  }

  async function onEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    setLoading(true); setMsg('');
    try {
      await api.put(`/artes-marciales/${editItem.id}`, editForm, getToken() ?? '');
      setMsg('Arte marcial actualizada correctamente.');
      setEditItem(null);
      cargar();
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  async function eliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción es irreversible.`)) return;
    try {
      await api.delete(`/artes-marciales/${id}`, getToken() ?? '');
      cargar();
    } catch (err: unknown) {
      setMsg(`Error al eliminar: ${err instanceof Error ? err.message : 'Error'}`);
    }
  }

  const formFields = [
    { name: 'nombre',        label: 'Nombre *',      ph: 'Boxeo',          req: true },
    { name: 'slug',          label: 'Slug (auto)',    ph: 'boxeo',          req: true },
    { name: 'imagen_url',    label: 'Imagen URL',     ph: 'https://...' },
    { name: 'impacto_fisico',label: 'Impacto físico', ph: 'Alta intensidad...', textarea: true },
    { name: 'descripcion',   label: 'Descripción',    ph: 'Arte marcial de...', textarea: true },
  ];

  function FormFields({ values, onChange: oc }: { values: Record<string, string>, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
    return (
      <>
        {formFields.map(({ name, label, ph, req, textarea }) => (
          <div key={name}>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">{label}</label>
            {textarea ? (
              <textarea name={name} value={values[name]} onChange={oc} rows={2} className="input resize-none" placeholder={ph} />
            ) : (
              <input name={name} value={values[name]} onChange={oc} required={req} className="input" placeholder={ph} />
            )}
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Gestión</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide">Artes Marciales</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: crear o editar */}
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
              <form onSubmit={onEditSubmit} className="space-y-4">
                <FormFields values={editForm as Record<string, string>} onChange={onEditChange} />
                {msg && <p className={`text-xs font-semibold uppercase tracking-wider ${msg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Guardando...' : 'Guardar cambios'}</button>
              </form>
            </div>
          ) : (
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #c41e1e' }}>
              <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">Nueva arte marcial</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormFields values={form as Record<string, string>} onChange={onChange} />
                {msg && <p className={`text-xs font-semibold uppercase tracking-wider ${msg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Guardando...' : 'Crear arte marcial'}</button>
              </form>
            </div>
          )}
        </div>

        {/* Right: list */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #d4a017' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">
            Existentes <span className="text-[#d4a017]">({artes.length})</span>
          </h2>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {artes.map((a, i) => (
              <div
                key={a.id}
                className="flex items-center gap-2 px-3 py-2.5 border border-[#1a1a1a]"
                style={{ backgroundColor: i % 2 === 0 ? '#111111' : '#0d0d0d' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#f0f0f0]">{a.nombre}</p>
                  <p className="text-xs text-[#444444] font-mono">{a.slug}</p>
                </div>
                <button
                  onClick={() => seleccionarEditar(a)}
                  className="text-xs text-[#d4a017] hover:text-[#e8b520] transition-colors px-1.5 py-1 uppercase tracking-wider shrink-0"
                >
                  ✎
                </button>
                <button
                  onClick={() => eliminar(a.id, a.nombre)}
                  className="text-xs text-[#555555] hover:text-red-400 transition-colors px-1.5 py-1 uppercase tracking-wider shrink-0"
                >
                  ×
                </button>
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
