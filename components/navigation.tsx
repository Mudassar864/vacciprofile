'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/vaccines', label: 'Licensed Vaccines' },
    { href: '/candidates', label: 'Vaccine Candidates' },
    { href: '/manufacturers', label: 'Manufacturers' },
    { href: '/authorities', label: 'Licensing Authorities' },
    // { href: '/nitags', label: 'NITAGs' },
    // { href: '/compare', label: 'Compare' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6">
      <div className="flex gap-6 items-center max-w-[1920px] mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`py-3 px-4 font-semibold transition-colors ${
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
    </nav>
  );
}
