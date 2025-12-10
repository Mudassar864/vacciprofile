'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/vaccines', label: 'Licensed Vaccines' },
    { href: '/candidates', label: 'Vaccine Candidates' },
    { href: '/manufacturers', label: 'Manufacturers' },
    { href: '/authorities', label: 'Licensing Authorities' },
    { href: '/nitags', label: 'NITAGs' },
    // { href: '/compare', label: 'Compare' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
        {/* Mobile menu button */}
        <div className="flex items-center justify-between lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-700 hover:text-[#d17728] transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:flex gap-6 items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 px-4 font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#d17728] text-white'
                    : 'text-gray-700 hover:text-[#d17728]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block py-3 px-4 font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#d17728] text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#d17728]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
