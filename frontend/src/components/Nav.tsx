'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/gimnasios',       label: 'Gimnasios' },
  { href: '/artes-marciales', label: 'Artes Marciales' },
  { href: '/blog',            label: 'Blog' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-xl">
          <span className="text-brand-500">Fight</span>Match
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition ${
                pathname.startsWith(href)
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="btn-secondary py-2 px-4 text-xs">
            Entrar
          </Link>
          <Link href="/auth/registro" className="btn-primary py-2 px-4 text-xs">
            Registrarse
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 space-y-3">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-300 hover:text-white"
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/auth/login" className="btn-secondary py-2 px-4 text-xs flex-1 text-center">
              Entrar
            </Link>
            <Link href="/auth/registro" className="btn-primary py-2 px-4 text-xs flex-1 text-center">
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
