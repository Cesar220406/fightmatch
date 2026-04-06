import type { CompatibilidadDetalle } from '@/types';

const nivelLabel: Record<string, string> = {
  principiante: 'Principiante',
  intermedio:   'Intermedio',
  avanzado:     'Avanzado',
};

export default function CompatibilidadTabla({
  items,
  modo,
}: {
  items: CompatibilidadDetalle[];
  modo: 'por-arte' | 'por-lesion';
}) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">Sin datos de compatibilidad todavía.</p>;
  }

  const compatibles   = items.filter((i) => i.compatible);
  const incompatibles = items.filter((i) => !i.compatible);

  return (
    <div className="space-y-6">
      {compatibles.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-emerald-400 mb-3">
            Compatibles ({compatibles.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left pb-2 font-medium">
                    {modo === 'por-arte' ? 'Lesión' : 'Arte marcial'}
                  </th>
                  <th className="text-left pb-2 font-medium">Nivel máx.</th>
                  <th className="text-left pb-2 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {compatibles.map((item, i) => (
                  <tr key={i} className="py-2">
                    <td className="py-2 pr-4 font-medium text-white">
                      {modo === 'por-arte' ? item.lesion : item.arte}
                    </td>
                    <td className="py-2 pr-4">
                      {item.nivel ? (
                        <span className="badge-yellow">{nivelLabel[item.nivel] ?? item.nivel}</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-2 text-gray-400 text-xs max-w-xs">
                      {item.notas ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {incompatibles.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-400 mb-3">
            Contraindicados ({incompatibles.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left pb-2 font-medium">
                    {modo === 'por-arte' ? 'Lesión' : 'Arte marcial'}
                  </th>
                  <th className="text-left pb-2 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {incompatibles.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4 font-medium text-white">
                      {modo === 'por-arte' ? item.lesion : item.arte}
                    </td>
                    <td className="py-2 text-gray-400 text-xs max-w-xs">
                      {item.notas ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
