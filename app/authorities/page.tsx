'use client';

import { useState, useEffect } from 'react';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface Licenser {
  licenserId: number;
  acronym: string;
  region: string;
  country: string | null;
  fullName: string;
  description: string;
  website: string;
}

interface Vaccine {
  vaccineId: number;
  vaccineBrandName: string;
  vaccineType: string;
  pathogens: string[];
  manufacturers: string[];
}

interface LicenserWithVaccines {
  licenser: {
    licenserId: number;
    acronym: string;
    fullName: string;
    region: string;
    country: string;
    website: string;
  };
  vaccineCount: number;
  vaccines: Vaccine[];
}

export default function AuthoritiesPage() {
  const [licensers, setLicensers] = useState<Licenser[]>([]);
  const [vaccinesByLicenser, setVaccinesByLicenser] = useState<{ [key: string]: Vaccine[] }>({});
  const [selectedLicenser, setSelectedLicenser] = useState<Licenser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedProfile, setExpandedProfile] = useState(true);
  const [expandedTable, setExpandedTable] = useState(true);
  const [showOtherCountries, setShowOtherCountries] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch licensers
      const licensersResponse = await fetch(`http://localhost:5000/api/licensers`);
      if (!licensersResponse.ok) {
        throw new Error(`HTTP error! status: ${licensersResponse.status}`);
      }
      const licensersData = await licensersResponse.json();
      const licensersList = licensersData.data || licensersData || [];

      setLicensers(licensersList);

      // Fetch vaccines grouped by licenser
      const vaccinesResponse = await fetch(`http://localhost:5000/api/vaccines-by-licenser`);
      if (!vaccinesResponse.ok) {
        throw new Error(`HTTP error! status: ${vaccinesResponse.status}`);
      }
      const vaccinesData = await vaccinesResponse.json();
      const vaccinesByLicenserData: LicenserWithVaccines[] = vaccinesData.data || [];

      // Create a map of licenser acronym to vaccines
      const vaccinesMap: { [key: string]: Vaccine[] } = {};
      vaccinesByLicenserData.forEach((item) => {
        if (item.licenser && item.vaccines) {
          vaccinesMap[item.licenser.acronym] = item.vaccines;
        }
      });

      setVaccinesByLicenser(vaccinesMap);

      // Set first licenser as selected
      if (licensersList.length > 0) {
        setSelectedLicenser(licensersList[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

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
    const searchText = `${licenser.acronym} ${licenser.fullName} ${licenser.region || ''}`.toLowerCase();
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
  ).sort();

  const selectedVaccines = selectedLicenser ? (vaccinesByLicenser[selectedLicenser.acronym] || []) : [];

  return (
    <div className="min-h-screen bg-orange-50">
      <AlphabetNav onLetterClick={setActiveLetter} activeLetter={activeLetter} />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-180px)] overflow-y-auto sticky top-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search licensing authorities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading authorities...</div>
          ) : (
            <>
              {/* Pinned authorities */}
              {filteredPinned.map(licenser => (
                <button
                  key={licenser.licenserId}
                  onClick={() => setSelectedLicenser(licenser)}
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

              {/* Other countries header */}
              <button
                className="w-full text-left px-4 py-3 border-b border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                onClick={() => setShowOtherCountries((prev) => !prev)}
              >
                Licensing authorities in other countries
              </button>

              {/* Other authorities list */}
              {showOtherCountries && otherCountries.map((country) => {
                const licensersInCountry = filteredOthers.filter(
                  (licenser) => (licenser.country || 'Unknown') === country
                );
                const firstLicenser = licensersInCountry[0];
                return (
                  <button
                    key={country}
                    onClick={() => firstLicenser && setSelectedLicenser(firstLicenser)}
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
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {selectedLicenser ? (
            <div className="max-w-full">
              {/* Profile Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div 
                  className="p-6 cursor-pointer flex items-center justify-between bg-gray-100 rounded-t-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setExpandedProfile(!expandedProfile)}
                >
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedLicenser.fullName} Profile
                  </h2>
                  {expandedProfile ? <ChevronUp size={24} className="text-gray-600" /> : <ChevronDown size={24} className="text-gray-600" />}
                </div>
                
                {expandedProfile && (
                  <div className="p-6">
                    <h1 className="text-3xl font-bold text-[#d17728] mb-4">
                      {selectedLicenser.fullName}
                    </h1>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {selectedLicenser.description}
                    </p>
                    {selectedLicenser.website && (
                      <a
                        href={selectedLicenser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Licensed Vaccines Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div 
                  className="p-4 bg-gray-100 cursor-pointer flex items-center justify-between hover:bg-gray-200 transition-colors"
                  onClick={() => setExpandedTable(!expandedTable)}
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    Licensed Vaccines ({selectedVaccines.length})
                  </h3>
                  {expandedTable ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                </div>

                {expandedTable && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#d17728] text-white">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold">Vaccine Brand Name</th>
                          <th className="px-6 py-4 text-left font-semibold">Single or Combination Vaccine</th>
                          <th className="px-6 py-4 text-left font-semibold">Pathogen</th>
                          <th className="px-6 py-4 text-left font-semibold">Manufacturer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVaccines.length > 0 ? (
                          selectedVaccines.map((vaccine, index) => (
                            <tr key={`${vaccine.vaccineId}-${index}`} className="border-b border-gray-200 hover:bg-orange-50 transition-colors">
                              <td className="px-6 py-4">
                                <a href="#" className="text-blue-600 hover:underline font-medium">
                                  {vaccine.vaccineBrandName}
                                </a>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                                  vaccine.vaccineType === 'single' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {vaccine.vaccineType === 'single' 
                                    ? 'Single Pathogen Vaccine' 
                                    : 'Combination Vaccine'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
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
                              </td>
                              <td className="px-6 py-4">
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