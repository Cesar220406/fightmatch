'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Gimnasio, ArteMarcial, Suscripcion, Clase } from '@/types';

interface GimnasioConArtes extends Gimnasio { arte_ids?: number[]; }

interface Contacto {
  id: string; nombre: string; email: string;
  mensaje: string; leido: boolean; creado_en: string;
}

interface Estadisticas {
  total: number; activas: number; ingresos_mes: number;
  altas_30d: number; bajas_30d: number;
  // legacy
  clientes_total?: number; clientes_este_mes?: number;
  artes_populares?: { nombre: string; fans: number }[];
  mensajes_sin_leer?: number;
}

const DIAS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
const DIAS_LABEL: Record<string,string> = {
  lunes:'Lunes',martes:'Martes',miercoles:'Miércoles',
  jueves:'Jueves',viernes:'Viernes',sabado:'Sábado',domingo:'Domingo',
};
const DIA_CORTO = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

const EMPTY_FORM = {
  nombre:'',slug:'',descripcion:'',direccion:'',ciudad:'',provincia:'',
  codigo_postal:'',telefono:'',email_contacto:'',sitio_web:'',
  imagen_url:'',precio_desde:'',
};

const ESTADO_COLORS: Record<string,string> = {
  activa:'#52b788', pausada:'#d4a017', cancelada:'#c41e1e', vencida:'#555555',
};

type Tab = 'gimnasio'|'artes'|'miembros'|'clases'|'equipo'|'estadisticas'|'mensajes';

interface Trabajador {
  id: string; nombre: string; apellidos: string;
  email: string; rol_equipo: string;
}

const CLASE_EMPTY = {
  nombre:'', instructor:'', arte_marcial:'',
  dia_semana: 0, hora_inicio:'', hora_fin:'', aforo_max: 20,
};

export default function PerfilGimnasioPage() {
  const router = useRouter();

  const [gym, setGym]             = useState<GimnasioConArtes | null>(null);
  const [artes, setArtes]         = useState<ArteMarcial[]>([]);
  const [form, setForm]           = useState({ ...EMPTY_FORM });
  const [arteSel, setArteSel]     = useState<number[]>([]);
  const [horario, setHorario]     = useState<Record<string,string>>({});
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [miembros, setMiembros]   = useState<Suscripcion[]>([]);
  const [clases, setClases]       = useState<Clase[]>([]);
  const [stats, setStats]         = useState<Estadisticas | null>(null);
  const [tab, setTab]             = useState<Tab>('gimnasio');
  const [loading, setLoading]     = useState(false);
  const [sinGym, setSinGym]       = useState(false);
  const [equipo, setEquipo]       = useState<Trabajador[]>([]);
  const [emailEquipo, setEmailEquipo] = useState('');
  const [rolEquipo, setRolEquipo] = useState('entrenador');

  // Filtros miembros
  const [busqMiembro, setBusqMiembro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  // Clase form
  const [claseForm, setClaseForm] = useState({ ...CLASE_EMPTY });
  const [editClase, setEditClase] = useState<string | null>(null);
  const [showClaseForm, setShowClaseForm] = useState(false);

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
        nombre: gymData.nombre ?? '', slug: gymData.slug ?? '',
        descripcion: gymData.descripcion ?? '', direccion: gymData.direccion ?? '',
        ciudad: gymData.ciudad ?? '', provincia: gymData.provincia ?? '',
        codigo_postal: gymData.codigo_postal ?? '', telefono: gymData.telefono ?? '',
        email_contacto: gymData.email_contacto ?? '', sitio_web: gymData.sitio_web ?? '',
        imagen_url: gymData.imagen_url ?? '',
        precio_desde: gymData.precio_desde != null ? String(gymData.precio_desde) : '',
      });
      setArteSel(gymData.arte_ids ?? []);
      setHorario(gymData.horario ?? {});
      api.get<Contacto[]>(`/contactos?gimnasio_id=${gymData.id}`, token)
        .then(setContactos).catch(() => {});
    }).catch((err) => {
      if (err.message?.includes('ningún gimnasio') || err.message?.includes('404')) setSinGym(true);
      else router.push('/auth/login');
    });
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token') ?? '';
    if (tab === 'miembros' && miembros.length === 0) {
      api.get<Suscripcion[]>('/suscripciones/miembros', token)
        .then(setMiembros).catch(() => toast.error('Error al cargar miembros'));
    }
    if (tab === 'clases' && clases.length === 0) {
      api.get<Clase[]>('/clases/mias', token)
        .then(setClases).catch(() => {});
    }
    if (tab === 'estadisticas' && !stats) {
      api.get<Estadisticas>('/suscripciones/stats', token)
        .then(setStats).catch(() => toast.error('Error al cargar estadísticas'));
    }
    if (tab === 'equipo' && equipo.length === 0) {
      api.get<Trabajador[]>('/gimnasios/mio/equipo', token)
        .then(setEquipo).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function guardarDatos(e: React.FormEvent) {
    e.preventDefault(); if (!gym) return;
    setLoading(true);
    try {
      await api.put(`/gimnasios/${gym.id}`, {
        ...form,
        precio_desde: form.precio_desde ? Number(form.precio_desde) : null,
        horario: Object.keys(horario).length > 0 ? horario : null,
      }, localStorage.getItem('token') ?? '');
      toast.success('Datos actualizados');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  }

  async function guardarArtes(e: React.FormEvent) {
    e.preventDefault(); if (!gym) return;
    setLoading(true);
    try {
      await api.put(`/gimnasios/${gym.id}/artes`, { arte_ids: arteSel }, localStorage.getItem('token') ?? '');
      toast.success('Artes actualizadas');
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  }

  async function añadirTrabajador(e: React.FormEvent) {
    e.preventDefault();
    if (!emailEquipo.trim()) return;
    const token = localStorage.getItem('token') ?? '';
    setLoading(true);
    try {
      const nuevo = await api.post<Trabajador>('/gimnasios/mio/equipo',
        { email: emailEquipo.trim(), rol_equipo: rolEquipo }, token);
      setEquipo(prev => [...prev, nuevo]);
      setEmailEquipo('');
      toast.success('Trabajador añadido');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al añadir');
    } finally { setLoading(false); }
  }

  async function eliminarTrabajador(userId: string) {
    const token = localStorage.getItem('token') ?? '';
    try {
      await api.delete(`/gimnasios/mio/equipo/${userId}`, token);
      setEquipo(prev => prev.filter(t => t.id !== userId));
      toast.success('Trabajador eliminado');
    } catch { toast.error('Error al eliminar'); }
  }

  async function cambiarEstadoMiembro(id: string, estado: string) {
    const token = localStorage.getItem('token') ?? '';
    try {
      await api.put(`/suscripciones/${id}/admin`, { estado }, token);
      setMiembros(prev => prev.map(m => m.id === id ? { ...m, estado: estado as Suscripcion['estado'] } : m));
      toast.success('Estado actualizado');
    } catch { toast.error('Error al actualizar'); }
  }

  async function guardarClase(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('token') ?? '';
    setLoading(true);
    try {
      if (editClase) {
        const updated = await api.put<Clase>(`/clases/${editClase}`, claseForm, token);
        setClases(prev => prev.map(c => c.id === editClase ? updated : c));
        toast.success('Clase actualizada');
      } else {
        const nueva = await api.post<Clase>('/clases', claseForm, token);
        setClases(prev => [...prev, nueva]);
        toast.success('Clase creada');
      }
      setClaseForm({ ...CLASE_EMPTY });
      setEditClase(null);
      setShowClaseForm(false);
    } catch { toast.error('Error al guardar clase'); }
    finally { setLoading(false); }
  }

  async function eliminarClase(id: string) {
    if (!confirm('¿Eliminar esta clase?')) return;
    const token = localStorage.getItem('token') ?? '';
    try {
      await api.delete(`/clases/${id}`, token);
      setClases(prev => prev.filter(c => c.id !== id));
      toast.success('Clase eliminada');
    } catch { toast.error('Error'); }
  }

  function editarClase(c: Clase) {
    setClaseForm({
      nombre: c.nombre, instructor: c.instructor ?? '',
      arte_marcial: c.arte_marcial ?? '',
      dia_semana: c.dia_semana, hora_inicio: c.hora_inicio,
      hora_fin: c.hora_fin, aforo_max: c.aforo_max,
    });
    setEditClase(c.id);
    setShowClaseForm(true);
  }

  const miembrosFiltrados = miembros.filter(m => {
    const texto = `${m.nombre ?? ''} ${m.apellidos ?? ''} ${m.email ?? ''}`.toLowerCase();
    const matchBusq = busqMiembro === '' || texto.includes(busqMiembro.toLowerCase());
    const matchEstado = filtroEstado === '' || m.estado === filtroEstado;
    return matchBusq && matchEstado;
  });

  const unreadCount = contactos.filter(c => !c.leido).length;

  if (!gym && !sinGym) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-xs text-[#888888] uppercase tracking-widest">Cargando...</p>
    </div>
  );

  if (sinGym) return (
    <div className="py-14">
      <div className="page-container max-w-2xl text-center">
        <p className="font-display text-5xl text-[#2a2a2a] uppercase mb-4">Sin gimnasio</p>
        <p className="text-sm text-[#888888] mb-8">Tu cuenta tiene rol de gimnasio pero no hay ninguno registrado.</p>
        <Link href="/admin/gimnasios" className="btn-primary">Crear gimnasio</Link>
      </div>
    </div>
  );

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'gimnasio',     label: 'Mi gimnasio' },
    { key: 'artes',        label: 'Artes' },
    { key: 'miembros',     label: 'Miembros', badge: miembros.filter(m => m.estado === 'activa').length || undefined },
    { key: 'clases',       label: 'Clases' },
    { key: 'equipo',       label: 'Equipo' },
    { key: 'estadisticas', label: 'Estadísticas' },
    { key: 'mensajes',     label: 'Mensajes', badge: unreadCount || undefined },
  ];

  const fields = [
    { name:'nombre',label:'Nombre' }, { name:'ciudad',label:'Ciudad' },
    { name:'provincia',label:'Provincia' }, { name:'direccion',label:'Dirección' },
    { name:'codigo_postal',label:'Código Postal' }, { name:'telefono',label:'Teléfono' },
    { name:'email_contacto',label:'Email contacto' }, { name:'sitio_web',label:'Sitio web' },
    { name:'imagen_url',label:'Imagen URL' }, { name:'precio_desde',label:'Precio desde (€)' },
  ];

  return (
    <div className="py-14">
      <div className="page-container max-w-5xl">

        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-2">Gestión</p>
            <h1 className="font-display text-5xl text-white uppercase tracking-wide">{gym!.nombre}</h1>
            {gym!.ciudad && <p className="text-sm text-[#888888] mt-1">{gym!.ciudad}{gym!.provincia ? `, ${gym!.provincia}` : ''}</p>}
          </div>
          <div className="flex gap-2 pt-2">
            <Link href={`/gimnasios/${gym!.slug}`} className="btn-secondary text-xs">Ver página →</Link>
          </div>
        </div>

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
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors border-b-2 -mb-px whitespace-nowrap flex items-center gap-1.5 ${
                tab === key ? 'border-[#c41e1e] text-white' : 'border-transparent text-[#555555] hover:text-[#888888]'
              }`}>
              {label}
              {badge != null && badge > 0 && (
                <span className="bg-[#c41e1e] text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Mi Gimnasio ── */}
        {tab === 'gimnasio' && (
          <form onSubmit={guardarDatos} className="space-y-8">
            <div className="card">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">Información pública</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {fields.map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">{label}</label>
                    <input name={name} value={(form as Record<string,string>)[name]} onChange={onChange} className="input" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Descripción</label>
                  <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={4} className="input resize-none" />
                </div>
              </div>
            </div>
            <div className="card">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-2">Horarios</h2>
              <p className="text-xs text-[#555555] uppercase tracking-widest mb-6">Deja en blanco los días cerrados</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {DIAS.map(dia => (
                  <div key={dia} className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#888888] w-20 shrink-0">{DIAS_LABEL[dia]}</span>
                    <input type="text" placeholder="09:00 – 21:00"
                      value={horario[dia] ?? ''}
                      onChange={e => setHorario(h => ({ ...h, [dia]: e.target.value }))}
                      className="input flex-1 text-sm" />
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        )}

        {/* ── Artes ── */}
        {tab === 'artes' && (
          <div className="card">
            <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-2">Artes que impartís</h2>
            <p className="text-sm text-[#888888] mb-8">Selecciona las artes marciales que ofrece tu gimnasio.</p>
            <form onSubmit={guardarArtes} className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {artes.map(a => {
                  const activa = arteSel.includes(a.id);
                  return (
                    <button key={a.id} type="button" onClick={() => setArteSel(prev => activa ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
                        activa ? 'bg-[#c41e1e] border-[#c41e1e] text-white' : 'bg-transparent border-[#2a2a2a] text-[#666666] hover:border-[#d4a017] hover:text-[#d4a017]'
                      }`} style={{ borderRadius:0 }}>
                      {a.nombre}
                    </button>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-[#2a2a2a]">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Guardando...' : 'Guardar artes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Miembros ── */}
        {tab === 'miembros' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <input type="text" placeholder="Buscar por nombre o email..."
                value={busqMiembro} onChange={e => setBusqMiembro(e.target.value)}
                className="input max-w-xs" />
              <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="input w-auto">
                <option value="">Todos los estados</option>
                <option value="activa">Activa</option>
                <option value="pausada">Pausada</option>
                <option value="cancelada">Cancelada</option>
                <option value="vencida">Vencida</option>
              </select>
              <span className="text-xs text-[#555555] uppercase tracking-widest ml-auto">
                {miembrosFiltrados.length} miembro{miembrosFiltrados.length !== 1 ? 's' : ''}
              </span>
            </div>
            {miembrosFiltrados.length === 0 ? (
              <div className="py-16 text-center border border-[#2a2a2a]">
                <p className="text-sm text-[#666666] uppercase tracking-widest">
                  {miembros.length === 0 ? 'Aún no hay suscripciones.' : 'Sin resultados con esos filtros.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                      {['Miembro','Plan','Estado','Desde','Hasta','Acciones'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold uppercase tracking-widest text-[#555555] pb-3 pr-4 last:pr-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {miembrosFiltrados.map(m => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-[#f0f0f0]">{m.nombre} {m.apellidos}</p>
                          <p className="text-xs text-[#555555]">{m.email}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs text-[#d4a017] font-semibold">{m.plan_nombre}</span>
                          <p className="text-xs text-[#555555]">{m.precio_pagado}€/mes</p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5"
                            style={{ color: ESTADO_COLORS[m.estado] ?? '#888888', border: `1px solid ${ESTADO_COLORS[m.estado] ?? '#888888'}33` }}>
                            {m.estado}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-[#555555]">
                          {new Date(m.fecha_inicio).toLocaleDateString('es-ES', { day:'numeric', month:'short' })}
                        </td>
                        <td className="py-3 pr-4 text-xs text-[#555555]">
                          {new Date(m.fecha_fin).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}
                        </td>
                        <td className="py-3">
                          <select className="input text-xs py-1 w-auto"
                            value={m.estado}
                            onChange={e => cambiarEstadoMiembro(m.id, e.target.value)}>
                            <option value="activa">Activa</option>
                            <option value="pausada">Pausada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="vencida">Vencida</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Clases ── */}
        {tab === 'clases' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide">Horario semanal</h2>
              <button className="btn-primary text-xs" onClick={() => { setClaseForm({ ...CLASE_EMPTY }); setEditClase(null); setShowClaseForm(true); }}>
                + Nueva clase
              </button>
            </div>

            {/* Form nueva/editar clase */}
            {showClaseForm && (
              <form onSubmit={guardarClase} className="card space-y-4">
                <h3 className="font-display text-xl text-white uppercase tracking-wide">
                  {editClase ? 'Editar clase' : 'Nueva clase'}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Nombre *</label>
                    <input required value={claseForm.nombre}
                      onChange={e => setClaseForm(f => ({ ...f, nombre: e.target.value }))}
                      className="input" placeholder="Boxeo principiantes" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Instructor</label>
                    <input value={claseForm.instructor}
                      onChange={e => setClaseForm(f => ({ ...f, instructor: e.target.value }))}
                      className="input" placeholder="Nombre del instructor" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Arte marcial</label>
                    <input value={claseForm.arte_marcial}
                      onChange={e => setClaseForm(f => ({ ...f, arte_marcial: e.target.value }))}
                      className="input" placeholder="Boxeo, MMA, Judo..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Día *</label>
                    <select required value={claseForm.dia_semana}
                      onChange={e => setClaseForm(f => ({ ...f, dia_semana: Number(e.target.value) }))}
                      className="input">
                      {DIA_CORTO.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Hora inicio *</label>
                    <input required type="time" value={claseForm.hora_inicio}
                      onChange={e => setClaseForm(f => ({ ...f, hora_inicio: e.target.value }))}
                      className="input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Hora fin *</label>
                    <input required type="time" value={claseForm.hora_fin}
                      onChange={e => setClaseForm(f => ({ ...f, hora_fin: e.target.value }))}
                      className="input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Aforo máximo</label>
                    <input type="number" min={1} value={claseForm.aforo_max}
                      onChange={e => setClaseForm(f => ({ ...f, aforo_max: Number(e.target.value) }))}
                      className="input" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="btn-primary text-xs">
                    {loading ? 'Guardando...' : editClase ? 'Actualizar' : 'Crear clase'}
                  </button>
                  <button type="button" onClick={() => setShowClaseForm(false)} className="btn-secondary text-xs">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Calendario semanal */}
            <div className="grid grid-cols-7 gap-1">
              {DIA_CORTO.map((dia, idx) => {
                const clasesDelDia = clases.filter(c => c.dia_semana === idx);
                return (
                  <div key={idx} className="min-h-32">
                    <div className="text-center py-2 mb-2 text-xs font-bold uppercase tracking-widest"
                      style={{ borderBottom: '2px solid #c41e1e', color: '#d4a017' }}>
                      {dia}
                    </div>
                    <div className="space-y-1.5">
                      {clasesDelDia.map(c => (
                        <div key={c.id}
                          className="p-2 border border-[#2a2a2a] bg-[#0d0d0d] cursor-pointer hover:border-[#d4a017]/40 transition-colors"
                          onClick={() => editarClase(c)}>
                          <p className="text-[11px] font-semibold text-[#f0f0f0] leading-tight truncate">{c.nombre}</p>
                          <p className="text-[10px] text-[#d4a017] mt-0.5">
                            {c.hora_inicio.slice(0,5)} – {c.hora_fin.slice(0,5)}
                          </p>
                          {c.instructor && (
                            <p className="text-[10px] text-[#555555] truncate">{c.instructor}</p>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); eliminarClase(c.id); }}
                            className="text-[9px] text-[#c41e1e] uppercase tracking-widest mt-1 hover:opacity-80">
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {clases.length === 0 && !showClaseForm && (
              <p className="text-sm text-[#555555] uppercase tracking-widest text-center py-8">
                No hay clases todavía. Crea la primera.
              </p>
            )}
          </div>
        )}

        {/* ── Equipo ── */}
        {tab === 'equipo' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">Añadir trabajador</h2>
              <form onSubmit={añadirTrabajador} className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Email del usuario</label>
                  <input type="email" value={emailEquipo} onChange={e => setEmailEquipo(e.target.value)}
                    placeholder="usuario@ejemplo.com" className="input" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Rol</label>
                  <select value={rolEquipo} onChange={e => setRolEquipo(e.target.value)} className="input">
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
                Equipo <span className="text-base font-sans font-normal text-[#555555] normal-case tracking-normal ml-2">{equipo.length} {equipo.length === 1 ? 'persona' : 'personas'}</span>
              </h2>
              {equipo.length === 0 ? (
                <p className="text-sm text-[#888888] uppercase tracking-widest py-8 text-center">No hay trabajadores añadidos.</p>
              ) : (
                <div className="space-y-3">
                  {equipo.map(t => (
                    <div key={t.id} className="flex items-center justify-between gap-4 p-4 border border-[#2a2a2a]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-[#555555] uppercase">{t.nombre[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#f0f0f0] text-sm">{t.nombre} {t.apellidos}</p>
                          <p className="text-xs text-[#555555]">{t.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest border border-[#d4a017]/30 text-[#d4a017]">{t.rol_equipo}</span>
                        <button onClick={() => eliminarTrabajador(t.id)}
                          className="text-xs text-[#555555] hover:text-[#c41e1e] uppercase tracking-wider transition-colors">Quitar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Estadísticas ── */}
        {tab === 'estadisticas' && (
          <div className="space-y-6">
            {!stats ? (
              <p className="text-xs text-[#888888] uppercase tracking-widest py-10 text-center">Cargando...</p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label:'Suscripciones totales', value: stats.total,         color:'#c41e1e' },
                    { label:'Activas ahora',          value: stats.activas,       color:'#52b788' },
                    { label:'Ingresos este mes',      value: `${stats.ingresos_mes.toFixed(0)}€`, color:'#d4a017' },
                    { label:'Altas (30 días)',         value: stats.altas_30d,     color:'#4a90e2' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="card text-center py-6">
                      <p className="font-display text-4xl mb-2" style={{ color }}>{value}</p>
                      <p className="text-xs text-[#555555] uppercase tracking-widest leading-tight">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="card">
                    <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Últimos 30 días</p>
                    <h3 className="font-display text-xl text-white uppercase tracking-wide mb-4">Movimiento</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#888888]">Nuevas suscripciones</span>
                        <span className="font-display text-2xl text-[#52b788]">+{stats.altas_30d}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#888888]">Canceladas / vencidas</span>
                        <span className="font-display text-2xl text-[#c41e1e]">-{stats.bajas_30d}</span>
                      </div>
                      <div className="h-px bg-[#2a2a2a] my-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#888888]">Balance neto</span>
                        <span className="font-display text-2xl" style={{ color: (stats.altas_30d - stats.bajas_30d) >= 0 ? '#52b788' : '#c41e1e' }}>
                          {(stats.altas_30d - stats.bajas_30d) >= 0 ? '+' : ''}{stats.altas_30d - stats.bajas_30d}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Ingresos</p>
                    <h3 className="font-display text-xl text-white uppercase tracking-wide mb-4">Este mes</h3>
                    <p className="font-display text-5xl text-[#d4a017]">{stats.ingresos_mes.toFixed(0)}€</p>
                    <p className="text-xs text-[#555555] uppercase tracking-widest mt-2">
                      {stats.activas} suscripciones activas
                    </p>
                    <p className="text-xs text-[#888888] mt-1">
                      Media: {stats.activas > 0 ? (stats.ingresos_mes / stats.activas).toFixed(2) : '0.00'}€/miembro
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Mensajes ── */}
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
              <p className="text-sm text-[#888888] uppercase tracking-widest py-8 text-center">No hay mensajes todavía.</p>
            ) : (
              <div className="space-y-3">
                {contactos.map(c => (
                  <div key={c.id} className="p-4 border border-[#2a2a2a]"
                    style={{ backgroundColor: c.leido ? '#0d0d0d' : '#111111', borderLeft: c.leido ? '1px solid #2a2a2a' : '3px solid #c41e1e' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-[#f0f0f0]">{c.nombre}</span>
                          <a href={`mailto:${c.email}`} className="text-xs text-[#888888] hover:text-[#d4a017] transition-colors">{c.email}</a>
                          {!c.leido && <span className="badge-red text-[10px]">Nuevo</span>}
                        </div>
                        <p className="text-sm text-[#888888] leading-relaxed">{c.mensaje}</p>
                        <p className="text-xs text-[#444444] mt-2">
                          {new Date(c.creado_en).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </p>
                      </div>
                      {!c.leido && (
                        <button onClick={async () => {
                          const token = localStorage.getItem('token') ?? '';
                          await api.patch(`/contactos/${c.id}/leido`, {}, token).catch(() => {});
                          setContactos(prev => prev.map(x => x.id === c.id ? { ...x, leido: true } : x));
                        }} className="text-xs text-[#888888] hover:text-[#d4a017] uppercase tracking-wider shrink-0 transition-colors">
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
