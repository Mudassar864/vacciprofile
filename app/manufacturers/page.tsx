'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, Building2, Globe, Calendar, Users, DollarSign } from 'lucide-react';

interface LicensingDate {
  name: string;
  type: string;
  approvalDate: string;
  source: string;
  lastUpdated: string;
}

interface LicensedVaccine {
  _id: string;
  vaccineId: number;
  name: string;
  pathogenId: number[];
  vaccineType: string;
  licensingDates: LicensingDate[];
}

interface CandidateVaccine {
  _id: string;
  pathogenName: string;
  name: string;
  manufacturer: string;
  platform: string;
  clinicalPhase: string;
  companyUrl: string;
  other: string;
  lastUpdated: string;
}

interface ManufacturerDetails {
  website: string;
  founded: string;
  headquarters: string;
  ceo: string;
  revenue: string;
  operatingIncome: string;
  netIncome: string;
  totalAssets: string;
  totalEquity: string;
  numberOfEmployees: string;
}

interface Manufacturer {
  _id: string;
  manufacturerId: number;
  name: string;
  description: string;
  history: string;
  details: ManufacturerDetails;
  licensedVaccines: LicensedVaccine[];
  candidateVaccines: CandidateVaccine[];
  lastUpdated: string;
}

interface AlphabetNavProps {
  onLetterClick: (letter: string) => void;
  activeLetter: string;
}

const AlphabetNav = ({ onLetterClick, activeLetter }: AlphabetNavProps) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center gap-2 p-4 flex-wrap">
        <button
          onClick={() => onLetterClick('')}
          className={`px-3 py-1 rounded transition-colors ${
            activeLetter === '' 
              ? 'bg-[#d17728] text-white font-semibold' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {alphabet.map(letter => (
          <button
            key={letter}
            onClick={() => onLetterClick(letter)}
            className={`px-3 py-1 rounded transition-colors ${
              activeLetter === letter 
                ? 'bg-[#d17728] text-white font-semibold' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    licensedVaccines: true,
    candidateVaccines: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/manufacturers`);
      console.log('Fetch response:', response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        // Sort manufacturers alphabetically by name after fetching
        const sortedManufacturers = data.sort((a, b) => a.name.localeCompare(b.name));
        setManufacturers(sortedManufacturers);
        if (sortedManufacturers.length > 0) {
          setSelectedManufacturer(sortedManufacturers[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  const filteredManufacturers = manufacturers.filter(manufacturer => {
    const matchesSearch = manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !activeLetter || manufacturer.name.charAt(0).toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  });

  const toggleSection = (section: 'profile' | 'licensedVaccines' | 'candidateVaccines') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPhaseDisplay = (clinicalPhase: string, manufacturer: string) => {
    if (!clinicalPhase || clinicalPhase === 'No data') {
      return {
        phase_i: null,
        phase_ii: null,
        phase_iii: null,
        phase_iv: null
      };
    }

    const phases = {
      phase_i: null as string | null,
      phase_ii: null as string | null,
      phase_iii: null as string | null,
      phase_iv: null as string | null
    };

    const phaseUpper = clinicalPhase.toUpperCase();
    
    if (phaseUpper.includes('PHASE IV') || phaseUpper.includes('PHASE 4')) {
      phases.phase_iv = manufacturer;
    } else if (phaseUpper.includes('PHASE III') || phaseUpper.includes('PHASE 3')) {
      phases.phase_iii = manufacturer;
    } else if (phaseUpper.includes('PHASE II') || phaseUpper.includes('PHASE 2')) {
      phases.phase_ii = manufacturer;
    } else if (phaseUpper.includes('PHASE I') || phaseUpper.includes('PHASE 1')) {
      phases.phase_i = manufacturer;
    }

    return phases;
  };

  const getPhaseLabel = (phase: string | null, companyUrl: string) => {
    if (!phase) {
      return null;
    }
    
    if (companyUrl) {
      return (
        <a
          href={companyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
        >
          {phase}
        </a>
      );
    }
    
    return (
      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        {phase}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <AlphabetNav onLetterClick={setActiveLetter} activeLetter={activeLetter} />

      <div className="flex">
        <aside className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-180px)] overflow-y-auto sticky top-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search manufacturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading manufacturers...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <p className="font-semibold">Error loading data</p>
              <p className="text-sm mt-2">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-3 px-4 py-2 bg-[#d17728] text-white rounded hover:bg-orange-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {filteredManufacturers.map(manufacturer => (
                <button
                  key={manufacturer._id}
                  onClick={() => setSelectedManufacturer(manufacturer)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 hover: transition-colors ${
                    selectedManufacturer?._id === manufacturer._id
                      ? 'bg-[#d17728] text-white font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <span className={selectedManufacturer?._id === manufacturer._id ? '' : 'italic'}>
                    {manufacturer.name}
                  </span>
                </button>
              ))}
              {filteredManufacturers.length === 0 && (
                <div className="p-4 text-center text-gray-500">No manufacturers found</div>
              )}
            </>
          )}
        </aside>

        <main className="flex-1 p-6">
          {selectedManufacturer && (
            <div className="max-w-full">
              {/* Company Profile */}
              <div className="bg-gray-100 rounded-lg mb-4">
                <button
                  onClick={() => toggleSection('profile')}
                  className="w-full flex justify-between items-center px-6 py-3 text-left"
                >
                  <span className="font-semibold text-gray-800">Company Profile</span>
                  <ChevronDown
                    className={`text-gray-600 transition-transform ${expandedSections.profile ? '' : 'rotate-180'}`}
                    size={20}
                  />
                </button>

                {expandedSections.profile && (
                  <div className="px-6 pb-4">
                    <div className="bg-white rounded shadow p-6">
                      {/* Company Header */}
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedManufacturer.name}</h2>
                        {selectedManufacturer.details?.website && (
                          <a
                            href={selectedManufacturer.details.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-2"
                          >
                            <Globe size={16} />
                            {selectedManufacturer.details.website}
                          </a>
                        )}
                      </div>

                      {/* Company Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {selectedManufacturer.details?.founded && (
                          <div className="flex items-start gap-3">
                            <Calendar className="text-orange-600 mt-1" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">Founded</p>
                              <p className="font-semibold">{selectedManufacturer.details.founded}</p>
                            </div>
                          </div>
                        )}
                        {selectedManufacturer.details?.headquarters && (
                          <div className="flex items-start gap-3">
                            <Building2 className="text-orange-600 mt-1" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">Headquarters</p>
                              <p className="font-semibold">{selectedManufacturer.details.headquarters}</p>
                            </div>
                          </div>
                        )}
                        {selectedManufacturer.details?.ceo && (
                          <div className="flex items-start gap-3">
                            <Users className="text-orange-600 mt-1" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">CEO</p>
                              <p className="font-semibold">{selectedManufacturer.details.ceo}</p>
                            </div>
                          </div>
                        )}
                        {selectedManufacturer.details?.numberOfEmployees && (
                          <div className="flex items-start gap-3">
                            <Users className="text-orange-600 mt-1" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">Employees</p>
                              <p className="font-semibold">{selectedManufacturer.details.numberOfEmployees}</p>
                            </div>
                          </div>
                        )}
                        {selectedManufacturer.details?.revenue && (
                          <div className="flex items-start gap-3">
                            <DollarSign className="text-orange-600 mt-1" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">Revenue</p>
                              <p className="font-semibold">{selectedManufacturer.details.revenue}</p>
                            </div>
                          </div>
                        )}
                        {selectedManufacturer.details?.netIncome && (
                          <div className="flex items-start gap-3">
                            <DollarSign className="text-orange-600 mt-1" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">Net Income</p>
                              <p className="font-semibold">{selectedManufacturer.details.netIncome}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* History */}
                      {selectedManufacturer.history && (
                        <div className="border-t pt-4">
                          <h3 className="font-semibold text-gray-900 mb-2">History</h3>
                          <p className="text-gray-700 leading-relaxed">{selectedManufacturer.history}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Licensed Vaccines */}
              <div className="bg-gray-100 rounded-lg mb-4">
                <button
                  onClick={() => toggleSection('licensedVaccines')}
                  className="w-full flex justify-between items-center px-6 py-3 text-left"
                >
                  <span className="font-semibold text-gray-800">
                    Licensed Vaccines ({selectedManufacturer.licensedVaccines?.length || 0})
                  </span>
                  <ChevronDown
                    className={`text-gray-600 transition-transform ${expandedSections.licensedVaccines ? '' : 'rotate-180'}`}
                    size={20}
                  />
                </button>

                {expandedSections.licensedVaccines && (
                  <div className="px-6 pb-4">
                    <div className="bg-white rounded shadow overflow-hidden">
                      {selectedManufacturer.licensedVaccines && selectedManufacturer.licensedVaccines.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {selectedManufacturer.licensedVaccines.map(vaccine => (
                            <div key={vaccine._id} className="p-4 hover: transition-colors">
                              <h4 className="font-semibold text-gray-900 mb-2">{vaccine.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">Type: {vaccine.vaccineType}</p>
                              {vaccine.licensingDates && vaccine.licensingDates.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Licensing Dates:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {vaccine.licensingDates.map((license, idx) => (
                                      <a
                                        key={idx}
                                        href={license.source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors"
                                      >
                                        {license.name}: {license.approvalDate}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          No licensed vaccines found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Candidate Vaccines */}
              <div className="bg-gray-100 rounded-lg mb-4">
                <button
                  onClick={() => toggleSection('candidateVaccines')}
                  className="w-full flex justify-between items-center px-6 py-3 text-left"
                >
                  <span className="font-semibold text-gray-800">
                    Candidate Vaccines ({selectedManufacturer.candidateVaccines?.length || 0})
                  </span>
                  <ChevronDown
                    className={`text-gray-600 transition-transform ${expandedSections.candidateVaccines ? '' : 'rotate-180'}`}
                    size={20}
                  />
                </button>

                {expandedSections.candidateVaccines && (
                  <div className="px-6 pb-4">
                    <div className="bg-white rounded shadow overflow-hidden">
                      <div className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-sm">
                        <div className="col-span-2">Vaccine Name</div>
                        <div>Pathogen</div>
                        <div className="text-center bg-blue-50 rounded">Phase I</div>
                        <div className="text-center bg-green-50 rounded">Phase II</div>
                        <div className="text-center bg-purple-50 rounded">Phase III</div>
                        <div className="text-center bg-orange-50 rounded">Phase IV</div>
                      </div>
                      {selectedManufacturer.candidateVaccines && selectedManufacturer.candidateVaccines.length > 0 ? (
                        selectedManufacturer.candidateVaccines.map(candidate => {
                          const phases = getPhaseDisplay(candidate.clinicalPhase, candidate.manufacturer);
                          return (
                            <div key={candidate._id} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover: transition-colors items-center">
                              <div className="col-span-2">
                                {candidate.companyUrl ? (
                                  <a
                                    href={candidate.companyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                  >
                                    {candidate.name}
                                  </a>
                                ) : (
                                  <span className="font-medium">{candidate.name}</span>
                                )}
                                {candidate.other && (
                                  <a
                                    href={candidate.other}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline mt-1 block"
                                  >
                                    Clinical Trials
                                  </a>
                                )}
                              </div>
                              <div className="text-sm text-gray-700">{candidate.pathogenName}</div>
                              <div className="text-center bg-blue-50/30">{getPhaseLabel(phases.phase_i, candidate.companyUrl)}</div>
                              <div className="text-center bg-green-50/30">{getPhaseLabel(phases.phase_ii, candidate.companyUrl)}</div>
                              <div className="text-center bg-purple-50/30">{getPhaseLabel(phases.phase_iii, candidate.companyUrl)}</div>
                              <div className="text-center bg-orange-50/30">{getPhaseLabel(phases.phase_iv, candidate.companyUrl)}</div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          No candidate vaccines found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}