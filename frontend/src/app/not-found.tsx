import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-black text-brand-600 opacity-30 select-none">404</p>
      <h1 className="text-3xl font-bold text-white mt-2">Página no encontrada</h1>
      <p className="text-gray-400 mt-3 max-w-sm">
        La página que buscas no existe o ha sido movida.
      </p>
      <div className="flex gap-3 mt-8">
        <Link href="/" className="btn-primary">Ir al inicio</Link>
        <Link href="/gimnasios" className="btn-secondary">Ver gimnasios</Link>
      </div>
    </div>
  );
}
