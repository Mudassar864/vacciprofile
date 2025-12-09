'use client';

import { useState, useEffect } from 'react';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-orange-50">
      <AlphabetNav onLetterClick={setActiveLetter} activeLetter={activeLetter} />

      <div className="flex">
        <aside className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-180px)] overflow-y-auto sticky top-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search pathogens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading pathogens...</div>
          ) : (
            <>
              {filteredPathogens.map(pathogen => (
                <button
                  key={pathogen}
                  onClick={() => setSelectedPathogen(pathogen)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 hover: transition-colors ${
                    selectedPathogen === pathogen
                      ? 'bg-[#d17728] text-white font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <span className={selectedPathogen === pathogen ? '' : 'italic'}>{pathogen}</span>
                </button>
              ))}
              {filteredPathogens.length === 0 && (
                <div className="p-4 text-center text-gray-500">No pathogens found</div>
              )}
            </>
          )}
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-6xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="bg-[#d17728] text-white px-6 py-4">
                <h2 className="text-xl font-bold">Select Vaccines to Compare</h2>
                <p className="text-sm text-orange-100 mt-1">
                  {selectedVaccines.length} vaccine{selectedVaccines.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pathogenVaccines.map(vaccine => (
                    <label
                      key={vaccine.licensed_vaccine_id}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover: cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVaccines.includes(vaccine.licensed_vaccine_id)}
                        onChange={() => toggleVaccineSelection(vaccine.licensed_vaccine_id)}
                        className="w-5 h-5 text-[#d17728] border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{vaccine.vaccine_brand_name}</div>
                        <div className="text-sm text-gray-600">{vaccine.manufacturer}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {pathogenVaccines.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No vaccines available for this pathogen</p>
                )}
              </div>
            </div>

            {selectedVaccineDetails.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="bg-gray-100 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-900">Comparison Table</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Property</th>
                        {selectedVaccineDetails.map(vaccine => (
                          <th key={vaccine.licensed_vaccine_id} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            {vaccine.vaccine_brand_name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Pathogen</td>
                        {selectedVaccineDetails.map(vaccine => (
                          <td key={vaccine.licensed_vaccine_id} className="px-6 py-4 text-gray-700">
                            {vaccine.pathogen_name}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Type</td>
                        {selectedVaccineDetails.map(vaccine => (
                          <td key={vaccine.licensed_vaccine_id} className="px-6 py-4 text-gray-700">
                            {vaccine.single_or_combination || 'Single Pathogen Vaccine'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Manufacturer</td>
                        {selectedVaccineDetails.map(vaccine => (
                          <td key={vaccine.licensed_vaccine_id} className="px-6 py-4 text-gray-700">
                            {vaccine.manufacturer || 'Unknown'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Authority</td>
                        {selectedVaccineDetails.map(vaccine => (
                          <td key={vaccine.licensed_vaccine_id} className="px-6 py-4 text-gray-700">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Select vaccines above to compare them</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
