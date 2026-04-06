import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FightMatch — Encuentra tu arte marcial',
  description:
    'Conectamos personas con artes marciales y gimnasios adaptados a sus lesiones y ubicación.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
