'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Gimnasio, ArteMarcial } from '@/types';

interface GimnasioConArtes extends Gimnasio {
  arte_ids?: number[];
  horario?: Record<string, string>;
}

interface Contacto {
  id: string;
  nombre: string;
  email: string;
  mensaje: string;
  leido: boolean;
  creado_en: string;
}

interface Cliente {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  avatar_url: string | null;
  desde: string;
}

interface Trabajador {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  avatar_url: string | null;
  rol_equipo: string;
  creado_en: string;
}

interface Estadisticas {
  clientes_total: number;
  clientes_este_mes: number;
  artes_populares: { nombre: string; fans: number }[];
  mensajes_sin_leer: number;
}

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DIAS_LABEL: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

const EMPTY_FORM = {
  nombre: '', slug: '', descripcion: '', direccion: '',
  ciudad: '', provincia: '', codigo_postal: '', telefono: '',
  email_contacto: '', sitio_web: '', imagen_url: '', precio_desde: '',
};

type Tab = 'gimnasio' | 'artes' | 'clientes' | 'equipo' | 'estadisticas' | 'mensajes';

export default function PerfilGimnasioPage() {
  const router = useRouter();

  const [gym, setGym]               = useState<GimnasioConArtes | null>(null);
  const [artes, setArtes]           = useState<ArteMarcial[]>([]);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [arteSel, setArteSel]       = useState<number[]>([]);
  const [horario, setHorario]       = useState<Record<string, string>>({});
  const [contactos, setContactos]   = useState<Contacto[]>([]);
  const [clientes, setClientes]     = useState<Cliente[]>([]);
  const [equipo, setEquipo]         = useState<Trabajador[]>([]);
  const [stats, setStats]           = useState<Estadisticas | null>(null);
  const [tab, setTab]               = useState<Tab>('gimnasio');
  const [loading, setLoading]       = useState(false);
  const [sinGym, setSinGym]         = useState(false);
  const [busqCliente, setBusqCliente] = useState('');
  const [emailEquipo, setEmailEquipo] = useState('');
  const [rolEquipo, setRolEquipo]   = useState('entrenador');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }

    Promise.all([
      api.get<GimnasioConArtes>('/gimnasios/mio', token),
      api.get<ArteMarcial[]>('/artes-marciales'),
    ]).then(([gymData, artesData]) => {
      setGym(gymData);
      setArtes(artesData);
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
      setHorario(gymData.horario ?? {} as Record<string, string>);

      api.get<Contacto[]>(`/contactos?gimnasio_id=${gymData.id}`, token)
        .then(setContactos).catch(() => {});
    }).catch((err) => {
      if (err.message?.includes('ningún gimnasio') || err.message?.includes('404')) {
        setSinGym(true);
      } else {
        router.push('/auth/login');
      }
    });
  }, [router]);

  // Lazy-load tab data
  useEffect(() => {
    const token = localStorage.getItem('token') ?? '';
    if (tab === 'clientes' && clientes.length === 0) {
      api.get<Cliente[]>('/gimnasios/mio/clientes', token)
        .then(setClientes).catch(() => toast.error('Error al cargar clientes'));
    }
    if (tab === 'equipo' && equipo.length === 0) {
      api.get<Trabajador[]>('/gimnasios/mio/equipo', token)
        .then(setEquipo).catch(() => {});
    }
    if (tab === 'estadisticas' && !stats) {
      api.get<Estadisticas>('/gimnasios/mio/estadisticas', token)
        .then(setStats).catch(() => toast.error('Error al cargar estadísticas'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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
        horario: Object.keys(horario).length > 0 ? horario : null,
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

  async function añadirTrabajador(e: React.FormEvent) {
    e.preventDefault();
    if (!emailEquipo.trim()) return;
    setLoading(true);
    try {
      const nuevo = await api.post<Trabajador>('/gimnasios/mio/equipo',
        { email: emailEquipo.trim(), rol_equipo: rolEquipo },
        localStorage.getItem('token') ?? ''
      );
      setEquipo(prev => [...prev, nuevo]);
      setEmailEquipo('');
      toast.success('Trabajador añadido');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al añadir');
    } finally {
      setLoading(false);
    }
  }

  async function eliminarTrabajador(userId: string) {
    const token = localStorage.getItem('token') ?? '';
    try {
      await api.delete(`/gimnasios/mio/equipo/${userId}`, token);
      setEquipo(prev => prev.filter(t => t.id !== userId));
      toast.success('Trabajador eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  }

  function toggleArte(id: number) {
    setArteSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const clientesFiltrados = clientes.filter(c =>
    busqCliente === '' ||
    `${c.nombre} ${c.apellidos} ${c.email}`.toLowerCase().includes(busqCliente.toLowerCase())
  );

  const unreadCount = contactos.filter(c => !c.leido).length;

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
            Tu cuenta tiene rol de gimnasio pero aún no tienes ningún gimnasio registrado.
          </p>
          <Link href="/perfil" className="btn-secondary mr-3">Volver al perfil</Link>
          <Link href="/admin/gimnasios" className="btn-primary">Crear gimnasio</Link>
        </div>
      </div>
    );
  }

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'gimnasio',     label: 'Mi gimnasio' },
    { key: 'artes',        label: 'Artes' },
    { key: 'clientes',     label: 'Clientes' },
    { key: 'equipo',       label: 'Mi equipo' },
    { key: 'estadisticas', label: 'Estadísticas' },
    { key: 'mensajes',     label: 'Mensajes', badge: unreadCount },
  ];

  const fields = [
    { name: 'nombre',         label: 'Nombre' },
    { name: 'ciudad',         label: 'Ciudad' },
    { name: 'provincia',      label: 'Provincia' },
    { name: 'direccion',      label: 'Dirección' },
    { name: 'codigo_postal',  label: 'Código Postal' },
    { name: 'telefono',       label: 'Teléfono' },
    { name: 'email_contacto', label: 'Email de contacto' },
    { name: 'sitio_web',      label: 'Sitio web' },
    { name: 'imagen_url',     label: 'Imagen URL' },
    { name: 'precio_desde',   label: 'Precio desde (€)' },
  ];

  return (
    <div className="py-14">
      <div className="page-container max-w-4xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
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
        <div className="flex gap-0 mb-8 overflow-x-auto" style={{ borderBottom: '1px solid #2a2a2a' }}>
          {TABS.map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors border-b-2 -mb-px whitespace-nowrap flex items-center gap-1.5 ${
                tab === key
                  ? 'border-[#c41e1e] text-white'
                  : 'border-transparent text-[#555555] hover:text-[#888888]'
              }`}
            >
              {label}
              {badge != null && badge > 0 && (
                <span className="bg-[#c41e1e] text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: Mi Gimnasio ── */}
        {tab === 'gimnasio' && (
          <form onSubmit={guardarDatos} className="space-y-8">
            <div className="card">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">Información pública</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {fields.map(({ name, label }) => (
                  <div key={name}>
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
            </div>

            {/* Horarios */}
            <div className="card">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-2">Horarios</h2>
              <p className="text-xs text-[#555555] uppercase tracking-widest mb-6">
                Deja en blanco los días que el gimnasio esté cerrado
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {DIAS.map(dia => (
                  <div key={dia} className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#888888] w-20 shrink-0">
                      {DIAS_LABEL[dia]}
                    </span>
                    <input
                      type="text"
                      placeholder="09:00 – 21:00"
                      value={horario[dia] ?? ''}
                      onChange={e => setHorario(h => ({ ...h, [dia]: e.target.value }))}
                      className="input flex-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}

        {/* ── Tab: Artes marciales ── */}
        {tab === 'artes' && (
          <div className="card">
            <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-2">Artes que impartís</h2>
            <p className="text-sm text-[#888888] mb-8 leading-relaxed">
              Selecciona las artes marciales que ofrece tu gimnasio.
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

        {/* ── Tab: Clientes ── */}
        {tab === 'clientes' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide">
                Clientes
                <span className="ml-3 text-base font-sans font-normal text-[#555555] normal-case tracking-normal">
                  {clientes.length} total
                </span>
              </h2>
            </div>
            <div className="mb-5">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={busqCliente}
                onChange={e => setBusqCliente(e.target.value)}
                className="input max-w-xs"
              />
            </div>
            {clientesFiltrados.length === 0 ? (
              <p className="text-sm text-[#888888] uppercase tracking-widest py-10 text-center">
                {clientes.length === 0 ? 'Aún no tienes clientes.' : 'Sin resultados.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                      {['Nombre', 'Email', 'Desde'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold uppercase tracking-widest text-[#555555] pb-3 pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                        <td className="py-3 pr-6">
                          <span className="font-medium text-[#f0f0f0]">{c.nombre} {c.apellidos}</span>
                        </td>
                        <td className="py-3 pr-6">
                          <a href={`mailto:${c.email}`} className="text-[#888888] hover:text-[#d4a017] transition-colors">
                            {c.email}
                          </a>
                        </td>
                        <td className="py-3 text-[#555555]">
                          {new Date(c.desde).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Mi Equipo ── */}
        {tab === 'equipo' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">Añadir trabajador</h2>
              <form onSubmit={añadirTrabajador} className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Email del usuario</label>
                  <input
                    type="email"
                    value={emailEquipo}
                    onChange={e => setEmailEquipo(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Rol</label>
                  <select
                    value={rolEquipo}
                    onChange={e => setRolEquipo(e.target.value)}
                    className="input"
                  >
                    <option value="entrenador">Entrenador</option>
                    <option value="recepcionista">Recepcionista</option>
                    <option value="monitor">Monitor</option>
                    <option value="director">Director</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Añadiendo...' : 'Añadir'}
                </button>
              </form>
            </div>

            <div className="card">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">
                Equipo actual
                <span className="ml-3 text-base font-sans font-normal text-[#555555] normal-case tracking-normal">
                  {equipo.length} {equipo.length === 1 ? 'persona' : 'personas'}
                </span>
              </h2>
              {equipo.length === 0 ? (
                <p className="text-sm text-[#888888] uppercase tracking-widest py-8 text-center">
                  No hay trabajadores añadidos.
                </p>
              ) : (
                <div className="space-y-3">
                  {equipo.map(t => (
                    <div key={t.id} className="flex items-center justify-between gap-4 p-4 border border-[#2a2a2a]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-[#555555] uppercase">
                            {t.nombre[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#f0f0f0] text-sm">{t.nombre} {t.apellidos}</p>
                          <p className="text-xs text-[#555555]">{t.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest border border-[#d4a017]/30 text-[#d4a017]">
                          {t.rol_equipo}
                        </span>
                        <button
                          onClick={() => eliminarTrabajador(t.id)}
                          className="text-xs text-[#555555] hover:text-[#c41e1e] uppercase tracking-wider transition-colors"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Estadísticas ── */}
        {tab === 'estadisticas' && (
          <div className="space-y-6">
            {!stats ? (
              <p className="text-xs text-[#888888] uppercase tracking-widest py-10 text-center">Cargando...</p>
            ) : (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Clientes totales',   value: stats.clientes_total,    color: '#c41e1e' },
                    { label: 'Nuevos este mes',     value: stats.clientes_este_mes, color: '#d4a017' },
                    { label: 'Mensajes sin leer',   value: stats.mensajes_sin_leer, color: '#888888' },
                    { label: 'Artes impartidas',    value: arteSel.length,          color: '#555555' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="card text-center py-6">
                      <p className="font-display text-4xl mb-2" style={{ color }}>{value}</p>
                      <p className="text-xs text-[#555555] uppercase tracking-widest leading-tight">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Artes populares */}
                {stats.artes_populares.length > 0 && (
                  <div className="card">
                    <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">Artes más populares</h2>
                    <div className="space-y-3">
                      {stats.artes_populares.map((a, i) => {
                        const max = stats.artes_populares[0].fans || 1;
                        const pct = Math.round((Number(a.fans) / max) * 100);
                        return (
                          <div key={a.nombre} className="flex items-center gap-4">
                            <span className="text-xs text-[#555555] w-4 shrink-0">{i + 1}</span>
                            <span className="text-sm text-[#f0f0f0] w-36 shrink-0">{a.nombre}</span>
                            <div className="flex-1 h-1.5 bg-[#1a1a1a]">
                              <div
                                className="h-full bg-[#c41e1e]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#555555] w-12 text-right">{a.fans} fans</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Tab: Mensajes ── */}
        {tab === 'mensajes' && (
          <div className="card">
            <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">
              Mensajes recibidos
              {unreadCount > 0 && (
                <span className="ml-3 text-sm font-sans font-normal text-[#c41e1e] normal-case tracking-normal">
                  {unreadCount} sin leer
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
