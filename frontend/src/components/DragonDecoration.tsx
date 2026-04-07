export default function DragonDecoration() {
  return (
    <img
      src="/images/dragon.png"
      alt=""
      aria-hidden="true"
      className="absolute right-0 top-0 h-full w-auto pointer-events-none select-none"
      style={{ objectFit: 'contain', objectPosition: 'right center', opacity: 0.2 }}
    />
  );
}
