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
  const [artes, setArtes]     = useState<ArteMarcial[]>([]);
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
        arte_marcial_id: Number(form.arte_marcial_id),
        lesion_id:       Number(form.lesion_id),
        compatible:      form.compatible === 'true',
        nivel_recomendado: form.nivel_recomendado || null,
        notas:           form.notas || null,
      }, getToken() ?? '');
      setMsg('✅ Compatibilidad guardada');
    } catch (err: unknown) {
      setMsg(`❌ ${err instanceof Error ? err.message : 'Error'}`);
    } finally { setLoading(false); }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Compatibilidades</h1>

      <div className="max-w-lg">
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Nueva compatibilidad / actualizar</h2>
          <p className="text-xs text-gray-500 mb-5">Si ya existe la combinación arte+lesión, se actualizará automáticamente.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Arte marcial *</label>
              <select name="arte_marcial_id" value={form.arte_marcial_id} onChange={onChange} required className="input">
                <option value="">Selecciona...</option>
                {artes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Lesión *</label>
              <select name="lesion_id" value={form.lesion_id} onChange={onChange} required className="input">
                <option value="">Selecciona...</option>
                {lesiones.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">¿Es compatible?</label>
              <div className="flex gap-4">
                {[{ v: 'true', label: '✅ Sí, compatible' }, { v: 'false', label: '❌ No, contraindicado' }].map(({ v, label }) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="compatible" value={v} checked={form.compatible === v} onChange={onChange} className="accent-brand-500" />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.compatible === 'true' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nivel máximo recomendado</label>
                <select name="nivel_recomendado" value={form.nivel_recomendado} onChange={onChange} className="input">
                  <option value="">Sin restricción</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1">Notas / justificación</label>
              <textarea name="notas" value={form.notas} onChange={onChange} rows={3} className="input resize-none" placeholder="Explica por qué es o no compatible..." />
            </div>

            {msg && <p className="text-sm">{msg}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Guardando...' : 'Guardar compatibilidad'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
