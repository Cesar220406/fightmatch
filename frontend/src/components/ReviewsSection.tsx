'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

interface Review {
  id: string
  puntuacion: number
  comentario: string | null
  created_at: string
  nombre: string
  avatar_url: string | null
}

interface Props {
  gimnasioId: string
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`text-2xl leading-none transition-transform ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } ${s <= (hover || value) ? 'text-[#d4a017]' : 'text-[#2a2a2a]'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ReviewsSection({ gimnasioId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchReviews = useCallback(async () => {
    try {
      const data = await api.get<Review[]>(`/gimnasios/${gimnasioId}/reviews`)
      setReviews(data)
    } catch {
      // silencioso — las reseñas no son críticas
    } finally {
      setLoading(false)
    }
  }, [gimnasioId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.puntuacion, 0) / reviews.length
      : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (puntuacion === 0) {
      setError('Selecciona una puntuación')
      return
    }
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      window.location.href = '/auth/login'
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.post(
        `/gimnasios/${gimnasioId}/reviews`,
        { puntuacion, comentario },
        token
      )
      setSuccess(true)
      setPuntuacion(0)
      setComentario('')
      fetchReviews()
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al enviar la reseña'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-baseline gap-4 mb-6">
        <h2 className="font-display text-xl text-white uppercase tracking-wide">
          Reseñas
        </h2>
        {reviews.length > 0 && (
          <span className="text-[#d4a017] font-semibold">
            {avgRating.toFixed(1)} ★{' '}
            <span className="text-[#555555] font-normal text-sm">
              ({reviews.length})
            </span>
          </span>
        )}
      </div>

      {/* Formulario */}
      {!success ? (
        <form onSubmit={handleSubmit} className="card-gold mb-8 p-5">
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">
            Tu valoración
          </p>
          <StarRating value={puntuacion} onChange={setPuntuacion} />
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Cuéntanos tu experiencia (opcional)..."
            rows={3}
            maxLength={500}
            className="mt-4 w-full bg-[#111111] border border-[#2a2a2a] text-[#f0f0f0] placeholder-[#555555] px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#d4a017] transition-colors"
          />
          {error && <p className="text-[#c41e1e] text-xs mt-2">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-3 w-full disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Publicar reseña'}
          </button>
        </form>
      ) : (
        <div className="card-gold mb-8 p-5 text-center">
          <p className="text-[#d4a017] font-semibold">
            ¡Gracias por tu reseña!
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-xs text-[#888888] mt-2 hover:text-white transition-colors"
          >
            Escribir otra
          </button>
        </div>
      )}

      {/* Lista de reseñas */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse border border-[#2a2a2a] p-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-[#1a1a1a] rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-[#1a1a1a] w-24 rounded" />
                  <div className="h-3 bg-[#1a1a1a] w-40 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-[#555555] text-sm italic">
          Sé el primero en dejar una reseña.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border border-[#2a2a2a] p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 text-[#d4a017] font-bold text-sm uppercase">
                  {r.nombre?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-[#f0f0f0] font-medium">
                      {r.nombre}
                    </span>
                    <span className="text-[#d4a017] text-sm tracking-wider">
                      {'★'.repeat(r.puntuacion)}
                      <span className="text-[#2a2a2a]">
                        {'★'.repeat(5 - r.puntuacion)}
                      </span>
                    </span>
                    <span className="text-xs text-[#555555]">
                      {new Date(r.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {r.comentario && (
                    <p className="text-sm text-[#888888] mt-1.5 leading-relaxed">
                      {r.comentario}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
