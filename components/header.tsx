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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center max-w-[1920px] mx-auto">
        <div className="flex items-center gap-2">
            <Image src={"/logo.png"} alt="VacciProfile Logo" width={150} height={40} />
        </div>
        <div className="text-sm text-gray-600">
          VacciProfile Last updated: {lastUpdate || 'Loading...'}
        </div>
      </div>
    </header>
  );
}
