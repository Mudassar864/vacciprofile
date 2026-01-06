'use client';

import { Search, X } from 'lucide-react';
import { ReactNode } from 'react';

interface SidebarWithSearchProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  items: string[];
  selectedItem: string;
  onItemClick: (item: string) => void;
  isOpen: boolean;
  onClose: () => void;
  renderItem?: (item: string, isSelected: boolean) => ReactNode;
  emptyMessage?: string;
  sidebarClassName?: string;
  headerClassName?: string;
  itemClassName?: (isSelected: boolean) => string;
  hintText?: string;
}

export function SidebarWithSearch({
  title,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Type to search...',
  items,
  selectedItem,
  onItemClick,
  isOpen,
  onClose,
  renderItem,
  emptyMessage = 'No items found',
  sidebarClassName = '',
  headerClassName = '',
  itemClassName,
  hintText,
}: SidebarWithSearchProps) {
  const defaultRenderItem = (item: string, isSelected: boolean) => (
    <span className={isSelected ? '' : 'italic'}>{item}</span>
  );

  const render = renderItem || defaultRenderItem;
  const defaultItemClassName = (isSelected: boolean) =>
    `w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-[#d17728] hover:text-white transition-colors ${
      isSelected
        ? 'bg-[#d17728] text-white font-semibold'
        : 'text-black'
    }`;
  const getItemClassName = itemClassName || defaultItemClassName;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-80 border-r border-gray-200 h-screen overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarClassName || 'bg-white'}`}
      >
        <div className={`p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0 ${headerClassName}`}>
          <div className="flex items-center justify-between mb-2 lg:hidden">
            <h2 className="font-semibold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              aria-label="Search"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
          {hintText && (
            <p className="text-xs text-gray-500 mt-2">{hintText}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length > 0 ? (
            items.map((item) => {
              const isSelected = selectedItem === item;
              return (
                <button
                  key={item}
                  onClick={() => {
                    onItemClick(item);
                    onClose();
                  }}
                  className={getItemClassName(isSelected)}
                >
                  {render(item, isSelected)}
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">{emptyMessage}</div>
          )}
        </div>
      </aside>
    </>
  );
}

