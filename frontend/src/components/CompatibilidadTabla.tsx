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
    return (
      <p className="text-sm text-[#888888] uppercase tracking-widest">
        Sin datos de compatibilidad todavía.
      </p>
    );
  }

  const compatibles   = items.filter((i) => i.compatible);
  const incompatibles = items.filter((i) => !i.compatible);

  return (
    <div className="space-y-8">
      {compatibles.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">
            Compatibles ({compatibles.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#888888] uppercase tracking-widest" style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <th className="text-left pb-3 font-semibold">
                    {modo === 'por-arte' ? 'Lesión' : 'Arte marcial'}
                  </th>
                  <th className="text-left pb-3 font-semibold">Nivel máx.</th>
                  <th className="text-left pb-3 font-semibold">Notas</th>
                </tr>
              </thead>
              <tbody>
                {compatibles.map((item, i) => (
                  <tr
                    key={i}
                    className="text-sm"
                    style={{
                      borderBottom: '1px solid #1a1a1a',
                      backgroundColor: i % 2 === 0 ? 'transparent' : '#0d0d0d',
                    }}
                  >
                    <td className="py-3 pr-4 font-semibold text-[#f0f0f0]">
                      {modo === 'por-arte' ? item.lesion : item.arte}
                    </td>
                    <td className="py-3 pr-4">
                      {item.nivel ? (
                        <span className="badge-yellow">{nivelLabel[item.nivel] ?? item.nivel}</span>
                      ) : (
                        <span className="text-[#444444]">—</span>
                      )}
                    </td>
                    <td className="py-3 text-[#888888] text-xs max-w-xs">
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
          <h3 className="text-xs font-semibold text-[#c41e1e] uppercase tracking-widest mb-4">
            Contraindicados ({incompatibles.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#888888] uppercase tracking-widest" style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <th className="text-left pb-3 font-semibold">
                    {modo === 'por-arte' ? 'Lesión' : 'Arte marcial'}
                  </th>
                  <th className="text-left pb-3 font-semibold">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {incompatibles.map((item, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid #1a1a1a',
                      backgroundColor: i % 2 === 0 ? 'transparent' : '#0d0d0d',
                    }}
                  >
                    <td className="py-3 pr-4 font-semibold text-[#f0f0f0]">
                      {modo === 'por-arte' ? item.lesion : item.arte}
                    </td>
                    <td className="py-3 text-[#888888] text-xs max-w-xs">
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
