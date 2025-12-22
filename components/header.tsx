'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeaderProps {
  initialLastUpdate?: string;
  initialModelName?: string | null;
}

export function Header({ initialLastUpdate, initialModelName }: HeaderProps) {
  const [lastUpdate, setLastUpdate] = useState<string>(initialLastUpdate || '');
  const [modelName, setModelName] = useState<string | null>(initialModelName || null);

  // Sync with props when they change (e.g., after server-side fetch completes)
  useEffect(() => {
    if (initialLastUpdate) {
      setLastUpdate(initialLastUpdate);
    }
    if (initialModelName !== undefined) {
      setModelName(initialModelName);
    }
  }, [initialLastUpdate, initialModelName]);

  useEffect(() => {
    const fetchLastUpdate = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
        const response = await fetch(`${API_BASE}/api/last-update`, { cache: 'no-store' });
        
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
            setLastUpdate(formatted);
            setModelName(data.modelName || null);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching last update:', error);
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
      setLastUpdate(formatted);
      setModelName(null);
    };

    // Refresh every 5 minutes
    const interval = setInterval(fetchLastUpdate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run on mount for the interval

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
          {modelName ? (
            <>
              <span className="hidden sm:inline">
                {modelName} last updated: <span className="whitespace-nowrap">{lastUpdate || (initialLastUpdate || 'Loading...')}</span>
              </span>
              <span className="sm:hidden">
                {modelName}: <span className="whitespace-nowrap">{lastUpdate || (initialLastUpdate || 'Loading...')}</span>
              </span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">VacciProfile Last updated: </span>
              <span className="sm:hidden">Updated: </span>
              <span className="whitespace-nowrap">{lastUpdate || (initialLastUpdate || 'Loading...')}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
