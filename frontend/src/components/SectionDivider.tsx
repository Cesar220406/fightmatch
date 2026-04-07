export default function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-5 py-2 px-0">
      {/* Left line */}
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.6))' }}
      />

      {/* Center ornament */}
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4a017] whitespace-nowrap">
          {label}
        </span>
      ) : (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          {/* Outer diamond */}
          <path
            d="M16 2 L30 16 L16 30 L2 16 Z"
            stroke="#d4a017"
            strokeWidth="1"
            fill="rgba(212,160,23,0.06)"
          />
          {/* Inner diamond */}
          <path
            d="M16 8 L24 16 L16 24 L8 16 Z"
            stroke="#d4a017"
            strokeWidth="0.8"
            fill="rgba(212,160,23,0.04)"
          />
          {/* Center dot */}
          <circle cx="16" cy="16" r="2.5" fill="#d4a017" opacity="0.8"/>
          {/* Corner ticks */}
          <line x1="16" y1="2"  x2="16" y2="6"  stroke="#d4a017" strokeWidth="1.5" opacity="0.6"/>
          <line x1="30" y1="16" x2="26" y2="16" stroke="#d4a017" strokeWidth="1.5" opacity="0.6"/>
          <line x1="16" y1="30" x2="16" y2="26" stroke="#d4a017" strokeWidth="1.5" opacity="0.6"/>
          <line x1="2"  y1="16" x2="6"  y2="16" stroke="#d4a017" strokeWidth="1.5" opacity="0.6"/>
        </svg>
      )}

      {/* Right line */}
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(90deg, rgba(212,160,23,0.6), transparent)' }}
      />
    </div>
  );
}
