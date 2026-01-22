'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  const words = ['Vaccines', 'Licensed vaccines', 'Vaccine candidates', 'Manufacturers', 'Licensing authorities'];
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
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 relative z-[100] ">
      <div className="flex items-center  max-w-[1920px] mx-auto">
        {/* Logo - Left */}
        <div className="flex items-center gap-2 flex-shrink-0">
         <Link href="/">
         <Image 
            src={"/logo.png"} 
            alt="VacciProfile Logo" 
            width={150} 
            height={40}
            className="w-auto h-8 sm:h-24"
            priority
          />
         </Link>
        </div>
        
        {/* Centered heading - Middle */}
        <div className="flex-1 flex justify-center ">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#91877d] tracking-tight">
            All <span className="text-[#d17728]">{currentText}</span>
            <span className="text-[#d17728] animate-pulse inline-block" style={{ transform: 'scaleX(0.5)', transformOrigin: 'center' }}>|</span>. One Profile
          </h1>
        </div>
        
        {/* Spacer - Right (same width as logo to balance) */}
        <div className="flex-shrink-0 w-[150px] sm:w-[150px]"></div>
      </div>
    </header>
  );
}
