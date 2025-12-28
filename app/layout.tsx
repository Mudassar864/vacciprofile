import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import NextTopLoader from 'nextjs-toploader';

// Optimize font loading - only load latin subset with better performance
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Better performance
  preload: true,
});

export const metadata: Metadata = {
  title: 'VacciProfile - Comprehensive Vaccine Information Database',
  description: 'Access detailed information about licensed vaccines, vaccine candidates, manufacturers, and regulatory authorities.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <NextTopLoader
          color="#d17728"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #d17728,0 0 5px #d17728"
        />
        <Header />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
