'use client';

import { useState, useEffect } from 'react';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search, Menu, X } from 'lucide-react';

interface Vaccine {
  licensed_vaccine_id: number;
  pathogen_name: string;
  vaccine_brand_name: string;
  single_or_combination: string;
  authority_name: string;
  manufacturer: string;
}

export default function ComparePage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [pathogens, setPathogens] = useState<string[]>([]);
  const [selectedPathogen, setSelectedPathogen] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [selectedVaccines, setSelectedVaccines] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/vaccines.json');
      const json = await res.json();
      const mapped: Vaccine[] = (json.data || []).map((item: any, idx: number) => ({
        licensed_vaccine_id: item.id ?? idx,
        pathogen_name: item.pathogen || 'Unknown',
        vaccine_brand_name: item.name || 'Unknown Vaccine',
        single_or_combination: item.single_or_combination || 'Single Pathogen Vaccine',
        authority_name: item.authority || '-',
        manufacturer: item.manufacturer || 'Unknown'
      }));
      setVaccines(mapped);
      const uniquePathogens = Array.from(new Set(mapped.map(v => v.pathogen_name))).sort();
      setPathogens(uniquePathogens);
      if (uniquePathogens.length > 0) {
        setSelectedPathogen(uniquePathogens[0]);
      }
    } catch (err) {
      setVaccines([]);
      setPathogens([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredPathogens = pathogens.filter(pathogen => {
    const matchesSearch = pathogen.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !activeLetter || pathogen.charAt(0).toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  });

  const pathogenVaccines = vaccines.filter(v => v.pathogen_name === selectedPathogen);

  const toggleVaccineSelection = (vaccineId: number) => {
    setSelectedVaccines(prev =>
      prev.includes(vaccineId)
        ? prev.filter(id => id !== vaccineId)
        : [...prev, vaccineId]
    );
  };

  const selectedVaccineDetails = vaccines.filter(v => selectedVaccines.includes(v.licensed_vaccine_id));

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-orange-50">
      <AlphabetNav onLetterClick={setActiveLetter} activeLetter={activeLetter} />

      <div className="flex relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 h-screen overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="p-4 sm:p-5 border-b border-gray-200/80 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <h2 className="font-bold text-gray-900 text-lg">Pathogens</h2>
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
                placeholder="Search pathogens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d17728] focus:border-transparent text-sm shadow-sm transition-all"
              />
              <Search className="absolute right-3 top-3 text-gray-400" size={18} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading pathogens...</div>
            ) : (
              <>
                {filteredPathogens.map(pathogen => (
                  <button
                    key={pathogen}
                    onClick={() => {
                      setSelectedPathogen(pathogen);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-4 sm:px-5 py-3 border-b border-gray-200/50 transition-all duration-200 ${
                      selectedPathogen === pathogen
                        ? 'bg-[#d17728] text-white font-semibold shadow-sm'
                        : 'text-gray-700 hover:bg-[#d17728] hover:text-white hover:shadow-sm'
                    }`}
                  >
                    <span className={selectedPathogen === pathogen ? 'font-semibold' : 'font-normal'}>{pathogen}</span>
                  </button>
                ))}
                {filteredPathogens.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="mx-auto mb-2 text-gray-400" size={24} />
                    <p className="text-sm">No pathogens found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 w-full lg:w-auto">
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all shadow-sm"
              aria-label="Open sidebar"
            >
              <Menu size={20} className="text-gray-700" />
              <span className="font-medium text-gray-700">
                {selectedPathogen || "Select Pathogen"}
              </span>
            </button>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
              <div className="bg-[#d17728] text-white px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-bold">Select Vaccines to Compare</h2>
                <p className="text-xs sm:text-sm text-orange-100 mt-1">
                  {selectedVaccines.length} vaccine{selectedVaccines.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {pathogenVaccines.map(vaccine => (
                    <label
                      key={vaccine.licensed_vaccine_id}
                      className="flex items-center gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVaccines.includes(vaccine.licensed_vaccine_id)}
                        onChange={() => toggleVaccineSelection(vaccine.licensed_vaccine_id)}
                        className="w-5 h-5 text-[#d17728] border-gray-300 rounded focus:ring-orange-500 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{vaccine.vaccine_brand_name}</div>
                        <div className="text-xs sm:text-sm text-gray-600 truncate">{vaccine.manufacturer}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {pathogenVaccines.length === 0 && (
                  <p className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">No vaccines available for this pathogen</p>
                )}
              </div>
            </div>

            {selectedVaccineDetails.length > 0 && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Comparison Table</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Property</th>
                        {selectedVaccineDetails.map(vaccine => (
                          <th key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 min-w-[150px]">
                            <span className="block truncate">{vaccine.vaccine_brand_name}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900">Pathogen</td>
                        {selectedVaccineDetails.map(vaccine => (
                          <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                            {vaccine.pathogen_name}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900">Type</td>
                        {selectedVaccineDetails.map(vaccine => (
                          <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                            {vaccine.single_or_combination || 'Single Pathogen Vaccine'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900">Manufacturer</td>
                        {selectedVaccineDetails.map(vaccine => (
                          <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                            {vaccine.manufacturer || 'Unknown'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900">Authority</td>
                        {selectedVaccineDetails.map(vaccine => (
                          <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                            {vaccine.authority_name || '-'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedVaccineDetails.length === 0 && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-gray-500">Select vaccines above to compare them</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
