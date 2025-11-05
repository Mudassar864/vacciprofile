'use client';

interface AlphabetNavProps {
  onLetterClick?: (letter: string) => void;
  activeLetter?: string;
}

export function AlphabetNav({ onLetterClick, activeLetter }: AlphabetNavProps) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="bg-gray-100 px-6 py-2 border-b border-gray-200">
      <div className="flex gap-3 text-sm font-semibold text-gray-700 max-w-[1920px] mx-auto flex-wrap">
        {letters.map((letter) => (
          <button
            key={letter}
            onClick={() => onLetterClick?.(letter)}
            className={`hover:text-orange-600 transition-colors ${
              activeLetter === letter ? 'text-orange-600' : ''
            }`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
