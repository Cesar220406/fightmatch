import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] mt-24" style={{ borderTop: '1px solid rgba(212,160,23,0.25)' }}>
      <div className="page-container py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">

          {/* Brand */}
          <div>
            <span className="font-display text-2xl tracking-widest text-white uppercase">
              <span className="text-[#c41e1e]">Fight</span>Match
            </span>
            <p className="mt-3 text-sm text-[#888888] leading-relaxed max-w-xs">
              Conectamos personas con artes marciales y gimnasios adaptados a sus lesiones y ubicación.
            </p>
          </div>

          {/* Explorar */}
          <div>
            <h3 className="text-xs font-semibold text-[#d4a017] uppercase tracking-widest mb-4">Explorar</h3>
            <ul className="space-y-2.5">
              {[
                ['/gimnasios',       'Gimnasios'],
                ['/artes-marciales', 'Artes Marciales'],
                ['/lesiones',        'Lesiones'],
                ['/blog',            'Blog'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[#888888] hover:text-[#d4a017] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h3 className="text-xs font-semibold text-[#d4a017] uppercase tracking-widest mb-4">Cuenta</h3>
            <ul className="space-y-2.5">
              {[
                ['/auth/login',    'Iniciar sesión'],
                ['/auth/registro', 'Registrarse'],
                ['/perfil',        'Mi perfil'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[#888888] hover:text-[#d4a017] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-[#444444]">
            &copy; {new Date().getFullYear()} FightMatch. Proyecto TFG.
          </span>
          <span className="text-xs text-[#444444] uppercase tracking-widest">
            Train Smart. Fight Right.
          </span>
        </div>
      </div>
    </footer>
  );
}
