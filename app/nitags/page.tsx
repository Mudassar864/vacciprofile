'use client';

import { useState, useEffect } from 'react';
import { AlphabetNav } from '@/components/alphabet-nav';
import { WorldMap } from '@/components/world-map';
import { Search, CheckCircle, XCircle, Globe } from 'lucide-react';

interface NITAG {
  nitag_id: number;
  country: string;
  available: boolean;
  website: string;
  url: string;
  nitag_name: string;
  established: string;
}

export default function NITAGsPage() {
  const [nitags, setNitags] = useState<NITAG[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const sampleData: NITAG[] = [
      {
        nitag_id: 1,
        country: 'United States',
        available: true,
        website: 'https://www.cdc.gov/vaccines/',
        url: 'https://www.cdc.gov',
        nitag_name: 'ACIP',
        established: '1964'
      },
      {
        nitag_id: 2,
        country: 'Canada',
        available: true,
        website: 'https://www.canada.ca/en/public-health.html',
        url: 'https://www.canada.ca',
        nitag_name: 'NACI',
        established: '1964'
      }
    ];

    setNitags(sampleData);
    const uniqueCountries = Array.from(new Set(sampleData.map(n => n.country))).sort();
    setCountries(uniqueCountries);
    if (uniqueCountries.length > 0) {
      setSelectedCountry(uniqueCountries[0]);
    }
    setLoading(false);
  }

  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !activeLetter || country.charAt(0).toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  });

  const selectedNitag = nitags.find(n => n.country === selectedCountry);

  return (
    <div className="min-h-screen bg-orange-50">
      <AlphabetNav onLetterClick={setActiveLetter} activeLetter={activeLetter} />

      <div className="flex">
        <aside className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-180px)] overflow-y-auto sticky top-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading countries...</div>
          ) : (
            <>
              {filteredCountries.map(country => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 hover: transition-colors ${
                    selectedCountry === country
                      ? 'bg-[#d17728] text-white font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <span className={selectedCountry === country ? '' : 'italic'}>{country}</span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="p-4 text-center text-gray-500">No countries found</div>
              )}
            </>
          )}
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                National Immunization Technical Advisory Groups
              </h1>
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 px-4 py-2 bg-[#d17728] text-white rounded-lg hover:bg-[#d17728] transition-colors"
              >
                <Globe size={20} />
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>

            {showMap && (
              <div className="mb-6 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden" style={{ height: '500px' }}>
                <WorldMap
                  nitags={nitags}
                  onCountryClick={(country) => setSelectedCountry(country)}
                />
              </div>
            )}

            {selectedNitag ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedNitag.country}</h2>
                  {selectedNitag.nitag_name && (
                    <h3 className="text-xl text-[#d17728] font-semibold">{selectedNitag.nitag_name}</h3>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700 w-32">Status:</span>
                    {selectedNitag.available ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={20} />
                        <span className="font-medium">NITAG Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle size={20} />
                        <span className="font-medium">NITAG Not Available</span>
                      </div>
                    )}
                  </div>

                  {selectedNitag.established && (
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-gray-700 w-32">Established:</span>
                      <span className="text-gray-600">{selectedNitag.established}</span>
                    </div>
                  )}

                  {selectedNitag.website && (
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-gray-700 w-32">Website:</span>
                      <a
                        href={selectedNitag.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedNitag.website}
                      </a>
                    </div>
                  )}

                  {selectedNitag.url && (
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-gray-700 w-32">Reference:</span>
                      <a
                        href={selectedNitag.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedNitag.url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg">Select a country to view NITAG information</p>
              </div>
            )}

            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-2">About NITAGs</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                National Immunization Technical Advisory Groups (NITAGs) are multidisciplinary bodies that provide
                evidence-based recommendations to policymakers on immunization programs. They play a crucial role in
                national immunization policy development and implementation.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
