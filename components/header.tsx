'use client';

import Image from 'next/image';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 relative z-[100]">
      <div className="flex justify-start items-center max-w-[1920px] mx-auto">
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
      </div>
    </header>
  );
}
