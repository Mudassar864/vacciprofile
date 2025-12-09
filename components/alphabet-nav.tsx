'use client';

interface AlphabetNavProps {
  onLetterClick?: (letter: string) => void;
  activeLetter?: string;
  includeAll?: boolean;
}

export function AlphabetNav({ onLetterClick, activeLetter, includeAll = true }: AlphabetNavProps) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-700 w-full justify-between">
        {includeAll && (
          <button
            onClick={() => onLetterClick?.('')}
            className={`px-3 py-1 rounded transition-colors ${
              !activeLetter ? 'bg-[#d17728] text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        )}
        <div className="flex flex-wrap gap-2 flex-1 justify-start">
          {letters.map((letter) => (
            <button
              key={letter}
              onClick={() => onLetterClick?.(letter)}
              className={`px-3 py-1 rounded transition-colors ${
                activeLetter === letter ? 'bg-[#d17728] text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
