'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl mb-4">⚠️</p>
      <h1 className="text-3xl font-bold text-white">Algo ha ido mal</h1>
      <p className="text-gray-400 mt-3">Ha ocurrido un error inesperado.</p>
      <button onClick={reset} className="btn-primary mt-8">
        Intentar de nuevo
      </button>
    </div>
  );
}
