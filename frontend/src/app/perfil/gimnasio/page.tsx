'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Gimnasio, ArteMarcial } from '@/types';

interface GimnasioConArtes extends Gimnasio {
  arte_ids?: number[];
}

interface Contacto {
  id: string;
  nombre: string;
  email: string;
  mensaje: string;
  leido: boolean;
  creado_en: string;
}

const EMPTY_FORM = {
  nombre: '', slug: '', descripcion: '', direccion: '',
  ciudad: '', provincia: '', codigo_postal: '', telefono: '',
  email_contacto: '', sitio_web: '', imagen_url: '', precio_desde: '',
};

export default function PerfilGimnasioPage() {
  const router = useRouter();
  const [gym, setGym]           = useState<GimnasioConArtes | null>(null);
  const [artes, setArtes]       = useState<ArteMarcial[]>([]);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [arteSel, setArteSel]   = useState<number[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [tab, setTab]           = useState<'datos' | 'artes' | 'mensajes'>('datos');
  const [loading, setLoading]   = useState(false);
  const [sinGym, setSinGym]     = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }

    Promise.all([
      api.get<GimnasioConArtes>('/gimnasios/mio', token),
      api.get<ArteMarcial[]>('/artes-marciales'),
    ]).then(([gymData, artesData]) => {
      setGym(gymData);
      setArtes(artesData);
      // Load contactos
      api.get<Contacto[]>(`/contactos?gimnasio_id=${gymData.id}`, token)
        .then(setContactos).catch(() => {});
      setForm({
        nombre:         gymData.nombre ?? '',
        slug:           gymData.slug ?? '',
        descripcion:    gymData.descripcion ?? '',
        direccion:      gymData.direccion ?? '',
        ciudad:         gymData.ciudad ?? '',
        provincia:      gymData.provincia ?? '',
        codigo_postal:  gymData.codigo_postal ?? '',
        telefono:       gymData.telefono ?? '',
        email_contacto: gymData.email_contacto ?? '',
        sitio_web:      gymData.sitio_web ?? '',
        imagen_url:     gymData.imagen_url ?? '',
        precio_desde:   gymData.precio_desde != null ? String(gymData.precio_desde) : '',
      });
      setArteSel(gymData.arte_ids ?? []);
    }).catch((err) => {
      if (err.message?.includes('ningún gimnasio') || err.message?.includes('404')) {
        setSinGym(true);
      } else {
        router.push('/auth/login');
      }
    });
  }, [router]);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function guardarDatos(e: React.FormEvent) {
    e.preventDefault();
    if (!gym) return;
    setLoading(true);
    try {
      await api.put(`/gimnasios/${gym.id}`, {
        ...form,
        precio_desde: form.precio_desde ? Number(form.precio_desde) : null,
      }, localStorage.getItem('token') ?? '');
      toast.success('Datos actualizados');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  async function guardarArtes(e: React.FormEvent) {
    e.preventDefault();
    if (!gym) return;
    setLoading(true);
    try {
      await api.put(`/gimnasios/${gym.id}/artes`, { arte_ids: arteSel }, localStorage.getItem('token') ?? '');
      toast.success('Artes marciales actualizadas');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  function toggleArte(id: number) {
    setArteSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  if (!gym && !sinGym) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs text-[#888888] uppercase tracking-widest">Cargando...</p>
      </div>
    );
  }

  if (sinGym) {
    return (
      <div className="py-14">
        <div className="page-container max-w-2xl text-center">
          <p className="font-display text-5xl text-[#2a2a2a] uppercase mb-4">Sin gimnasio</p>
          <p className="text-sm text-[#888888] mb-8 leading-relaxed">
            Tu cuenta tiene rol de gimnasio pero aún no tienes ningún gimnasio registrado en la plataforma.
          </p>
          <Link href="/perfil" className="btn-secondary mr-3">Volver al perfil</Link>
          <Link href="/admin/gimnasios" className="btn-primary">Crear gimnasio</Link>
        </div>
      </div>
    );
  }

  const fields = [
    { name: 'nombre',         label: 'Nombre',           ph: '' },
    { name: 'ciudad',         label: 'Ciudad',            ph: '' },
    { name: 'provincia',      label: 'Provincia',         ph: '' },
    { name: 'direccion',      label: 'Dirección',         ph: '' },
    { name: 'codigo_postal',  label: 'Código Postal',     ph: '' },
    { name: 'telefono',       label: 'Teléfono',          ph: '' },
    { name: 'email_contacto', label: 'Email de contacto', ph: '' },
    { name: 'sitio_web',      label: 'Sitio web',         ph: '' },
    { name: 'imagen_url',     label: 'Imagen URL',        ph: '' },
    { name: 'precio_desde',   label: 'Precio desde (€)',  ph: '' },
  ];

  return (
    <div className="py-14">
      <div className="page-container max-w-3xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Gestión</p>
            <h1 className="font-display text-5xl text-white uppercase tracking-wide">{gym!.nombre}</h1>
            {gym!.ciudad && (
              <p className="text-sm text-[#888888] mt-1">{gym!.ciudad}{gym!.provincia ? `, ${gym!.provincia}` : ''}</p>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Link href={`/gimnasios/${gym!.slug}`} className="btn-secondary text-xs">Ver página →</Link>
            <Link href="/perfil" className="btn-secondary text-xs">← Perfil</Link>
          </div>
        </div>

        {/* Verificado badge */}
        {gym!.verificado ? (
          <div className="flex items-center gap-2 mb-8 px-4 py-2 border border-emerald-800/40 bg-emerald-900/10 w-fit">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-emerald-400">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Gimnasio verificado</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-8 px-4 py-2 border border-[#d4a017]/20 bg-[#d4a017]/5 w-fit">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#d4a017]">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#d4a017]">Pendiente de verificación</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 mb-6" style={{ borderBottom: '1px solid #2a2a2a' }}>
          {(['datos', 'artes', 'mensajes'] as const).map((t) => {
            const unread = t === 'mensajes' ? contactos.filter(c => !c.leido).length : 0;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                  tab === t
                    ? 'border-[#c41e1e] text-white'
                    : 'border-transparent text-[#555555] hover:text-[#888888]'
                }`}
              >
                {t === 'datos' ? 'Datos' : t === 'artes' ? 'Artes marciales' : 'Mensajes'}
                {unread > 0 && (
                  <span className="bg-[#c41e1e] text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab: Datos */}
        {tab === 'datos' && (
          <div className="card">
            <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">Información pública</h2>
            <form onSubmit={guardarDatos} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {fields.map(({ name, label }) => (
                  <div key={name} className={name === 'descripcion' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">{label}</label>
                    <input
                      name={name}
                      value={(form as Record<string, string>)[name]}
                      onChange={onChange}
                      className="input"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={onChange}
                    rows={4}
                    className="input resize-none"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-[#2a2a2a]">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Guardando...' : 'Guardar datos'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Artes marciales */}
        {tab === 'artes' && (
          <div className="card">
            <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-2">Artes que impartís</h2>
            <p className="text-sm text-[#888888] mb-8 leading-relaxed">
              Selecciona las artes marciales que ofrece tu gimnasio. Esto determina qué usuarios con lesiones compatibles te encuentran.
            </p>
            <form onSubmit={guardarArtes} className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {artes.map((a) => {
                  const activa = arteSel.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleArte(a.id)}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
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
                {arteSel.length} arte{arteSel.length !== 1 ? 's' : ''} seleccionada{arteSel.length !== 1 ? 's' : ''}
              </p>
              <div className="pt-4 border-t border-[#2a2a2a]">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Guardando...' : 'Guardar artes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Mensajes */}
        {tab === 'mensajes' && (
          <div className="card">
            <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">
              Mensajes recibidos
              {contactos.filter(c => !c.leido).length > 0 && (
                <span className="ml-3 text-sm font-sans font-normal text-[#c41e1e] normal-case tracking-normal">
                  {contactos.filter(c => !c.leido).length} sin leer
                </span>
              )}
            </h2>
            {contactos.length === 0 ? (
              <p className="text-sm text-[#888888] uppercase tracking-widest py-8 text-center">
                No hay mensajes todavía.
              </p>
            ) : (
              <div className="space-y-3">
                {contactos.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 border border-[#2a2a2a]"
                    style={{ backgroundColor: c.leido ? '#0d0d0d' : '#111111', borderLeft: c.leido ? '1px solid #2a2a2a' : '3px solid #c41e1e' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-[#f0f0f0]">{c.nombre}</span>
                          <a href={`mailto:${c.email}`} className="text-xs text-[#888888] hover:text-[#d4a017] transition-colors">
                            {c.email}
                          </a>
                          {!c.leido && <span className="badge-red text-[10px]">Nuevo</span>}
                        </div>
                        <p className="text-sm text-[#888888] leading-relaxed">{c.mensaje}</p>
                        <p className="text-xs text-[#444444] mt-2">
                          {new Date(c.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!c.leido && (
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('token') ?? '';
                            await api.patch(`/contactos/${c.id}/leido`, {}, token).catch(() => {});
                            setContactos(prev => prev.map(x => x.id === c.id ? { ...x, leido: true } : x));
                          }}
                          className="text-xs text-[#888888] hover:text-[#d4a017] uppercase tracking-wider shrink-0 transition-colors"
                        >
                          Marcar leído
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
