'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout } from '@/lib/auth';
import type { Usuario } from '@/types';

const navItems = [
  { href: '/admin',                  label: 'Dashboard',          icon: '📊' },
  { href: '/admin/artes',            label: 'Artes Marciales',    icon: '🥋' },
  { href: '/admin/lesiones',         label: 'Lesiones',           icon: '🩹' },
  { href: '/admin/compatibilidades', label: 'Compatibilidades',   icon: '🔗' },
  { href: '/admin/gimnasios',        label: 'Gimnasios',          icon: '🏋️' },
  { href: '/admin/posts',            label: 'Blog',               icon: '📝' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || (u.rol !== 'admin' && u.rol !== 'editor')) {
      router.push('/auth/login');
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">
      Verificando acceso...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="text-lg font-bold text-white">
            <span className="text-brand-500">Fight</span>Match
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">Panel de administración</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-brand-900/50 text-brand-300'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-brand-800 flex items-center justify-center text-xs font-bold text-white">
              {user.nombre[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.nombre}</p>
              <p className="text-xs text-gray-500 capitalize">{user.rol}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:text-white rounded transition"
          >
            Cerrar sesión →
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
