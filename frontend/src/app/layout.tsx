import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'FightMatch — Encuentra tu arte marcial',
    template: '%s | FightMatch',
  },
  description:
    'Conectamos personas con artes marciales y gimnasios adaptados a sus lesiones y ubicación. Encuentra la disciplina perfecta para tu situación física.',
  keywords: [
    'artes marciales', 'gimnasios', 'lesiones deportivas', 'muay thai', 'bjj',
    'boxeo', 'judo', 'karate', 'entrenamiento adaptado', 'fightmatch',
  ],
  authors: [{ name: 'FightMatch' }],
  openGraph: {
    title: 'FightMatch — Encuentra tu arte marcial',
    description: 'Conectamos personas con artes marciales y gimnasios adaptados a sus lesiones y ubicación.',
    url: 'https://fightmatch.duckdns.org',
    siteName: 'FightMatch',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FightMatch — Encuentra tu arte marcial',
    description: 'Conectamos personas con artes marciales y gimnasios adaptados a sus lesiones.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
