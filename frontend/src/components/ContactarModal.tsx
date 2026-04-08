'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface Props {
  gimnasioId: string;
  gimnasioNombre: string;
}

export default function ContactarModal({ gimnasioId, gimnasioNombre }: Props) {
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]     = useState({ nombre: '', email: '', mensaje: '' });

  // Pre-fill if logged in
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const u = JSON.parse(raw);
      setForm(f => ({
        ...f,
        nombre: u.nombre ? `${u.nombre} ${u.apellidos ?? ''}`.trim() : f.nombre,
        email:  u.email ?? f.email,
      }));
    } catch { /* ignore */ }
  }, [open]);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contactos', { gimnasio_id: gimnasioId, ...form });
      toast.success('Mensaje enviado correctamente');
      setOpen(false);
      setForm({ nombre: '', email: '', mensaje: '' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setLoading(false);
    }
  }

  function cerrar() {
    if (loading) return;
    setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary w-full">
        Contactar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={cerrar}
        >
          <div
            className="w-full max-w-md bg-[#0d0d0d] p-8 relative"
            style={{ border: '1px solid #2a2a2a', borderLeft: '4px solid #c41e1e' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={cerrar}
              className="absolute top-4 right-4 text-[#555555] hover:text-[#888888] text-lg leading-none"
              aria-label="Cerrar"
            >
              ×
            </button>

            {/* Header */}
            <p className="text-xs text-[#d4a017] uppercase tracking-widest font-semibold mb-1">Contacto</p>
            <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-6">
              {gimnasioNombre}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">
                    Nombre *
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={onChange}
                    required
                    className="input"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    required
                    className="input"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#888888] mb-2">
                  Mensaje *
                </label>
                <textarea
                  name="mensaje"
                  value={form.mensaje}
                  onChange={onChange}
                  required
                  rows={4}
                  className="input resize-none"
                  placeholder="Hola, me gustaría saber más sobre las clases..."
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
