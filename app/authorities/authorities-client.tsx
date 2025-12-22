'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';

export interface Licenser {
  licenserId: number;
  acronym: string;
  region: string;
  country: string | null;
  fullName: string;
  description: string;
  website: string;
}

export interface Vaccine {
  vaccineId: number;
  vaccineBrandName: string;
  vaccineType: string;
  pathogens: string[];
  manufacturers: string[];
}

interface AuthoritiesClientProps {
  initialLicensers: Licenser[];
  initialVaccinesByLicenser: { [key: string]: Vaccine[] };
  initialSelectedLicenserId?: number;
}

export function AuthoritiesClient({
  initialLicensers,
  initialVaccinesByLicenser,
  initialSelectedLicenserId,
}: AuthoritiesClientProps) {
  const router = useRouter();
  const [licensers] = useState<Licenser[]>(initialLicensers);
  const [vaccinesByLicenser] = useState<{ [key: string]: Vaccine[] }>(initialVaccinesByLicenser);
  const [selectedLicenser, setSelectedLicenser] = useState<Licenser | null>(
    initialLicensers.find(l => l.licenserId === initialSelectedLicenserId) || initialLicensers[0] || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [expandedProfile, setExpandedProfile] = useState(true);
  const [expandedTable, setExpandedTable] = useState(true);
  const [showOtherCountries, setShowOtherCountries] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const specialAuthorities = ['FDA', 'EMA', 'WHO'];
  const prioritizedLicensers = [...licensers].sort((a, b) => {
    const aIsSpecial = specialAuthorities.includes(a.acronym?.toUpperCase());
    const bIsSpecial = specialAuthorities.includes(b.acronym?.toUpperCase());
    if (aIsSpecial && !bIsSpecial) return -1;
    if (!aIsSpecial && bIsSpecial) return 1;
    return a.acronym.localeCompare(b.acronym);
  });

  const pinnedLicensers = prioritizedLicensers.filter((licenser) =>
    specialAuthorities.includes(licenser.acronym?.toUpperCase())
  );
  const otherLicensers = prioritizedLicensers.filter(
    (licenser) => !specialAuthorities.includes(licenser.acronym?.toUpperCase())
  );

  const filterFn = (licenser: Licenser) => {
    const searchText = `${licenser.acronym} ${licenser.fullName} ${licenser.region || ''} ${licenser.country || ''}`.toLowerCase();
    const matchesSearch = searchText.includes(searchQuery.toLowerCase());
    const matchesLetter = !activeLetter || licenser.acronym.charAt(0).toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  };

  const filteredPinned = pinnedLicensers.filter(filterFn);
  const filteredOthers = otherLicensers.filter(filterFn);
  const otherCountries = Array.from(
    new Set(
      filteredOthers.map((licenser) => licenser.country || 'Unknown')
    )
  )
    .filter(country => {
      // Filter countries based on search query
      if (!searchQuery) return true;
      const countryMatches = country.toLowerCase().includes(searchQuery.toLowerCase());
      // Also check if any licenser in this country matches
      const hasMatchingLicenser = filteredOthers.some(
        (licenser) => (licenser.country || 'Unknown') === country
      );
      return countryMatches || hasMatchingLicenser;
    })
    .sort();

  const selectedVaccines = selectedLicenser ? (vaccinesByLicenser[selectedLicenser.acronym] || []) : [];

  const handleLicenserClick = (licenser: Licenser) => {
    // Update URL immediately using window.history, then update state
    const url = `/authorities?licenser=${encodeURIComponent(licenser.licenserId)}`;
    window.history.pushState({}, '', url);
    setSelectedLicenser(licenser);
    // Use replace to avoid adding to history stack for query param changes
    router.replace(url);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <AlphabetNav onLetterClick={setActiveLetter} activeLetter={activeLetter} />

      <div className="flex relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-0 left-0 z-50 w-80 bg-white border-r border-gray-200 h-screen overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between mb-2 lg:hidden">
              <h2 className="font-semibold text-gray-800">Authorities</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-800"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search licensing authorities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <>
              {filteredPinned.map(licenser => (
                <button
                  key={licenser.licenserId}
                  onClick={() => {
                    handleLicenserClick(licenser);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-orange-100 transition-colors ${
                    selectedLicenser?.licenserId === licenser.licenserId
                      ? 'bg-[#d17728] text-white font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="font-medium">
                    {licenser.acronym} {licenser.region ? `${licenser.region}` : ''}
                  </div>
                </button>
              ))}

              <button
                className={`w-full text-left px-4 py-3 border-b border-gray-200 transition-colors font-medium flex items-center justify-between ${
                  showOtherCountries 
                    ? 'bg-[#d17728] text-white hover:bg-orange-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setShowOtherCountries((prev) => !prev)}
              >
                <span>Licensing authorities in other countries</span>
                <ChevronDown
                  className={`transition-transform flex-shrink-0 ${showOtherCountries ? 'rotate-180' : ''}`}
                  size={20}
                />
              </button>

              {showOtherCountries && otherCountries.map((country) => {
                const licensersInCountry = filteredOthers.filter(
                  (licenser) => (licenser.country || 'Unknown') === country
                );
                const firstLicenser = licensersInCountry[0];
                return (
                  <button
                    key={country}
                    onClick={() => {
                      if (firstLicenser) {
                        handleLicenserClick(firstLicenser);
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-orange-100 transition-colors ${
                      selectedLicenser && licensersInCountry.some(l => l.licenserId === selectedLicenser.licenserId)
                        ? 'bg-[#d17728] text-white font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="font-medium">
                      {country}
                    </div>
                  </button>
                );
              })}

              {filteredPinned.length === 0 && filteredOthers.length === 0 && (
                <div className="p-4 text-center text-gray-500">No authorities found</div>
              )}
            </>
          </div>
        </aside>

        <main className="flex-1 p-3 sm:p-6 w-full lg:w-auto">
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
              <span className="font-medium text-gray-700">
                {selectedLicenser?.acronym || selectedLicenser?.fullName || "Select Authority"}
              </span>
            </button>
          </div>
          {selectedLicenser ? (
            <div className="max-w-full">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div 
                  className="p-4 sm:p-6 cursor-pointer flex items-center justify-between bg-gray-100 rounded-t-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setExpandedProfile(!expandedProfile)}
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {selectedLicenser.fullName} Profile
                  </h2>
                  {expandedProfile ? <ChevronUp size={24} className="text-gray-600 flex-shrink-0" /> : <ChevronDown size={24} className="text-gray-600 flex-shrink-0" />}
                </div>
                
                {expandedProfile && (
                  <div className="p-4 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#d17728] mb-4">
                      {selectedLicenser.fullName}
                    </h1>
                    <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                      {selectedLicenser.description}
                    </p>
                    {selectedLicenser.website && (
                      <a
                        href={selectedLicenser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium text-sm sm:text-base break-all"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div 
                  className="p-4 bg-gray-100 cursor-pointer flex items-center justify-between hover:bg-gray-200 transition-colors"
                  onClick={() => setExpandedTable(!expandedTable)}
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Licensed Vaccines ({selectedVaccines.length})
                  </h3>
                  {expandedTable ? <ChevronUp size={20} className="text-gray-600 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-600 flex-shrink-0" />}
                </div>

                {expandedTable && (
                  <div className="overflow-x-auto">
                    <table className="hidden md:table w-full">
                      <thead className="bg-[#d17728] text-white">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm">Vaccine Brand Name</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm">Single or Combination Vaccine</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm">Pathogen</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm">Manufacturer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVaccines.length > 0 ? (
                          selectedVaccines.map((vaccine, index) => (
                            <tr key={`${vaccine.vaccineId}-${index}`} className="border-b border-gray-200 hover:bg-orange-50 transition-colors">
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <a href="#" className="text-blue-600 hover:underline font-medium text-sm">
                                  {vaccine.vaccineBrandName}
                                </a>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <span className={`inline-block px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                                  vaccine.vaccineType === 'single' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {vaccine.vaccineType === 'single' 
                                    ? 'Single Pathogen Vaccine' 
                                    : 'Combination Vaccine'}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                {vaccine.pathogens && vaccine.pathogens.length > 0 ? (
                                  <div className="space-y-1">
                                    {vaccine.pathogens.map((pathogen, idx) => (
                                      <a 
                                        key={idx} 
                                        href="#" 
                                        className="text-blue-600 hover:underline block text-sm"
                                      >
                                        {pathogen}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                {vaccine.manufacturers && vaccine.manufacturers.length > 0 ? (
                                  <div className="space-y-1">
                                    {vaccine.manufacturers.map((manufacturer, idx) => (
                                      <a 
                                        key={idx} 
                                        href="#" 
                                        className="text-blue-600 hover:underline block text-sm"
                                      >
                                        {manufacturer}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-gray-500">
                              No licensed vaccines found for this authority.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    <div className="md:hidden divide-y divide-gray-200">
                      {selectedVaccines.length > 0 ? (
                        selectedVaccines.map((vaccine, index) => (
                          <div key={`${vaccine.vaccineId}-${index}`} className="p-4 space-y-3 hover:bg-orange-50 transition-colors">
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Vaccine Brand Name</span>
                              <div className="mt-1">
                                <a href="#" className="text-blue-600 hover:underline font-medium">
                                  {vaccine.vaccineBrandName}
                                </a>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Type</span>
                              <div className="mt-1">
                                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                                  vaccine.vaccineType === 'single' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {vaccine.vaccineType === 'single' 
                                    ? 'Single Pathogen Vaccine' 
                                    : 'Combination Vaccine'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Pathogen</span>
                              <div className="mt-1">
                                {vaccine.pathogens && vaccine.pathogens.length > 0 ? (
                                  <div className="space-y-1">
                                    {vaccine.pathogens.map((pathogen, idx) => (
                                      <a 
                                        key={idx} 
                                        href="#" 
                                        className="text-blue-600 hover:underline block"
                                      >
                                        {pathogen}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Manufacturer</span>
                              <div className="mt-1">
                                {vaccine.manufacturers && vaccine.manufacturers.length > 0 ? (
                                  <div className="space-y-1">
                                    {vaccine.manufacturers.map((manufacturer, idx) => (
                                      <a 
                                        key={idx} 
                                        href="#" 
                                        className="text-blue-600 hover:underline block"
                                      >
                                        {manufacturer}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          No licensed vaccines found for this authority.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Select a licensing authority to view details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

