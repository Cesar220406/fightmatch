export default function DragonDecoration() {
  return (
    <img
      src="/images/dragon.png"
      alt=""
      aria-hidden="true"
      className="absolute right-0 top-0 h-full w-auto pointer-events-none select-none"
      style={{ opacity: 0.09, maxWidth: '55%', objectFit: 'contain', objectPosition: 'right top' }}
    />
  );
}
