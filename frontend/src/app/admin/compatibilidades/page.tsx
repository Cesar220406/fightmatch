'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { ArteMarcial, Lesion } from '@/types';

interface Compatibilidad {
  id: number;
  arte_marcial_id: number;
  lesion_id: number;
  compatible: boolean;
  nivel_recomendado?: string;
  notas?: string;
}

export default function AdminCompatibilidades() {
  const [artes, setArtes]       = useState<ArteMarcial[]>([]);
  const [lesiones, setLesiones] = useState<Lesion[]>([]);
  const [form, setForm] = useState({
    arte_marcial_id: '',
    lesion_id: '',
    compatible: 'true',
    nivel_recomendado: '',
    notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<ArteMarcial[]>('/artes-marciales').catch(() => []),
      api.get<Lesion[]>('/lesiones').catch(() => []),
    ]).then(([a, l]) => { setArtes(a); setLesiones(l); });
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.post('/compatibilidades', {
        arte_marcial_id:   Number(form.arte_marcial_id),
        lesion_id:         Number(form.lesion_id),
        compatible:        form.compatible === 'true',
        nivel_recomendado: form.nivel_recomendado || null,
        notas:             form.notas || null,
      }, getToken() ?? '');
      setMsg('Compatibilidad guardada correctamente.');
    } catch (err: unknown) {
      setMsg(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally { setLoading(false); }
  }

  return (
    <div className="p-8">
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Gestión</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide">Compatibilidades</h1>
      </div>

      <div className="max-w-xl">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6" style={{ borderLeft: '3px solid #d4a017' }}>
          <h2 className="font-display text-xl text-white uppercase tracking-wide mb-2">
            Nueva compatibilidad
          </h2>
          <p className="text-xs text-[#888888] mb-6 uppercase tracking-wider">
            Si ya existe la combinación arte+lesión, se actualizará automáticamente.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Arte marcial *</label>
              <select name="arte_marcial_id" value={form.arte_marcial_id} onChange={onChange} required className="input bg-[#111111]">
                <option value="">Selecciona...</option>
                {artes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">Lesión *</label>
              <select name="lesion_id" value={form.lesion_id} onChange={onChange} required className="input bg-[#111111]">
                <option value="">Selecciona...</option>
                {lesiones.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-3">¿Es compatible?</label>
              <div className="flex gap-6">
                {[
                  { v: 'true',  label: 'Sí, compatible',   color: 'text-emerald-400' },
                  { v: 'false', label: 'No, contraindicado', color: 'text-[#c41e1e]' },
                ].map(({ v, label, color }) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="compatible" value={v}
                      checked={form.compatible === v} onChange={onChange}
                      className="accent-[#d4a017]"
                    />
                    <span className={`text-sm font-semibold ${color}`}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.compatible === 'true' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">
                  Nivel máximo recomendado
                </label>
                <select name="nivel_recomendado" value={form.nivel_recomendado} onChange={onChange} className="input bg-[#111111]">
                  <option value="">Sin restricción</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">
                Notas / justificación
              </label>
              <textarea
                name="notas" value={form.notas} onChange={onChange}
                rows={3} className="input resize-none"
                placeholder="Explica por qué es o no compatible..."
              />
            </div>

            {msg && (
              <p className={`text-xs font-semibold uppercase tracking-wider ${msg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {msg}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Guardando...' : 'Guardar compatibilidad'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
