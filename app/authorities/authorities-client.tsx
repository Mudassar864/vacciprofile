'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search, ChevronDown, ChevronUp, Menu, X, ExternalLink, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductProfile, LicensingDate } from '@/lib/types';
import { ProductProfileComparison } from '@/components/vaccines/product-profile-comparison';

export interface Licenser {
  licenserId: number;
  acronym: string;
  region: string;
  country: string | null;
  fullName: string;
  description: string;
  website: string;
  updatedAt?: string;
}

export interface Vaccine {
  vaccineId: number;
  vaccineBrandName: string;
  vaccineType: string;
  pathogens: string[];
  manufacturers: string[];
  productProfiles?: ProductProfile[];
  licensingDates?: LicensingDate[];
}

interface AuthoritiesClientProps {
  initialLicensers: Licenser[];
  initialVaccinesByLicenser: { [key: string]: Vaccine[] };
  initialSelectedLicenserName?: string;
  initialSelectedCountry?: string;
}

export function AuthoritiesClient({
  initialLicensers,
  initialVaccinesByLicenser,
  initialSelectedLicenserName,
  initialSelectedCountry,
}: AuthoritiesClientProps) {
  const router = useRouter();
  const [licensers] = useState<Licenser[]>(initialLicensers);
  const [vaccinesByLicenser] = useState<{ [key: string]: Vaccine[] }>(initialVaccinesByLicenser);
  
  // Determine default licenser: country first, then licenser name, then EMA, then first licenser
  let defaultLicenser: Licenser | null = null;
  
  if (initialSelectedCountry) {
    // If country is specified, find first licenser in that country
    const countryLicensers = initialLicensers.filter(l => 
      (l.country || '').toLowerCase() === initialSelectedCountry.toLowerCase()
    );
    defaultLicenser = countryLicensers[0] || null;
  } else if (initialSelectedLicenserName) {
    // If licenser name is specified, find by acronym
    defaultLicenser = initialLicensers.find(l => 
      l.acronym?.toUpperCase() === initialSelectedLicenserName.toUpperCase()
    ) || null;
  }
  
  // Fallback to EMA, then first licenser
  if (!defaultLicenser) {
    defaultLicenser = initialLicensers.find(l => l.acronym?.toUpperCase() === 'EMA') ||
      initialLicensers[0] ||
      null;
  }
  
  const [selectedLicenser, setSelectedLicenser] = useState<Licenser | null>(defaultLicenser);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [expandedProfile, setExpandedProfile] = useState(true);
  const [expandedTable, setExpandedTable] = useState(true);
  const [showOtherCountries, setShowOtherCountries] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [loadingProductProfiles, setLoadingProductProfiles] = useState(false);

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
    // Use licenser acronym (name) instead of ID
    const url = `/authorities?licenser=${encodeURIComponent(licenser.acronym)}`;
    window.history.pushState({}, '', url);
    setSelectedLicenser(licenser);
    // Use replace to avoid adding to history stack for query param changes
    router.replace(url);
  };

  const fetchProductProfiles = async (vaccineName: string) => {
    setLoadingProductProfiles(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
      const response = await fetch(
        `${API_BASE}/api/product-profiles?vaccineName=${encodeURIComponent(vaccineName)}`,
        { cache: 'no-store' }
      );
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const result = await response.json();
      return result.productProfiles || [];
    } catch (error) {
      console.error('Error fetching product profiles:', error);
      return [];
    } finally {
      setLoadingProductProfiles(false);
    }
  };

  const fetchLicensingDates = async (vaccineName: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
      const response = await fetch(
        `${API_BASE}/api/licensing-dates?vaccineName=${encodeURIComponent(vaccineName)}`,
        { cache: 'no-store' }
      );
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const result = await response.json();
      return result.licensingDates || [];
    } catch (error) {
      console.error('Error fetching licensing dates:', error);
      return [];
    }
  };

  const handleVaccineClick = async (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    const vaccineName = vaccine.vaccineBrandName || '';
    if (vaccineName) {
      const [profiles, licensingDates] = await Promise.all([
        fetchProductProfiles(vaccineName),
        fetchLicensingDates(vaccineName)
      ]);
      setSelectedVaccine({
        ...vaccine,
        productProfiles: profiles,
        licensingDates: licensingDates,
      });
    }
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
                placeholder="Type to search authorities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                aria-label="Search licensing authorities"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 Click on an authority to view approved vaccines</p>
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
                const isSelected = selectedLicenser && licensersInCountry.some(l => 
                  l.licenserId === selectedLicenser.licenserId
                );
                
                return (
                  <button
                    key={country}
                    onClick={() => {
                      if (firstLicenser) {
                        // Use country name in URL when clicking on country
                        const url = `/authorities?country=${encodeURIComponent(country)}`;
                        window.history.pushState({}, '', url);
                        setSelectedLicenser(firstLicenser);
                        router.replace(url);
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-orange-100 transition-colors ${
                      isSelected
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
                    {selectedLicenser.website && (
                      <a
                        href={selectedLicenser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium text-sm sm:text-base break-all inline-flex items-center gap-2"
                        title="Visit licensing authority website (opens in new tab)"
                      >
                        <span>Visit Official Website</span>
                        <ExternalLink size={14} className="opacity-70" />
                      </a>
                    )}
                    {selectedLicenser.description && (() => {
                      // Extract bullets (lines starting with •) and regular text/headings
                      const lines = selectedLicenser.description.split('\n').map(line => line.trim()).filter(line => line);
                      const content: Array<{ type: 'heading' | 'bullet' | 'text'; content: string }> = [];
                      
                      lines.forEach((line, index) => {
                        if (line.startsWith('•') || line.startsWith('●') || line.startsWith('▪') || line.startsWith('▸')) {
                          // Remove bullet character and trim
                          const bulletText = line.replace(/^[•●▪▸]\s*/, '').trim();
                          if (bulletText) {
                            content.push({ type: 'bullet', content: bulletText });
                          }
                        } else {
                          // Check if line contains text in curly braces {} - this is a heading
                          const curlyBraceMatch = line.match(/\{([^}]+)\}/);
                          if (curlyBraceMatch) {
                            // Extract text from curly braces and use as heading
                            const headingText = curlyBraceMatch[1].trim();
                            if (headingText) {
                              content.push({ type: 'heading', content: headingText });
                            }
                            // If there's text after the braces, add it as regular text
                            const textAfterBraces = line.replace(/\{[^}]+\}/, '').trim();
                            if (textAfterBraces) {
                              content.push({ type: 'text', content: textAfterBraces });
                            }
                          } else {
                            // Check if it's a heading based on other criteria:
                            // - Short line (less than 60 chars) and followed by bullets
                            // - Or all caps and short
                            // - Or has 3 or fewer words and is followed by a line break (next line is bullet or heading)
                            const wordCount = line.split(/\s+/).filter(word => word.length > 0).length;
                            const isShort = line.length < 60;
                            const isAllCaps = line === line.toUpperCase() && line.length > 3 && /[A-Z]/.test(line);
                            const hasFewWords = wordCount <= 3;
                            const nextLineIsBullet = index < lines.length - 1 && 
                              (lines[index + 1].startsWith('•') || lines[index + 1].startsWith('●') || 
                               lines[index + 1].startsWith('▪') || lines[index + 1].startsWith('▸'));
                            const nextLineExists = index < lines.length - 1;
                            const nextLineIsShort = nextLineExists && lines[index + 1].split(/\s+/).filter(word => word.length > 0).length <= 3;
                            
                            // If it's short and followed by bullets, or all caps, or has 3 or fewer words and followed by content, treat as heading
                            if ((isShort && nextLineIsBullet) || (isAllCaps && isShort) || (hasFewWords && (nextLineIsBullet || nextLineIsShort))) {
                              content.push({ type: 'heading', content: line });
                            } else {
                              content.push({ type: 'text', content: line });
                            }
                          }
                        }
                      });
                      
                      return (
                        <div className="mt-4">
                          {content.map((item, i) => {
                            if (item.type === 'heading') {
                              return (
                                <h3 key={i} className="text-lg font-semibold text-[#d17728] mt-6 mb-3 first:mt-0">
                                  {item.content}
                                </h3>
                              );
                            } else if (item.type === 'bullet') {
                              return (
                                <div key={i} className="flex items-start gap-3 mb-3">
                                  <span className="text-[#d17728] mt-1.5 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                  <span className="text-gray-700 leading-relaxed text-sm sm:text-base flex-1">
                                    {item.content}
                                  </span>
                                </div>
                              );
                            } else {
                              return (
                                <p key={i} className="text-gray-700 leading-relaxed mb-3 text-sm sm:text-base">
                                  {item.content}
                                </p>
                              );
                            }
                          })}
                        </div>
                      );
                    })()}
                    
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
                                <button
                                  onClick={() => handleVaccineClick(vaccine)}
                                  className="text-blue-600 hover:underline font-medium text-sm cursor-pointer text-left hover:text-blue-800 transition-colors flex items-center gap-1 group"
                                  title="Click to view product profile and licensing details"
                                >
                                  <span>{vaccine.vaccineBrandName}</span>
                                  <span className="text-xs opacity-0 group-hover:opacity-70 transition-opacity">→</span>
                                </button>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <span className={`inline-block px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                                  vaccine.vaccineType === 'single' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {vaccine.vaccineType === "single" ? "Single" : "Combination"}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                {vaccine.pathogens && vaccine.pathogens.length > 0 ? (
                                  <div className="space-y-1">
                                    {vaccine.pathogens.map((pathogen, idx) => (
                                      <Link 
                                        key={idx} 
                                        href={`/vaccines?pathogen=${encodeURIComponent(pathogen)}`}
                                        className="text-blue-600 hover:underline block text-sm cursor-pointer"
                                      >
                                        {pathogen}
                                      </Link>
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
                                      <Link 
                                        key={idx} 
                                        href={`/manufacturers?manufacturer=${encodeURIComponent(manufacturer)}`}
                                        className="text-blue-600 hover:underline block text-sm cursor-pointer"
                                      >
                                        {manufacturer}
                                      </Link>
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
                            <td colSpan={5} className="p-12 text-center text-gray-500">
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
                                <button
                                  onClick={() => handleVaccineClick(vaccine)}
                                  className="text-blue-600 hover:underline font-medium text-left cursor-pointer flex items-center gap-1 group"
                                  title="Tap to view product profile"
                                >
                                  <span>{vaccine.vaccineBrandName}</span>
                                  <span className="text-xs opacity-0 group-hover:opacity-70 transition-opacity">→</span>
                                </button>
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
                                  {vaccine.vaccineType === "single" ? "Single" : "Combination"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Pathogen</span>
                              <div className="mt-1">
                                {vaccine.pathogens && vaccine.pathogens.length > 0 ? (
                                  <div className="space-y-1">
                                    {vaccine.pathogens.map((pathogen, idx) => (
                                      <Link 
                                        key={idx} 
                                        href={`/vaccines?pathogen=${encodeURIComponent(pathogen)}`}
                                        className="text-blue-600 hover:underline block cursor-pointer"
                                      >
                                        {pathogen}
                                      </Link>
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
                                        <Link 
                                          key={idx} 
                                          href={`/manufacturers?manufacturer=${encodeURIComponent(manufacturer)}`}
                                          className="text-blue-600 hover:underline block cursor-pointer"
                                        >
                                          {manufacturer}
                                        </Link>
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

      {/* Product Profile Dialog */}
      <Dialog open={!!selectedVaccine} onOpenChange={(open) => {
        if (!open) setSelectedVaccine(null);
      }}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto p-0 mx-2 sm:mx-4">
          {selectedVaccine && (
            <>
              <DialogHeader className="bg-gradient-to-r from-[#d17728] to-[#e6893a] px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-t-lg">
                <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white break-words">
                  {selectedVaccine.vaccineBrandName || ""}
                </DialogTitle>
              </DialogHeader>
              
              <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600 break-words">
                      {selectedVaccine.vaccineType === "single" ? "Single" : "Combination"}
                    </span>
                  </div>
                </div>

                {loadingProductProfiles ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d17728]"></div>
                    <p className="mt-2 text-gray-600">Loading product profiles...</p>
                  </div>
                ) : selectedVaccine.productProfiles && Array.isArray(selectedVaccine.productProfiles) && selectedVaccine.productProfiles.length > 0 ? (
                  <ProductProfileComparison
                    profiles={selectedVaccine.productProfiles}
                    licensingDates={selectedVaccine.licensingDates || []}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No product profile information available for this vaccine.
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

