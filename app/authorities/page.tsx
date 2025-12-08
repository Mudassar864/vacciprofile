'use client';

import { useState, useEffect } from 'react';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search } from 'lucide-react';

interface Authority {
  authority_id: string;
  country: string;
  authority_name: string;
  info: string;
  vaccine_brand_name: string;
  single_or_combination: string;
  pathogen_name: string;
  manufacturer: string;
  website: string;
}

export default function AuthoritiesPage() {
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [loading, setLoading] = useState(true);

  const authorityToCountry: { [key: string]: string } = {
    'FDA': 'FDA (USA)',
    'EMA': 'EMA (Europe; also see individual countries)',
    'WHO': 'WHO',
    // Add more mappings as needed for other authorities
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/vaccines');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiData = await response.json();
      const vaccines = Array.isArray(apiData) ? apiData : (apiData.vaccines || []);

      const allAuthorities: Authority[] = [];
      vaccines.forEach((vaccine: any) => {
        vaccine.productProfiles?.forEach((profile: any) => {
          const country = authorityToCountry[profile.type] || 'Other Countries';
          const matchingLicense = vaccine.licensingDates?.find((ld: any) => ld.name === profile.type);
          const manufacturerName = vaccine.manufacturerDetails?.[0]?.name || vaccine.manufacturers?.[0]?.name || '-';
          const tempId = `${vaccine._id}-${profile.type}`;

          allAuthorities.push({
            authority_id: tempId,
            country,
            authority_name: profile.type,
            info: profile.name || '',
            vaccine_brand_name: vaccine.name,
            single_or_combination: vaccine.vaccineType || '-',
            pathogen_name: vaccine.pathogenId ? `Pathogen ID: ${vaccine.pathogenId.join(', ')}` : '-', // Placeholder; fetch pathogen names if available
            manufacturer: manufacturerName,
            website: matchingLicense?.source || '-'
          });
        });
      });

      setAuthorities(allAuthorities);
      const uniqueCountries = Array.from(new Set(allAuthorities.map(a => a.country).filter(Boolean))).sort();
      setCountries(uniqueCountries);
      if (uniqueCountries.length > 0) {
        setSelectedCountry(uniqueCountries[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !activeLetter || country.charAt(0).toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  });

  const selectedAuthorities = authorities.filter(a => a.country === selectedCountry);

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
          <div className="max-w-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#d17728] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Authority Name</th>
                      <th className="px-6 py-4 text-left font-semibold">Vaccine Brand Name</th>
                      <th className="px-6 py-4 text-left font-semibold">Type</th>
                      <th className="px-6 py-4 text-left font-semibold">Pathogen</th>
                      <th className="px-6 py-4 text-left font-semibold">Manufacturer</th>
                      <th className="px-6 py-4 text-left font-semibold">Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAuthorities.length > 0 ? (
                      selectedAuthorities.map((authority) => (
                        <tr key={authority.authority_id} className="border-b border-gray-200 hover: transition-colors">
                          <td className="px-6 py-4 text-gray-900">
                            {authority.authority_name}
                          </td>
                          <td className="px-6 py-4">
                            {authority.vaccine_brand_name ? (
                              <span className="font-medium text-gray-900">{authority.vaccine_brand_name}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {authority.single_or_combination || '-'}
                          </td>
                          <td className="px-6 py-4">
                            {authority.pathogen_name ? (
                              <span className="text-[#d17728] font-medium">{authority.pathogen_name}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {authority.manufacturer || '-'}
                          </td>
                          <td className="px-6 py-4">
                            {authority.website && authority.website !== '-' ? (
                              <a
                                href={authority.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Visit &rarr;
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-500">
                          No licensing authorities found for this country.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                This table displays licensing authorities and their approved vaccines. Each row shows the regulatory body,
                country, approved vaccine details, pathogen target, and manufacturer information.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}