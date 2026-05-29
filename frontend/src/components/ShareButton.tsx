'use client';

import { useState } from 'react';

interface Props {
  title: string;
  text?:  string;
  url?:   string;
}

/**
 * Botón de compartir con Web Share API nativa (móvil).
 * Fallback en desktop: copia la URL al portapapeles con feedback visual.
 */
export default function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl  = url ?? window.location.href;
    const shareData = { title, text: text ?? title, url: shareUrl };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // El usuario canceló el share nativo — no hacemos nada
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard no disponible — silencio
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-xs text-[#888888] hover:text-[#d4a017]
                 uppercase tracking-widest transition-colors px-3 py-1.5 border border-[#2a2a2a]
                 hover:border-[#d4a017]/40"
      aria-label="Compartir esta página"
    >
      {copied ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Copiado</span>
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Compartir</span>
        </>
      )}
    </button>
  );
}
