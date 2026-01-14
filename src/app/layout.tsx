import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar, Footer } from '@/components';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RobotDance - Discover the Best AI Tools',
  description:
    'Find and compare AI solutions with the Robot Dance Score™. Read reviews, discover top-rated AI apps, agents, APIs, and more.',
  keywords: ['AI', 'artificial intelligence', 'AI tools', 'AI reviews', 'AI directory'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
