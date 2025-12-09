'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  headerClassName?: string;
}

export function SectionCard({ title, open, onToggle, children, headerClassName = '' }: SectionCardProps) {
  return (
    <div className="bg-gray-100 rounded-lg mb-4">
      <button
        onClick={onToggle}
        className={`w-full flex justify-between items-center px-6 py-3 text-left hover:bg-gray-200 transition-colors rounded-t-lg ${headerClassName}`}
      >
        <span className="font-semibold text-gray-800">{title}</span>
        {open ? <ChevronUp className="text-gray-600" size={20} /> : <ChevronDown className="text-gray-600" size={20} />}
      </button>

      {open && <div className="px-6 pb-4">{children}</div>}
    </div>
  );
}

