'use client';

import { useState, lazy, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search, Menu, X, ExternalLink } from 'lucide-react';

// Lazy load heavy WorldMap component
const WorldMap = lazy(() => import('@/components/world-map'));

export interface NITAG {
  country: string;
  availableNitag: string;
  availableWebsite: string;
  websiteUrl: string;
  nationalNitagName: string;
  yearEstablished: number | null;
  updatedAt?: string;
}

interface NITAGsClientProps {
  initialNitags: NITAG[];
  initialSelectedCountry?: string;
}

export function NITAGsClient({
  initialNitags,
  initialSelectedCountry,
}: NITAGsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use Next.js searchParams directly
  const countryParam = searchParams?.get("country");
  const selectedCountry = countryParam || initialSelectedCountry || '';
  
  const countries = Array.from(new Set(initialNitags.map(n => n.country))).sort();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredCountries = countries.filter(country => {
      const matchesSearch = country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLetter = !activeLetter || country.charAt(0).toUpperCase() === activeLetter;
      return matchesSearch && matchesLetter;
    });

  const handleCountrySelect = (country: string) => {
    const url = country ? `/nitags?country=${encodeURIComponent(country)}` : '/nitags';
    router.push(url);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100">
      <div className="hidden md:block">
        <AlphabetNav onLetterClick={setActiveLetter} activeLetter={activeLetter} />
      </div>

      <div className="flex relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-0 left-0 z-[60] w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 h-screen lg:h-[calc(100vh-140px)] overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="p-5 border-b border-gray-200/80 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <h2 className="font-bold text-gray-900 text-lg">Countries</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Type to search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d17728] focus:border-transparent text-sm shadow-sm transition-all"
                aria-label="Search countries"
              />
              <Search className="absolute right-3 top-3 text-gray-400" size={18} />
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 Click on a country to view NITAG details</p>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {filteredCountries.length > 0 ? (
              <>
                {filteredCountries.map(country => {
                  const countryNitag = initialNitags.find(n => n.country === country);
                  const isAvailable = countryNitag?.availableNitag === 'Yes';
                  const hasWebsite = !!countryNitag?.websiteUrl;
                  const hasData = !!countryNitag;
                  
                  // Determine background color based on NITAG and website status
                  let bgColor = '#b42328'; // Default: no NITAG available or no data
                  let textColor = 'text-gray-800';
                  
                  if (hasData) {
                    if (isAvailable && hasWebsite) {
                      bgColor = '#0d8c50'; // Green: NITAG available with website
                    } else if (isAvailable && !hasWebsite) {
                      bgColor = '#eeb923'; // Yellow: NITAG available but no website
                    } else {
                      bgColor = '#b42328'; // Red: NITAG not available
                    }
                  } else {
                    bgColor = '#b42328'; // Red: No data
                  }
                  
                  // Override if selected
                  const isSelected = selectedCountry === country;
                  if (isSelected) {
                    bgColor = '#d17728';
                    textColor = 'text-white';
                  }
                  
                  return (
                    <button
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      style={{ backgroundColor: isSelected ? undefined : bgColor }}
                      className={`w-full text-left px-5 py-3.5 border-b border-gray-200/50 transition-all duration-200 ${textColor} ${
                        isSelected
                          ? 'bg-[#d17728] text-white font-semibold shadow-sm'
                          : 'hover:bg-[#d17728] hover:text-white hover:shadow-sm'
                      }`}
                    >
                      <span className={isSelected ? 'font-semibold' : 'font-normal'}>{country}</span>
                    </button>
                  );
                })}
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-sm">No countries found</p>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 w-full lg:w-auto">
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all shadow-sm w-full"
              aria-label="Open sidebar to select country"
            >
              <Menu size={20} className="text-gray-700" />
              <span className="font-medium text-gray-700">
                {selectedCountry || "👆 Tap to select a country"}
              </span>
            </button>
            {!selectedCountry && (
              <p className="text-xs text-gray-500 mt-1 ml-1">Select a country to view NITAG information</p>
            )}
          </div>

          <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d17728] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            }>
              <WorldMap
                nitags={initialNitags}
                selectedCountry={selectedCountry}
                onCountryClick={handleCountrySelect}
              />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}