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

async function fetchLastUpdate() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
    const response = await fetch(`${API_BASE}/api/last-update`, { 
      cache: 'no-store' // Always fetch fresh data on server
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.lastUpdatedAt) {
        const updateDate = new Date(data.lastUpdatedAt);
        const formatted = updateDate.toLocaleString('en-US', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return {
          lastUpdate: formatted,
          modelName: data.modelName || null,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching last update in layout:', error);
  }
  
  // Fallback to current time if API fails
  const now = new Date();
  const formatted = now.toLocaleString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return {
    lastUpdate: formatted,
    modelName: null,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLastUpdate = await fetchLastUpdate();

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
        <Header initialLastUpdate={initialLastUpdate.lastUpdate} initialModelName={initialLastUpdate.modelName} />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
