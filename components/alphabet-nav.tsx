'use client';

interface AlphabetNavProps {
  onLetterClick: (letter: string) => void;
  activeLetter: string;
  includeAll?: boolean;
}

export function AlphabetNav({ onLetterClick, activeLetter, includeAll = true }: AlphabetNavProps) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="bg-white border-b border-gray-200 py-2 sm:py-3 px-3 sm:px-6 overflow-x-auto">
      <div className="flex justify-between items-center gap-1 sm:gap-2 w-full min-w-max">
        {includeAll && (
          <button
            onClick={() => onLetterClick('')}
            className={`px-2 sm:px-3 py-1 rounded transition-colors flex-shrink-0 text-xs sm:text-sm ${
              activeLetter === '' 
                ? 'bg-[#d17728] text-white font-semibold' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        )}
        <div className="flex justify-between gap-1 sm:gap-2 flex-1 flex-wrap">
          {letters.map((letter) => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              className={`px-2 sm:px-3 py-1 rounded transition-colors text-xs sm:text-sm ${
                activeLetter === letter 
                  ? 'bg-[#d17728] text-white font-semibold' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
