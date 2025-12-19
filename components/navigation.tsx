'use client';

import { useState, useEffect } from 'react';
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
    { href: '/compare', label: 'Compare' },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-[#d17728] hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden lg:flex gap-1 xl:gap-2 items-center overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-3 px-3 xl:px-4 font-semibold text-sm xl:text-base transition-colors whitespace-nowrap rounded-t-lg ${
                    isActive
                      ? 'bg-[#d17728] text-white shadow-sm'
                      : 'text-gray-700 hover:text-[#d17728] hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Spacer for mobile */}
          <div className="lg:hidden flex-1" />
        </div>

        {/* Mobile menu overlay */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <div className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-gray-900">Menu</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="py-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-3 px-4 mx-2 rounded-lg font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#d17728] text-white shadow-md'
                          : 'text-gray-700 hover:bg-[#d17728]/10 hover:text-[#d17728]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
