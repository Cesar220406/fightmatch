'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Gimnasio, ArteMarcial } from '@/types';

type Tab = 'crear' | 'editar' | 'artes';

const EMPTY_FORM = {
  nombre: '', slug: '', descripcion: '', direccion: '',
  ciudad: '', provincia: '', codigo_postal: '', telefono: '',
  email_contacto: '', sitio_web: '', imagen_url: '', precio_desde: '',
};

export default function AdminGimnasios() {
  const [gimnasios, setGimnasios] = useState<Gimnasio[]>([]);
  const [artes, setArtes]         = useState<ArteMarcial[]>([]);
  const [tab, setTab]             = useState<Tab>('crear');
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');

  // Crear
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Editar
  const [editGym, setEditGym]   = useState<Gimnasio | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });

  // Artes
  const [artesGymId, setArtesGymId]   = useState('');
  const [artesSelected, setArtesSelected] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Gimnasio[]>('/gimnasios').catch(() => []),
      api.get<ArteMarcial[]>('/artes-marciales').catch(() => []),
    ]).then(([g, a]) => { setGimnasios(g); setArtes(a); });
  }, []);

  function slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  async function recargar() {
    const data = await api.get<Gimnasio[]>('/gimnasios').catch(() => []);
    setGimnasios(data);
  }

  // ── CREAR ────────────────────────────────────────────────
  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value, ...(name === 'nombre' ? { slug: slugify(value) } : {}) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.post('/gimnasios', {
        ...form,
        precio_desde: form.precio_desde ? Number(form.precio_desde) : null,
      }, getToken() ?? '');
      setMsg('Gimnasio creado correctamente.');
      setForm({ ...EMPTY_FORM });
      await recargar();
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  // ── EDITAR ───────────────────────────────────────────────
  function seleccionarEditar(g: Gimnasio) {
    setEditGym(g);
    setEditForm({
      nombre:        g.nombre ?? '',
      slug:          g.slug ?? '',
      descripcion:   g.descripcion ?? '',
      direccion:     g.direccion ?? '',
      ciudad:        g.ciudad ?? '',
      provincia:     g.provincia ?? '',
      codigo_postal: g.codigo_postal ?? '',
      telefono:      g.telefono ?? '',
      email_contacto: g.email_contacto ?? '',
      sitio_web:     g.sitio_web ?? '',
      imagen_url:    g.imagen_url ?? '',
      precio_desde:  g.precio_desde != null ? String(g.precio_desde) : '',
    });
    setTab('editar');
    setMsg('');
  }

  function onEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  }

  async function onEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editGym) return;
    setLoading(true); setMsg('');
    try {
      await api.put(`/gimnasios/${editGym.id}`, {
        ...editForm,
        precio_desde: editForm.precio_desde ? Number(editForm.precio_desde) : null,
      }, getToken() ?? '');
      setMsg('Gimnasio actualizado correctamente.');
      await recargar();
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  // ── ARTES ────────────────────────────────────────────────
  async function seleccionarArtes(gymId: string) {
    setArtesGymId(gymId);
    setTab('artes');
    setMsg('');
    try {
      const ids = await api.get<number[]>(`/gimnasios/${gymId}/artes`).catch(() => []);
      setArtesSelected(ids);
    } catch { setArtesSelected([]); }
  }

  function toggleArte(id: number) {
    setArtesSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function guardarArtes(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.put(`/gimnasios/${artesGymId}/artes`, { arte_ids: artesSelected }, getToken() ?? '');
      setMsg('Artes marciales actualizadas.');
      await recargar();
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await api.delete(`/gimnasios/${id}`, getToken() ?? '');
      await recargar();
    } catch (err: unknown) {
      alert(`Error al eliminar: ${err instanceof Error ? err.message : 'Error'}`);
    }
  }

  const fields = [
    { name: 'nombre',         label: 'Nombre *',         ph: 'Gimnasio MMA Madrid', req: true },
    { name: 'slug',           label: 'Slug (auto)',       ph: 'gimnasio-mma-madrid', req: true },
    { name: 'ciudad',         label: 'Ciudad',            ph: 'Madrid' },
    { name: 'provincia',      label: 'Provincia',         ph: 'Madrid' },
    { name: 'direccion',      label: 'Dirección',         ph: 'Calle Mayor 1' },
    { name: 'codigo_postal',  label: 'Código Postal',     ph: '28001' },
    { name: 'telefono',       label: 'Teléfono',          ph: '600000000' },
    { name: 'email_contacto', label: 'Email contacto',    ph: 'info@gimnasio.com' },
    { name: 'sitio_web',      label: 'Sitio web',         ph: 'https://...' },
    { name: 'imagen_url',     label: 'Imagen URL',        ph: 'https://...' },
    { name: 'precio_desde',   label: 'Precio desde (€)',  ph: '45' },
  ];

  const artesGymNombre = gimnasios.find(g => g.id === artesGymId)?.nombre ?? '';

  return (
    <div className="p-8">
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Gestión</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide">Gimnasios</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left panel: tabs */}
        <div>
          {/* Tab bar */}
          <div className="flex gap-0 mb-6" style={{ borderBottom: '1px solid #1a1a1a' }}>
            {(['crear', 'editar', 'artes'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setMsg(''); }}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-[#c41e1e] text-white'
                    : 'border-transparent text-[#555555] hover:text-[#888888]'
                }`}
              >
                {t === 'crear' ? 'Nuevo' : t === 'editar' ? 'Editar' : 'Artes marciales'}
              </button>
            ))}
          </div>

          {/* Tab: Crear */}
          {tab === 'crear' && (
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #c41e1e' }}>
              <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">Nuevo gimnasio</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                {fields.map(({ name, label, ph, req }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">{label}</label>
                    <input
                      name={name}
                      value={(form as Record<string, string>)[name]}
                      onChange={onChange}
                      required={req}
                      className="input"
                      placeholder={ph}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    rows={3}
                    className="input resize-none"
                  />
                </div>
                {msg && <p className={`text-xs font-semibold uppercase tracking-wider ${msg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Guardando...' : 'Crear gimnasio'}</button>
              </form>
            </div>
          )}

          {/* Tab: Editar */}
          {tab === 'editar' && (
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #d4a017' }}>
              {!editGym ? (
                <p className="text-xs text-[#666666] uppercase tracking-widest py-4">
                  Selecciona un gimnasio de la lista para editarlo.
                </p>
              ) : (
                <>
                  <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">
                    Editar: <span className="text-[#d4a017]">{editGym.nombre}</span>
                  </h2>
                  <form onSubmit={onEditSubmit} className="space-y-4">
                    {fields.map(({ name, label, ph, req }) => (
                      <div key={name}>
                        <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">{label}</label>
                        <input
                          name={name}
                          value={(editForm as Record<string, string>)[name]}
                          onChange={onEditChange}
                          required={req}
                          className="input"
                          placeholder={ph}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={editForm.descripcion}
                        onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))}
                        rows={3}
                        className="input resize-none"
                      />
                    </div>
                    {msg && <p className={`text-xs font-semibold uppercase tracking-wider ${msg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>}
                    <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Guardando...' : 'Guardar cambios'}</button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Tab: Artes marciales */}
          {tab === 'artes' && (
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #c41e1e' }}>
              {!artesGymId ? (
                <p className="text-xs text-[#666666] uppercase tracking-widest py-4">
                  Selecciona un gimnasio de la lista para gestionar sus artes marciales.
                </p>
              ) : (
                <>
                  <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">
                    Artes: <span className="text-[#d4a017]">{artesGymNombre}</span>
                  </h2>
                  <form onSubmit={guardarArtes} className="space-y-3">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artes.map((a) => {
                        const activa = artesSelected.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggleArte(a.id)}
                            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
                              activa
                                ? 'bg-[#c41e1e] border-[#c41e1e] text-white'
                                : 'bg-transparent border-[#2a2a2a] text-[#666666] hover:border-[#d4a017] hover:text-[#d4a017]'
                            }`}
                            style={{ borderRadius: 0 }}
                          >
                            {a.nombre}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-[#555555] uppercase tracking-widest">
                      {artesSelected.length} arte{artesSelected.length !== 1 ? 's' : ''} seleccionada{artesSelected.length !== 1 ? 's' : ''}
                    </p>
                    {msg && <p className={`text-xs font-semibold uppercase tracking-wider ${msg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>}
                    <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Guardando...' : 'Guardar artes'}</button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right panel: list */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #d4a017' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">
            Gimnasios <span className="text-[#d4a017]">({gimnasios.length})</span>
          </h2>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {gimnasios.map((g, i) => (
              <div
                key={g.id}
                className="flex items-center gap-2 px-3 py-2.5 border border-[#1a1a1a]"
                style={{ backgroundColor: i % 2 === 0 ? '#111111' : '#0d0d0d' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#f0f0f0] truncate">{g.nombre}</p>
                  <p className="text-xs text-[#444444]">{g.ciudad}</p>
                </div>
                {g.verificado && <span className="badge-green shrink-0">V</span>}
                <button
                  onClick={() => seleccionarEditar(g)}
                  className="text-xs text-[#d4a017] hover:text-[#e8b520] transition-colors px-1.5 py-1 uppercase tracking-wider shrink-0"
                  title="Editar"
                >
                  ✎
                </button>
                <button
                  onClick={() => seleccionarArtes(g.id)}
                  className="text-xs text-[#888888] hover:text-[#c41e1e] transition-colors px-1.5 py-1 uppercase tracking-wider shrink-0"
                  title="Gestionar artes"
                >
                  🥋
                </button>
                <button
                  onClick={() => eliminar(g.id, g.nombre)}
                  className="text-xs text-[#555555] hover:text-red-400 transition-colors px-1.5 py-1 uppercase tracking-wider shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
            {gimnasios.length === 0 && (
              <p className="text-xs text-[#888888] uppercase tracking-widest py-4">No hay gimnasios.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
