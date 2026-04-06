'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout } from '@/lib/auth';
import type { Usuario } from '@/types';

const navItems = [
  { href: '/admin',                  label: 'Dashboard',        icon: '▣' },
  { href: '/admin/artes',            label: 'Artes Marciales',  icon: '◈' },
  { href: '/admin/lesiones',         label: 'Lesiones',         icon: '✦' },
  { href: '/admin/compatibilidades', label: 'Compatibilidades', icon: '⟺' },
  { href: '/admin/gimnasios',        label: 'Gimnasios',        icon: '◉' },
  { href: '/admin/posts',            label: 'Blog',             icon: '◧' },
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="font-display text-3xl text-[#2a2a2a] uppercase tracking-widest">Verificando acceso...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#0d0d0d] flex flex-col" style={{ borderRight: '1px solid #1a1a1a' }}>
        {/* Header */}
        <div className="p-5" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <Link href="/" className="font-display text-xl tracking-widest text-white uppercase">
            <span className="text-[#c41e1e]">Fight</span>Match
          </Link>
          <p className="text-xs text-[#444444] mt-1 uppercase tracking-wider">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'text-[#d4a017] bg-[#d4a017]/8'
                    : 'text-[#666666] hover:text-[#f0f0f0] hover:bg-[#1a1a1a]'
                }`}
                style={active ? { borderLeft: '2px solid #d4a017', paddingLeft: '10px' } : { borderLeft: '2px solid transparent', paddingLeft: '10px' }}
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: '1px solid #1a1a1a' }}>
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="h-7 w-7 bg-[#c41e1e] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.nombre[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#f0f0f0] truncate">{user.nombre}</p>
              <p className="text-xs text-[#444444] uppercase tracking-wider">{user.rol}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full text-left px-3 py-1.5 text-xs text-[#666666] hover:text-[#d4a017] transition-colors uppercase tracking-wider"
          >
            Cerrar sesión →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#0a0a0a]">
        {children}
      </main>
    </div>
  );
}
