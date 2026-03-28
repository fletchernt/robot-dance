import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RY1RHFNF9L"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RY1RHFNF9L');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Domain For Sale Banner */}
            <div className="bg-amber-500 text-black py-3 px-4 text-center">
              <span className="font-medium">This domain is for sale!</span>
              <a
                href="mailto:fletch@robotdance.com?subject=Interested%20in%20buying%20robotdance.com"
                className="ml-3 inline-block bg-black text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Contact to Buy
              </a>
            </div>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
