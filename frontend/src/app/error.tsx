'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-8xl text-[#c41e1e] opacity-30 select-none leading-none mb-4">
        ERR
      </p>
      <h1 className="font-display text-4xl text-white uppercase tracking-wide">Algo ha ido mal</h1>
      <p className="text-[#888888] mt-3 text-sm">Ha ocurrido un error inesperado.</p>
      <button onClick={reset} className="btn-primary mt-8">
        Intentar de nuevo
      </button>
    </div>
  );
}
