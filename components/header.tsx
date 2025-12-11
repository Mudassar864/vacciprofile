'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function Header() {
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    setLastUpdate(formatted);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex justify-between items-center max-w-[1920px] mx-auto gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
            <Image 
              src={"/logo.png"} 
              alt="VacciProfile Logo" 
              width={150} 
              height={40}
              className="w-auto h-8 sm:h-20"
              priority
            />
        </div>
        <div className="text-xs sm:text-sm text-gray-600 text-right flex-shrink min-w-0">
          <span className="hidden sm:inline">VacciProfile Last updated: </span>
          <span className="sm:hidden">Updated: </span>
          <span className="whitespace-nowrap">{lastUpdate || 'Loading...'}</span>
        </div>
      </div>
    </header>
  );
}
