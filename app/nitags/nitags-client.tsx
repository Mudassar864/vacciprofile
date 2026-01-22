'use client';

import { useState, lazy, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Menu } from 'lucide-react';
import { SidebarWithSearch } from '@/components/common/sidebar-with-search';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 ">
      <div className="hidden md:block">
        <AlphabetNav onLetterClick={setActiveLetter} activeLetter={activeLetter} />
      </div>

      <div className="flex relative">
        <SidebarWithSearch
          title="Countries"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Type to search countries..."
          items={filteredCountries}
          selectedItem={selectedCountry}
          onItemClick={(country) => {
            handleCountrySelect(country);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          hintText="💡 Click on a country to view NITAG details"
          sidebarClassName="bg-white/95 backdrop-blur-sm border-gray-200/50 shadow-xl lg:shadow-none"
          headerClassName="bg-gradient-to-r from-gray-50 to-white border-gray-200/80"
          itemClassName={(isSelected) => {
            return `w-full text-left px-5 py-3.5 border-b border-gray-200/50 transition-all duration-200 ${
              isSelected
                ? 'bg-[#d17728] text-white font-semibold shadow-sm'
                : 'hover:bg-[#d17728] hover:text-white hover:shadow-sm text-white'
            }`;
          }}
          itemStyle={(isSelected, country) => {
            if (isSelected || !country) {
              return {};
            }
            
            const countryNitag = initialNitags.find(n => n.country === country);
            const isAvailable = countryNitag?.availableNitag === 'Yes';
            const hasWebsite = !!countryNitag?.websiteUrl;
            const hasData = !!countryNitag;
            
            let bgColor = '#b42328';
            if (hasData) {
              if (isAvailable && hasWebsite) {
                bgColor = '#0d8c50';
              } else if (isAvailable && !hasWebsite) {
                bgColor = '#eeb923';
              }
            }
            
            return { backgroundColor: bgColor };
          }}
          renderItem={(country, isSelected) => {
            return (
              <span className={isSelected ? 'font-semibold' : 'font-normal'}>
                {country}
              </span>
            );
          }}
        />

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