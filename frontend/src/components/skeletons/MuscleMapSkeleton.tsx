const HEIGHT = { sm: 120, md: 200, lg: 280 };

interface Props { size?: 'sm' | 'md' | 'lg' }

export default function MuscleMapSkeleton({ size = 'md' }: Props) {
  const h = HEIGHT[size];
  return (
    <div className="flex gap-6 justify-center animate-pulse">
      {/* Silueta anterior */}
      <svg
        width={h * 0.45} height={h} viewBox="0 0 90 200"
        aria-hidden="true" className="opacity-10"
      >
        {/* cabeza */}
        <ellipse cx="45" cy="18" rx="14" ry="16" fill="#d4a017" />
        {/* cuello */}
        <rect x="40" y="32" width="10" height="10" fill="#d4a017" />
        {/* torso */}
        <rect x="26" y="42" width="38" height="55" rx="2" fill="#d4a017" />
        {/* brazo izq */}
        <rect x="8"  y="42" width="16" height="50" rx="6" fill="#d4a017" />
        {/* brazo der */}
        <rect x="66" y="42" width="16" height="50" rx="6" fill="#d4a017" />
        {/* pierna izq */}
        <rect x="28" y="100" width="16" height="76" rx="6" fill="#d4a017" />
        {/* pierna der */}
        <rect x="46" y="100" width="16" height="76" rx="6" fill="#d4a017" />
      </svg>
      {/* Silueta posterior */}
      <svg
        width={h * 0.45} height={h} viewBox="0 0 90 200"
        aria-hidden="true" className="opacity-10"
      >
        <ellipse cx="45" cy="18" rx="14" ry="16" fill="#d4a017" />
        <rect x="40" y="32" width="10" height="10" fill="#d4a017" />
        <rect x="26" y="42" width="38" height="55" rx="2" fill="#d4a017" />
        <rect x="8"  y="42" width="16" height="50" rx="6" fill="#d4a017" />
        <rect x="66" y="42" width="16" height="50" rx="6" fill="#d4a017" />
        <rect x="28" y="100" width="16" height="76" rx="6" fill="#d4a017" />
        <rect x="46" y="100" width="16" height="76" rx="6" fill="#d4a017" />
      </svg>
    </div>
  );
}
