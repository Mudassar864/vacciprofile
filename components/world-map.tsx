import React, { useState, lazy, Suspense, useRef } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Calendar, Globe, ExternalLink, X, Clock } from 'lucide-react';

// Lazy load Dialog to reduce initial bundle size
const Dialog = lazy(() => import('@/components/ui/dialog').then(mod => ({ default: mod.Dialog })));
const DialogContent = lazy(() => import('@/components/ui/dialog').then(mod => ({ default: mod.DialogContent })));
const DialogHeader = lazy(() => import('@/components/ui/dialog').then(mod => ({ default: mod.DialogHeader })));
const DialogTitle = lazy(() => import('@/components/ui/dialog').then(mod => ({ default: mod.DialogTitle })));

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface NITAG {
  country: string;
  availableNitag: string;
  nationalNitagName: string;
  yearEstablished: number | null;
  availableWebsite: string;
  websiteUrl: string;
  updatedAt?: string;
}

interface TooltipState {
  show: boolean;
  name: string;
  x: number;
  y: number;
}

interface GeoProperties {
  name: string;
}

interface Geography {
  rsmKey: string;
  properties: GeoProperties;
}

interface WorldMapProps {
  nitags: NITAG[];
  selectedCountry?: string;
  onCountryClick?: (country: string) => void;
}

// Country name normalization map - maps map country names to API country names
const countryNameMap: { [key: string]: string } = {
  'united states of america': 'united states',
  'united states': 'united states',
  'russia': 'russian federation',
  'russian federation': 'russian federation',
  'south korea': 'republic of korea',
  'republic of korea': 'republic of korea',
  'north korea': "democratic people's republic of korea",
  "democratic people's republic of korea": "democratic people's republic of korea",
  'czech republic': 'czechia',
  'czechia': 'czechia',
  'myanmar': 'myanmar',
  'burma': 'myanmar',
  'ivory coast': "côte d'ivoire",
  "côte d'ivoire": "côte d'ivoire",
  'east timor': 'timor-leste',
  'timor-leste': 'timor-leste',
  'cape verde': 'cabo verde',
  'cabo verde': 'cabo verde',
  'swaziland': 'eswatini',
  'eswatini': 'eswatini',
  'dem. rep. congo': 'congo, democratic republic',
  'democratic republic of the congo': 'congo, democratic republic',
  'democratic republic of congo': 'congo, democratic republic',
  'congo, democratic republic': 'congo, democratic republic',
  'congo (kinshasa)': 'congo, democratic republic',
  'drc': 'congo, democratic republic',
  'central african rep.': 'central african republic',
  'central african republic': 'central african republic',
};

const normalizeCountryName = (countryName: string): string => {
  const lowerName = countryName.toLowerCase().trim();
  return countryNameMap[lowerName] || countryName;
};

export default function WorldMap({ nitags, selectedCountry = "", onCountryClick }: WorldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    name: "",
    x: 0,
    y: 0
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  const getNitagInfo = (countryName: string): NITAG | undefined => {
    const normalizedMapName = normalizeCountryName(countryName);
   
    // Try exact match with normalized name
    let nitag = nitags.find(nitag => {
      const normalizedApiName = normalizeCountryName(nitag.country);
      return normalizedApiName.toLowerCase() === normalizedMapName.toLowerCase();
    });
   
    // If not found, try direct case-insensitive match
    if (!nitag) {
      nitag = nitags.find(nitag => nitag.country.toLowerCase() === countryName.toLowerCase());
    }
   
    // If still not found, try partial matching (for cases like "United States of America" contains "United States")
    if (!nitag) {
      nitag = nitags.find(nitag => {
        const mapLower = countryName.toLowerCase();
        const apiLower = nitag.country.toLowerCase();
        return mapLower.includes(apiLower) || apiLower.includes(mapLower);
      });
    }
   
    return nitag;
  };

  const hasNitag = (countryName: string): boolean => {
    const nitagInfo = getNitagInfo(countryName);
    return nitagInfo?.availableNitag.toLowerCase() === 'yes';
  };

  const getCountryColor = (countryName: string): string => {
    const nitagInfo = getNitagInfo(countryName);
    if (!nitagInfo) {
      return '#b42328'; // Red: No NITAG
    }
   
    const hasNitag = nitagInfo.availableNitag.toLowerCase() === 'yes';
    const hasWebsite = !!(nitagInfo.websiteUrl && nitagInfo.websiteUrl.trim() !== '');
   
    if (hasNitag && hasWebsite) {
      return '#0d8c50'; // Green: Has NITAG and website
    } else if (hasNitag && !hasWebsite) {
      return '#eeb923'; // Yellow: Has NITAG but no website
    } else {
      return '#b42328'; // Red: No NITAG
    }
  };

  const handleMouseEnter = (geo: Geography, event: React.MouseEvent<SVGPathElement>) => {
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setTooltip({
        show: true,
        name: geo.properties.name,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
    if (tooltip.show && mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setTooltip(prev => ({
        ...prev,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, name: "", x: 0, y: 0 });
  };

  const handleClick = (geo: Geography) => {
    // Only trigger click if we haven't dragged
    if (!hasDragged && onCountryClick) {
      // Find the NITAG info to get the API country name
      const nitagInfo = getNitagInfo(geo.properties.name);
      // Use API country name if found, otherwise use map name
      const countryName = nitagInfo?.country || geo.properties.name;
      onCountryClick(countryName);
    }
  };

  const handleMoveStart = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
   
    // Don't start drag if clicking directly on a country path
    if (target.tagName === 'path' || target.closest('path')) {
      return;
    }
   
    // Allow drag when clicking on background (svg container or div)
    if (target.tagName === 'svg' || target.tagName === 'DIV') {
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({
        x: event.clientX - position.x,
        y: event.clientY - position.y
      });
    }
  };

  const handleMoveEnd = () => {
    setIsDragging(false);
    // Reset hasDragged after a short delay to allow click to process
    setTimeout(() => setHasDragged(false), 0);
  };

  const handleMove = (event: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = Math.abs(event.clientX - (dragStart.x + position.x));
      const deltaY = Math.abs(event.clientY - (dragStart.y + position.y));
     
      // Mark as dragged if movement exceeds threshold
      if (deltaX > 3 || deltaY > 3) {
        setHasDragged(true);
      }
     
      setPosition({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      });
    }
  };

  const selectedNitag = selectedCountry ? getNitagInfo(selectedCountry) : null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
          Interactive World Map - NITAG Information
        </h1>
       
        <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#0d8c50', border: '1px solid #0a6e3f' }}></div>
            <span className="text-gray-600">NITAG with Website</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#eeb923', border: '1px solid #d4a01f' }}></div>
            <span className="text-gray-600">NITAG without Website</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#b42328', border: '1px solid #8a1a1e' }}></div>
            <span className="text-gray-600">No NITAG</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border" style={{ backgroundColor: '#d17728', borderColor: '#b8651f' }}></div>
            <span className="text-gray-600">Selected</span>
          </div>
        </div>
      </div>
      <div
        ref={mapContainerRef}
        className="flex-1 relative overflow-hidden min-h-0"
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
        onMouseDown={handleMoveStart}
        onMouseMove={handleMove}
        onMouseUp={handleMoveEnd}
        onMouseLeave={handleMoveEnd}
      >
        <div
          className="w-full h-full"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 147
            }}
            className="w-full h-full"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: Geography[] }) =>
                geographies.map((geo) => {
                  const countryColor = getCountryColor(geo.properties.name);
                  // Normalize both names for comparison to handle "United States of America" vs "United States"
                  const normalizedSelected = normalizeCountryName(selectedCountry).toLowerCase();
                  const normalizedGeoName = normalizeCountryName(geo.properties.name).toLowerCase();
                  const isSelected = normalizedSelected === normalizedGeoName && selectedCountry !== '';
                 
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(event) => handleMouseEnter(geo, event)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(geo)}
                      onMouseDown={(e) => {
                        // Prevent drag when clicking on countries
                        e.stopPropagation();
                      }}
                      style={{
                        default: {
                          fill: isSelected
                            ? "#d17728"
                            : countryColor,
                          outline: "none",
                          stroke: isSelected ? "#d17728" : "#333333",
                          strokeWidth: isSelected ? 1.5 : 0.8
                        },
                        hover: {
                          fill: "#d17728",
                          outline: "none",
                          cursor: "pointer",
                          stroke: "#d17728",
                          strokeWidth: 1.5
                        },
                        pressed: {
                          fill: "#b8651f",
                          outline: "none",
                          stroke: "#b8651f"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
        {tooltip.show && (
          <div
            className="absolute bg-gray-800 text-white px-3 py-2 rounded shadow-lg text-sm pointer-events-none z-50 whitespace-nowrap"
            style={{
              left: `${tooltip.x + 5}px`,
              top: `${tooltip.y + 5}px`,
              pointerEvents: 'none'
            }}
          >
            {tooltip.name}
          </div>
        )}
      </div>
      <Dialog open={!!(selectedCountry && selectedNitag)} onOpenChange={(open) => {
        if (!open && onCountryClick) {
          onCountryClick('');
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0" hideOverlay>
          {selectedNitag && (
            <>
              <DialogHeader className="bg-gradient-to-r from-[#d17728] to-[#e6893a] px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                  {selectedNitag.country}
                </DialogTitle>
              </DialogHeader>
             
              <div className="p-4 sm:p-6 space-y-4">
                {selectedNitag.nationalNitagName && (
                  <div className="pb-4 border-b border-gray-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {selectedNitag.nationalNitagName}
                    </h3>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="font-semibold text-gray-700 sm:min-w-[120px] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      Status:
                    </span>
                    {selectedNitag.availableNitag === 'Yes' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                        <span className="font-semibold text-green-700">NITAG Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                        <span className="font-semibold text-red-700">NITAG Not Available</span>
                      </div>
                    )}
                  </div>
                  {selectedNitag.yearEstablished && (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                      <span className="font-semibold text-gray-700 sm:min-w-[120px] flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        Established:
                      </span>
                      <span className="text-gray-700 font-medium">{selectedNitag.yearEstablished}</span>
                    </div>
                  )}
                  {selectedNitag.websiteUrl ? (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                      <span className="font-semibold text-gray-700 sm:min-w-[120px] flex items-center gap-2">
                        <Globe size={16} className="text-gray-500" />
                        Website:
                      </span>
                      <a
                        href={selectedNitag.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline break-all font-medium flex items-center gap-1.5 group"
                        title="Visit NITAG official website (opens in new tab)"
                      >
                        <span>Visit Official NITAG Website</span>
                        <ExternalLink size={14} className="opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                      <span className="font-semibold text-gray-700 sm:min-w-[120px] flex items-center gap-2">
                        <Globe size={16} className="text-gray-500" />
                        Website:
                      </span>
                      <span className="text-gray-500 italic">Not available</span>
                    </div>
                  )}
                  {selectedNitag.updatedAt && (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 border-t pt-4 mt-4">
                      <span className="font-semibold text-gray-700 sm:min-w-[120px] flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        Last Updated:
                      </span>
                      <span className="text-gray-700 font-medium">{new Date(selectedNitag.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}