'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type Rol = 'cliente' | 'gimnasio' | null;

export default function RegistroPage() {
  const router = useRouter();
  const [rol, setRol] = useState<Rol>(null);
  const [form, setForm] = useState({
    email: '', password: '', nombre: '', apellidos: '',
    gimnasio_nombre: '', gimnasio_direccion: '', gimnasio_telefono: '', gimnasio_ciudad: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload: Record<string, string> = { ...form, rol: rol! };
      const data = await api.post<{ token: string; user: object }>('/auth/registro', payload);
      localStorage.setItem('token', (data as { token: string }).token);
      localStorage.setItem('user', JSON.stringify((data as { user: object }).user));
      toast.success('Cuenta creada correctamente');
      router.push('/perfil');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196,30,30,0.08) 0%, transparent 60%)' }}
      />

      <div className="w-full max-w-xl relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="font-display text-3xl tracking-widest text-white uppercase">
            <span className="text-[#c41e1e]">Fight</span>Match
          </span>
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, #d4a017, transparent)' }} />
          <p className="mt-4 text-xs text-[#888888] uppercase tracking-widest">Crea tu cuenta gratis</p>
        </div>

        {/* PASO 1 — Elegir tipo */}
        {!rol && (
          <div className="space-y-4">
            <p className="text-center text-xs text-[#888888] uppercase tracking-widest mb-6">
              ¿Cómo vas a usar FightMatch?
            </p>
            <div className="grid grid-cols-2 gap-4">
              {/* Deportista */}
              <button
                onClick={() => setRol('cliente')}
                className="group relative flex flex-col items-center gap-4 p-8 border-2 border-[#2a2a2a] bg-[#0d0d0d] hover:border-[#c41e1e] transition-all duration-200"
              >
                <div className="w-16 h-16 flex items-center justify-center border-2 border-[#2a2a2a] group-hover:border-[#c41e1e] transition-colors"
                  style={{ borderRadius: 0 }}>
                  {/* Fist icon */}
                  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#d4a017" strokeWidth="1.5">
                    <rect x="10" y="16" width="20" height="14" rx="2"/>
                    <rect x="12" y="10" width="6" height="8" rx="1"/>
                    <rect x="19" y="8" width="6" height="10" rx="1"/>
                    <rect x="26" y="10" width="5" height="8" rx="1"/>
                    <path d="M10 20 C7 20 6 22 7 25" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl text-white uppercase tracking-widest">Soy deportista</p>
                  <p className="text-xs text-[#666666] mt-2 leading-relaxed">Busco artes marciales y gimnasios adaptados a mis lesiones</p>
                </div>
                <div className="absolute top-3 right-3 w-2 h-2 bg-[#c41e1e] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Gimnasio */}
              <button
                onClick={() => setRol('gimnasio')}
                className="group relative flex flex-col items-center gap-4 p-8 border-2 border-[#2a2a2a] bg-[#0d0d0d] hover:border-[#d4a017] transition-all duration-200"
              >
                <div className="w-16 h-16 flex items-center justify-center border-2 border-[#2a2a2a] group-hover:border-[#d4a017] transition-colors"
                  style={{ borderRadius: 0 }}>
                  {/* Building icon */}
                  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#d4a017" strokeWidth="1.5">
                    <rect x="6" y="14" width="28" height="20"/>
                    <rect x="12" y="20" width="6" height="5"/>
                    <rect x="22" y="20" width="6" height="5"/>
                    <rect x="15" y="28" width="10" height="6"/>
                    <path d="M4 14 L20 4 L36 14"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl text-white uppercase tracking-widest">Tengo un gimnasio</p>
                  <p className="text-xs text-[#666666] mt-2 leading-relaxed">Gestiono un gimnasio y quiero llegar a más deportistas</p>
                </div>
                <div className="absolute top-3 right-3 w-2 h-2 bg-[#d4a017] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-[#888888] uppercase tracking-widest">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-[#d4a017] hover:text-[#e8b520] font-semibold transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        )}

        {/* PASO 2 — Formulario */}
        {rol && (
          <div>
            {/* Indicador de tipo seleccionado */}
            <div className="flex items-center gap-3 mb-6 px-4 py-3"
              style={{ border: `1px solid ${rol === 'cliente' ? '#c41e1e' : '#d4a017'}40`, borderLeft: `3px solid ${rol === 'cliente' ? '#c41e1e' : '#d4a017'}`, background: '#0d0d0d' }}>
              <span className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: rol === 'cliente' ? '#c41e1e' : '#d4a017' }}>
                {rol === 'cliente' ? 'Deportista' : 'Gimnasio'}
              </span>
              <span className="text-xs text-[#555555]">—</span>
              <span className="text-xs text-[#888888]">
                {rol === 'cliente' ? 'Encontrarás artes marciales adaptadas a ti' : 'Llegarás a deportistas que necesitan tu gimnasio'}
              </span>
              <button
                onClick={() => setRol(null)}
                className="ml-auto text-xs text-[#444444] hover:text-[#888888] transition-colors uppercase tracking-widest"
              >
                Cambiar
              </button>
            </div>

            <form onSubmit={onSubmit} className="card space-y-5">
              {error && (
                <div className="px-4 py-3 text-sm text-red-300 bg-red-900/20"
                  style={{ border: '1px solid rgba(196,30,30,0.4)', borderLeft: '3px solid #c41e1e' }}>
                  {error}
                </div>
              )}

              {/* Campos de usuario */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Nombre *</label>
                  <input name="nombre" type="text" required value={form.nombre} onChange={onChange} className="input" placeholder="Juan" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Apellidos</label>
                  <input name="apellidos" type="text" value={form.apellidos} onChange={onChange} className="input" placeholder="García" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Email *</label>
                <input name="email" type="email" required autoComplete="email" value={form.email} onChange={onChange} className="input" placeholder="tu@email.com" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">
                  Contraseña * <span className="text-[#444444] font-normal normal-case tracking-normal">(mín. 6 caracteres)</span>
                </label>
                <input name="password" type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={onChange} className="input" placeholder="••••••••" />
              </div>

              {/* Campos extra para gimnasio */}
              {rol === 'gimnasio' && (
                <>
                  <div className="pt-2 pb-1">
                    <div className="h-px" style={{ background: 'linear-gradient(90deg, #d4a017, transparent)' }} />
                    <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mt-3">Datos del gimnasio</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Nombre del gimnasio *</label>
                    <input name="gimnasio_nombre" type="text" required value={form.gimnasio_nombre} onChange={onChange} className="input" placeholder="Dragon Fight Club" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Ciudad</label>
                      <input name="gimnasio_ciudad" type="text" value={form.gimnasio_ciudad} onChange={onChange} className="input" placeholder="Madrid" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Teléfono</label>
                      <input name="gimnasio_telefono" type="tel" value={form.gimnasio_telefono} onChange={onChange} className="input" placeholder="600 000 000" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Dirección</label>
                    <input name="gimnasio_direccion" type="text" value={form.gimnasio_direccion} onChange={onChange} className="input" placeholder="Calle Mayor 1" />
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Creando cuenta...' : rol === 'gimnasio' ? 'Crear cuenta y gimnasio' : 'Crear cuenta'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#888888] uppercase tracking-widest">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-[#d4a017] hover:text-[#e8b520] font-semibold transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
