import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'After — Nightlife Matchmaking',
  description: '¿A dónde salimos hoy? Conecta con gente en tu misma discoteca.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground overflow-x-hidden`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
