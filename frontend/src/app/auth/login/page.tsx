'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post<{ token: string; user: { nombre: string } }>(
        '/auth/login',
        form
      );
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Bienvenido, ${data.user.nombre}`);
      router.push('/perfil');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      {/* Background accent */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196,30,30,0.08) 0%, transparent 60%)' }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="font-display text-3xl tracking-widest text-white uppercase">
            <span className="text-[#c41e1e]">Fight</span>Match
          </span>
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, #d4a017, transparent)' }} />
          <p className="mt-4 text-xs text-[#888888] uppercase tracking-widest">Accede a tu cuenta</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-5">
          {error && (
            <div
              className="px-4 py-3 text-sm text-red-300 bg-red-900/20"
              style={{ border: '1px solid rgba(196,30,30,0.4)', borderLeft: '3px solid #c41e1e' }}
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">
              Email
            </label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              value={form.email} onChange={onChange}
              className="input" placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">
              Contraseña
            </label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              value={form.password} onChange={onChange}
              className="input" placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#888888] uppercase tracking-widest">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/registro" className="text-[#d4a017] hover:text-[#e8b520] font-semibold transition-colors">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
