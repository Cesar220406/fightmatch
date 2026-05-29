'use client';

import { useState } from 'react';

interface Props {
  videoId:  string;
  title?:   string;
}

/**
 * Lazy YouTube embed: muestra thumbnail con play button.
 * El iframe solo se crea al hacer click — evita la petición inicial a Google.
 * Usa la imagen de thumbnail nativa de YouTube para no exponer la URL del video
 * hasta la interacción del usuario (privacidad).
 */
export default function VideoHighlight({ videoId, title = 'Ver vídeo' }: Props) {
  const [loaded, setLoaded] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const thumbFallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (loaded) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setLoaded(true)}
      className="relative w-full group block overflow-hidden bg-[#0a0a0a]"
      style={{ paddingBottom: '56.25%' }}
      aria-label={`Reproducir: ${title}`}
    >
      {/* Thumbnail */}
      <img
        src={thumb}
        onError={(e) => { (e.target as HTMLImageElement).src = thumbFallback; }}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />

      {/* Botón play central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-16 h-16 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{
            background: 'rgba(196,30,30,0.9)',
            clipPath: 'none',
          }}
        >
          {/* Triángulo SVG de play */}
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Label inferior */}
      <div className="absolute bottom-0 left-0 right-0 px-5 py-3 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="#c41e1e" className="w-4 h-4 shrink-0">
          <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.2 5 12 5 12 5s-4.2 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.9C6.8 19 12 19 12 19s4.2 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM9.7 14.3V9.7l5.4 2.3-5.4 2.3z" />
        </svg>
        <span className="text-xs text-white/80 font-medium uppercase tracking-widest">
          60 segundos para entender de qué va esto
        </span>
      </div>
    </button>
  );
}
