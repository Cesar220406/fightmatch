'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', nombre: '', apellidos: '' });
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
      const data = await api.post<{ token: string; user: object }>('/auth/registro', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/perfil');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
          <p className="mt-2 text-sm text-gray-400">Únete a FightMatch gratuitamente</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4">
          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-700 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1.5">
                Nombre
              </label>
              <input
                id="nombre" name="nombre" type="text" required
                value={form.nombre} onChange={onChange}
                className="input" placeholder="Juan"
              />
            </div>
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-300 mb-1.5">
                Apellidos
              </label>
              <input
                id="apellidos" name="apellidos" type="text"
                value={form.apellidos} onChange={onChange}
                className="input" placeholder="García"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email" name="email" type="email" required
              autoComplete="email" value={form.email} onChange={onChange}
              className="input" placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
              Contraseña <span className="text-gray-600 font-normal">(mín. 6 caracteres)</span>
            </label>
            <input
              id="password" name="password" type="password" required
              minLength={6} autoComplete="new-password"
              value={form.password} onChange={onChange}
              className="input" placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
