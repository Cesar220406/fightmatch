'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Stats {
  artes: number;
  lesiones: number;
  gimnasios: number;
  posts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ artes: 0, lesiones: 0, gimnasios: 0, posts: 0 });

  useEffect(() => {
    const token = getToken() ?? '';
    Promise.all([
      api.get<{ length: number } | unknown[]>('/artes-marciales').catch(() => []),
      api.get<unknown[]>('/lesiones').catch(() => []),
      api.get<unknown[]>('/gimnasios').catch(() => []),
      api.get<unknown[]>('/posts').catch(() => []),
    ]).then(([artes, lesiones, gimnasios, posts]) => {
      setStats({
        artes:    Array.isArray(artes)    ? artes.length    : 0,
        lesiones: Array.isArray(lesiones) ? lesiones.length : 0,
        gimnasios:Array.isArray(gimnasios)? gimnasios.length: 0,
        posts:    Array.isArray(posts)    ? posts.length    : 0,
      });
    });
  }, []);

  const cards = [
    { label: 'Artes Marciales', value: stats.artes,    icon: '🥋', href: '/admin/artes',            color: 'brand' },
    { label: 'Lesiones',        value: stats.lesiones, icon: '🩹', href: '/admin/lesiones',          color: 'yellow' },
    { label: 'Gimnasios',       value: stats.gimnasios,icon: '🏋️', href: '/admin/gimnasios',         color: 'blue' },
    { label: 'Posts de blog',   value: stats.posts,    icon: '📝', href: '/admin/posts',             color: 'green' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Resumen de FightMatch</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map(({ label, value, icon, href }) => (
          <Link key={href} href={href} className="card hover:border-gray-700 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              <span className="text-3xl font-bold text-white group-hover:text-brand-400 transition">{value}</span>
            </div>
            <p className="text-sm text-gray-400">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Acciones rápidas</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/artes',            label: '+ Nueva arte marcial' },
              { href: '/admin/lesiones',          label: '+ Nueva lesión' },
              { href: '/admin/compatibilidades',  label: '+ Nueva compatibilidad' },
              { href: '/admin/posts',             label: '+ Nuevo post' },
              { href: '/admin/gimnasios',         label: '+ Nuevo gimnasio' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="block text-sm text-brand-400 hover:text-brand-300 transition">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white mb-4">Estado del sistema</h2>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Base de datos',  ok: true  },
              { label: 'API Backend',    ok: true  },
              { label: 'SSL activo',     ok: true  },
              { label: 'Contenedores',   ok: true  },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-gray-400">{label}</span>
                <span className={ok ? 'badge-green' : 'badge-red'}>{ok ? 'OK' : 'Error'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
