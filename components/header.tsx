'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  const words = [ 'Licensed Vaccines.', 'Vaccine Candidates.', 'Manufacturers.', 'Licensing Authorities.', 'Country NITAGs.'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.substring(0, currentText.length - 1));
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? 50 : 100);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex]);

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 relative z-20">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 max-w-[1920px] mx-auto">
        {/* Logo - Left */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start">
          <Link href="/" className="flex items-center">
            <Image 
              src={"/logo.png"} 
              alt="VacciProfile Logo" 
              width={150} 
              height={40}
              className="w-auto h-9 sm:h-12 md:h-16 lg:h-20 xl:h-24"
              priority
            />
          </Link>
        </div>
        
        {/* Centered heading - Middle */}
        <div className="flex-1 flex justify-center items-center w-full sm:w-auto min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-[#91877d] tracking-tight text-center px-2 break-words sm:whitespace-nowrap">
            All <span className="text-[#d17728]  ">{currentText}</span>
            <span className="text-[#d17728] animate-pulse inline-block" style={{ transform: 'scaleX(0.5)', transformOrigin: 'center' }}>|</span> One Profile.
          </h1>
        </div>
        
        {/* Spacer - Right (hidden on mobile, visible on larger screens) */}
        <div className="hidden sm:block flex-shrink-0 w-[100px] md:w-[120px] lg:w-[150px]"></div>
      </div>
    </header>
  );
}
