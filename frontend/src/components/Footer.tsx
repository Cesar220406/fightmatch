import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-24">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <span className="text-lg font-bold text-white">
              <span className="text-brand-500">Fight</span>Match
            </span>
            <p className="mt-2 text-sm text-gray-400">
              Conectamos personas con artes marciales y gimnasios adaptados a sus lesiones y ubicación.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Explorar</h3>
            <ul className="mt-3 space-y-2">
              {[
                ['/gimnasios', 'Gimnasios'],
                ['/artes-marciales', 'Artes Marciales'],
                ['/blog', 'Blog'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Cuenta</h3>
            <ul className="mt-3 space-y-2">
              {[
                ['/auth/login', 'Iniciar sesión'],
                ['/auth/registro', 'Registrarse'],
                ['/perfil', 'Mi perfil'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} FightMatch. Proyecto TFG.
        </div>
      </div>
    </footer>
  );
}
