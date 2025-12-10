import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Calendar, Globe, ExternalLink, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface NITAG {
  country: string;
  availableNitag: string;
  nationalNitagName: string;
  yearEstablished: number | null;
  availableWebsite: string;
  websiteUrl: string;
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

export default function WorldMap({ nitags, selectedCountry = "", onCountryClick }: WorldMapProps) {
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
    return nitags.find(nitag => nitag.country.toLowerCase() === countryName.toLowerCase());
  };

  const hasNitag = (countryName: string): boolean => {
    const nitagInfo = getNitagInfo(countryName);
    return nitagInfo?.availableNitag.toLowerCase() === 'yes';
  };

  const handleMouseEnter = (geo: Geography, event: React.MouseEvent<SVGPathElement>) => {
    setTooltip({
      show: true,
      name: geo.properties.name,
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
    setTooltip(prev => ({
      ...prev,
      x: event.clientX,
      y: event.clientY
    }));
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, name: "", x: 0, y: 0 });
  };

  const handleClick = (geo: Geography) => {
    // Only trigger click if we haven't dragged
    if (!hasDragged && onCountryClick) {
      onCountryClick(geo.properties.name);
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
        
        <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-300 border border-green-500 rounded"></div>
            <span className="text-gray-600">NITAG Available</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 border border-gray-400 rounded"></div>
            <span className="text-gray-600">No NITAG</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Selected</span>
          </div>
        </div>
      </div>

      <div 
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
                  const countryHasNitag = hasNitag(geo.properties.name);
                  const isSelected = selectedCountry === geo.properties.name;
                  
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
                            ? "#3B82F6" 
                            : countryHasNitag 
                              ? "#86EFAC" 
                              : "#D6D6DA",
                          outline: "none",
                          stroke: countryHasNitag ? "#22C55E" : "#E5E7EB",
                          strokeWidth: 0.5
                        },
                        hover: {
                          fill: "#3B82F6",
                          outline: "none",
                          cursor: "pointer"
                        },
                        pressed: {
                          fill: "#1D4ED8",
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      <Dialog open={!!(selectedCountry && selectedNitag)} onOpenChange={(open) => {
        if (!open && onCountryClick) {
          onCountryClick('');
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
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
                      >
                        {selectedNitag.websiteUrl}
                        <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {tooltip.show && (
        <div
          className="fixed bg-gray-800 text-white px-3 py-2 rounded shadow-lg text-sm pointer-events-none z-50"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y + 10}px`
          }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
}