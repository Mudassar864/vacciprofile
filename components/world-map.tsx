'use client';

import { useState } from 'react';

interface NITAG {
  nitag_id: number;
  country: string;
  available: boolean;
  website: string;
  url: string;
  nitag_name: string;
  established: string;
}

interface WorldMapProps {
  nitags: NITAG[];
  onCountryClick?: (country: string) => void;
}

const countryCoordinates: Record<string, { x: number; y: number; isoCode: string }> = {
  'United States': { x: 200, y: 180, isoCode: 'US' },
  'United Kingdom': { x: 480, y: 140, isoCode: 'GB' },
  'Canada': { x: 220, y: 120, isoCode: 'CA' },
  'Australia': { x: 820, y: 380, isoCode: 'AU' },
  'Germany': { x: 510, y: 150, isoCode: 'DE' },
  'France': { x: 490, y: 165, isoCode: 'FR' },
  'Japan': { x: 840, y: 180, isoCode: 'JP' },
  'India': { x: 680, y: 230, isoCode: 'IN' },
  'Brazil': { x: 340, y: 310, isoCode: 'BR' },
  'South Africa': { x: 540, y: 380, isoCode: 'ZA' },
  'China': { x: 760, y: 180, isoCode: 'CN' },
  'Mexico': { x: 200, y: 240, isoCode: 'MX' },
  'Italy': { x: 520, y: 170, isoCode: 'IT' },
  'Spain': { x: 470, y: 180, isoCode: 'ES' },
  'Netherlands': { x: 495, y: 145, isoCode: 'NL' },
  'Russia': { x: 650, y: 120, isoCode: 'RU' },
  'South Korea': { x: 820, y: 180, isoCode: 'KR' },
  'Singapore': { x: 760, y: 280, isoCode: 'SG' },
  'Switzerland': { x: 505, y: 160, isoCode: 'CH' },
  'Sweden': { x: 520, y: 120, isoCode: 'SE' },
  'Norway': { x: 510, y: 110, isoCode: 'NO' },
  'Denmark': { x: 510, y: 135, isoCode: 'DK' },
  'Belgium': { x: 495, y: 150, isoCode: 'BE' },
  'Austria': { x: 520, y: 160, isoCode: 'AT' },
  'Poland': { x: 530, y: 145, isoCode: 'PL' },
  'Argentina': { x: 320, y: 400, isoCode: 'AR' },
  'Chile': { x: 300, y: 400, isoCode: 'CL' },
  'Colombia': { x: 290, y: 270, isoCode: 'CO' },
  'Turkey': { x: 560, y: 185, isoCode: 'TR' },
  'Saudi Arabia': { x: 590, y: 230, isoCode: 'SA' },
  'United Arab Emirates': { x: 610, y: 240, isoCode: 'AE' },
  'Thailand': { x: 740, y: 250, isoCode: 'TH' },
  'Indonesia': { x: 770, y: 300, isoCode: 'ID' },
  'Malaysia': { x: 750, y: 280, isoCode: 'MY' },
  'Philippines': { x: 800, y: 250, isoCode: 'PH' },
  'Vietnam': { x: 760, y: 240, isoCode: 'VN' },
  'Egypt': { x: 550, y: 210, isoCode: 'EG' },
  'Nigeria': { x: 500, y: 260, isoCode: 'NG' },
  'Kenya': { x: 570, y: 290, isoCode: 'KE' },
  'New Zealand': { x: 880, y: 420, isoCode: 'NZ' },
};

export function WorldMap({ nitags, onCountryClick }: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (country: string, event: React.MouseEvent) => {
    setHoveredCountry(country);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredCountry) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
  };

  const hoveredNitag = hoveredCountry ? nitags.find(n => n.country === hoveredCountry) : null;

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full"
        onMouseMove={handleMouseMove}
      >
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>

        <rect width="1000" height="500" fill="url(#grid)" />

        <g>
          {Object.entries(countryCoordinates).map(([country, coords]) => {
            const nitag = nitags.find(n => n.country === country);
            const hasData = !!nitag;
            const isAvailable = nitag?.available;

            return (
              <g key={country}>
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={hoveredCountry === country ? 14 : 10}
                  fill={hasData ? (isAvailable ? '#10b981' : '#f59e0b') : '#d1d5db'}
                  stroke={hoveredCountry === country ? '#1f2937' : '#ffffff'}
                  strokeWidth={hoveredCountry === country ? 3 : 2}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={(e) => handleMouseEnter(country, e)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => onCountryClick?.(country)}
                  style={{
                    filter: hoveredCountry === country ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'none',
                    opacity: hoveredCountry === country ? 1 : 0.85
                  }}
                />
                {hasData && isAvailable && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={15}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1"
                    opacity="0.3"
                    className="pointer-events-none"
                  >
                    <animate
                      attributeName="r"
                      from="10"
                      to="20"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </g>

        <text x="20" y="30" className="text-sm font-semibold fill-gray-700">
          Interactive NITAG World Map
        </text>
      </svg>

      {hoveredNitag && (
        <div
          className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 pointer-events-none z-50 max-w-xs"
          style={{
            left: `${tooltipPosition.x + 20}px`,
            top: `${tooltipPosition.y - 80}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-2">
              {hoveredNitag.country}
            </h3>

            {hoveredNitag.nitag_name && (
              <p className="text-sm font-semibold text-[#d17728]">
                {hoveredNitag.nitag_name}
              </p>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Status:</span>
              {hoveredNitag.available ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-[#d17728] rounded-full"></span>
                  Not Available
                </span>
              )}
            </div>

            {hoveredNitag.established && (
              <p className="text-xs text-gray-600">
                <span className="font-medium">Established:</span> {hoveredNitag.established}
              </p>
            )}

            <p className="text-xs text-gray-500 italic pt-1 border-t border-gray-100">
              Click to view details
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg shadow-md p-3 text-xs">
        <div className="font-semibold text-gray-700 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">NITAG Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#d17728]"></div>
            <span className="text-gray-600">NITAG Not Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-gray-600">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
