import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-[12rem] leading-none text-[#c41e1e] opacity-10 select-none">
        404
      </p>
      <h1 className="font-display text-5xl text-white uppercase tracking-wide -mt-8">
        Página no encontrada
      </h1>
      <p className="text-[#888888] mt-4 max-w-sm text-sm leading-relaxed">
        La página que buscas no existe o ha sido movida.
      </p>
      <div className="flex gap-3 mt-10">
        <Link href="/" className="btn-primary">Ir al inicio</Link>
        <Link href="/gimnasios" className="btn-secondary">Ver gimnasios</Link>
      </div>
    </div>
  );
}
