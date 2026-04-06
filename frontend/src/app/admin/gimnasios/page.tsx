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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.post('/gimnasios', {
        ...form,
        precio_desde: form.precio_desde ? Number(form.precio_desde) : null,
      }, getToken() ?? '');
      setMsg('✅ Gimnasio creado');
      setForm({ nombre: '', slug: '', descripcion: '', direccion: '', ciudad: '', provincia: '', codigo_postal: '', telefono: '', email_contacto: '', sitio_web: '', precio_desde: '' });
      const data = await api.get<Gimnasio[]>('/gimnasios').catch(() => []);
      setGimnasios(data);
    } catch (err: unknown) {
      setMsg(`❌ ${err instanceof Error ? err.message : 'Error'}`);
    } finally { setLoading(false); }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Gimnasios</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Nuevo gimnasio</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            {[
              { name: 'nombre',        label: 'Nombre *',       ph: 'Gimnasio MMA Madrid', req: true },
              { name: 'slug',          label: 'Slug (auto)',     ph: 'gimnasio-mma-madrid', req: true },
              { name: 'ciudad',        label: 'Ciudad',          ph: 'Madrid' },
              { name: 'provincia',     label: 'Provincia',       ph: 'Madrid' },
              { name: 'direccion',     label: 'Dirección',       ph: 'Calle Mayor 1' },
              { name: 'codigo_postal', label: 'Código Postal',   ph: '28001' },
              { name: 'telefono',      label: 'Teléfono',        ph: '600000000' },
              { name: 'email_contacto',label: 'Email contacto',  ph: 'info@gimnasio.com' },
              { name: 'sitio_web',     label: 'Sitio web',       ph: 'https://...' },
              { name: 'precio_desde',  label: 'Precio desde (€)',ph: '45' },
            ].map(({ name, label, ph, req }) => (
              <div key={name}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input name={name} value={(form as Record<string, string>)[name]} onChange={onChange} required={req} className="input" placeholder={ph} />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3} className="input resize-none" />
            </div>
            {msg && <p className="text-sm">{msg}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Guardando...' : 'Crear gimnasio'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white mb-4">Gimnasios ({gimnasios.length})</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {gimnasios.map(g => (
              <div key={g.id} className="flex items-center justify-between rounded-lg border border-gray-800 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-white">{g.nombre}</p>
                  <p className="text-xs text-gray-500">{g.ciudad}</p>
                </div>
                {g.verificado && <span className="badge-green">Verificado</span>}
              </div>
            ))}
            {gimnasios.length === 0 && <p className="text-gray-500 text-sm">No hay gimnasios.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
