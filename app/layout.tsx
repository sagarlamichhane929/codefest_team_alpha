import type { Metadata } from 'next';

import './globals.css';
import { Providers } from './components/providers';
import { Toaster } from 'sonner';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Quiz App',
  description: 'Real-time quiz application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
