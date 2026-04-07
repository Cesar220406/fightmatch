'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Gimnasio, ArteMarcial } from '@/types';

export default function AdminGimnasios() {
  const [gimnasios, setGimnasios] = useState<Gimnasio[]>([]);
  const [artes, setArtes] = useState<ArteMarcial[]>([]);
  const [form, setForm] = useState({
    nombre: '', slug: '', descripcion: '', direccion: '',
    ciudad: '', provincia: '', codigo_postal: '', telefono: '',
    email_contacto: '', sitio_web: '', precio_desde: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Gimnasio[]>('/gimnasios').catch(() => []),
      api.get<ArteMarcial[]>('/artes-marciales').catch(() => []),
    ]).then(([g, a]) => { setGimnasios(g); setArtes(a); });
  }, []);

  function slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value, ...(name === 'nombre' ? { slug: slugify(value) } : {}) }));
  }

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await api.delete(`/gimnasios/${id}`, getToken() ?? '');
      const data = await api.get<Gimnasio[]>('/gimnasios').catch(() => []);
      setGimnasios(data);
    } catch (err: unknown) {
      alert(`Error al eliminar: ${err instanceof Error ? err.message : 'Error'}`);
    }
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
      setForm({ nombre: '', slug: '', descripcion: '', direccion: '', ciudad: '', provincia: '', codigo_postal: '', telefono: '', email_contacto: '', sitio_web: '', precio_desde: '' });
      const data = await api.get<Gimnasio[]>('/gimnasios').catch(() => []);
      setGimnasios(data);
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  const fields = [
    { name: 'nombre',         label: 'Nombre *',        ph: 'Gimnasio MMA Madrid',  req: true },
    { name: 'slug',           label: 'Slug (auto)',      ph: 'gimnasio-mma-madrid',  req: true },
    { name: 'ciudad',         label: 'Ciudad',           ph: 'Madrid' },
    { name: 'provincia',      label: 'Provincia',        ph: 'Madrid' },
    { name: 'direccion',      label: 'Dirección',        ph: 'Calle Mayor 1' },
    { name: 'codigo_postal',  label: 'Código Postal',    ph: '28001' },
    { name: 'telefono',       label: 'Teléfono',         ph: '600000000' },
    { name: 'email_contacto', label: 'Email contacto',   ph: 'info@gimnasio.com' },
    { name: 'sitio_web',      label: 'Sitio web',        ph: 'https://...' },
    { name: 'precio_desde',   label: 'Precio desde (€)', ph: '45' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Gestión</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide">Gimnasios</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
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
            {msg && (
              <p className={`text-xs font-semibold uppercase tracking-wider ${msg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {msg}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Guardando...' : 'Crear gimnasio'}
            </button>
          </form>
        </div>

        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #d4a017' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-5">
            Gimnasios <span className="text-[#d4a017]">({gimnasios.length})</span>
          </h2>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {gimnasios.map((g, i) => (
              <div
                key={g.id}
                className="flex items-center justify-between px-3 py-2.5 border border-[#1a1a1a]"
                style={{ backgroundColor: i % 2 === 0 ? '#111111' : '#0d0d0d' }}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm font-medium text-[#f0f0f0]">{g.nombre}</p>
                  <p className="text-xs text-[#444444]">{g.ciudad}</p>
                </div>
                {g.verificado && <span className="badge-green mr-2">Verificado</span>}
                <button
                  onClick={() => eliminar(g.id, g.nombre)}
                  className="text-xs text-[#666666] hover:text-red-400 transition-colors px-2 py-1 uppercase tracking-wider shrink-0"
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
