// Skeleton que replica exactamente la estructura de GimnasioCard
export default function GymCardSkeleton() {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-5 animate-pulse"
      style={{ borderLeft: '3px solid #2a2a2a' }}>
      {/* Imagen aspect-video */}
      <div className="aspect-video w-full bg-[#222222] mb-4" />
      {/* Nombre */}
      <div className="h-4 bg-[#222222] rounded-sm w-3/4 mb-2" />
      {/* Ciudad */}
      <div className="h-3 bg-[#1e1e1e] rounded-sm w-1/2 mb-3" />
      {/* Badges artes */}
      <div className="flex gap-1.5">
        <div className="h-5 w-16 bg-[#1e1e1e] rounded-sm" />
        <div className="h-5 w-12 bg-[#1e1e1e] rounded-sm" />
        <div className="h-5 w-14 bg-[#1e1e1e] rounded-sm" />
      </div>
    </div>
  );
}
