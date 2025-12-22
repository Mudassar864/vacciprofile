'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Building2, Globe, Calendar, Users, DollarSign, Menu, X } from 'lucide-react';
import { AlphabetNav } from '@/components/alphabet-nav';

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

export interface Manufacturer {
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

interface ManufacturersClientProps {
  initialManufacturers: Manufacturer[];
  initialSelectedManufacturerName?: string;
}

export function ManufacturersClient({
  initialManufacturers,
  initialSelectedManufacturerName,
}: ManufacturersClientProps) {
  const router = useRouter();
  const [manufacturers] = useState<Manufacturer[]>(initialManufacturers);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(
    initialManufacturers.find(m => m.name === initialSelectedManufacturerName) || initialManufacturers[0] || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    licensedVaccines: true,
    candidateVaccines: true
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleManufacturerClick = (manufacturer: Manufacturer) => {
    // Update URL immediately using window.history, then update state
    const url = `/manufacturers?manufacturer=${encodeURIComponent(manufacturer.name)}`;
    window.history.pushState({}, '', url);
    setSelectedManufacturer(manufacturer);
    // Use replace to avoid adding to history stack for query param changes
    router.replace(url);
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
              <h2 className="font-semibold text-gray-800">Manufacturers</h2>
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
                placeholder="Search manufacturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredManufacturers.length > 0 ? (
              <>
                {filteredManufacturers.map(manufacturer => (
                  <button
                    key={manufacturer._id}
                    onClick={() => {
                      handleManufacturerClick(manufacturer);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-[#d17728] hover:text-white transition-colors ${
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
              </>
            ) : (
              <div className="p-4 text-center text-gray-500">No manufacturers found</div>
            )}
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
                {selectedManufacturer?.name || "Select Manufacturer"}
              </span>
            </button>
          </div>
          {selectedManufacturer && (
            <div className="max-w-full">
              <div className="bg-gray-100 rounded-lg mb-4">
                <button
                  onClick={() => toggleSection('profile')}
                  className="w-full flex justify-between items-center px-4 sm:px-6 py-3 text-left hover:bg-gray-200 transition-colors rounded-t-lg"
                >
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">Company Profile</span>
                  <ChevronDown
                    className={`text-gray-600 transition-transform flex-shrink-0 ${expandedSections.profile ? '' : 'rotate-180'}`}
                    size={20}
                  />
                </button>

                {expandedSections.profile && (
                  <div className="px-3 sm:px-6 pb-4">
                    <div className="bg-white rounded shadow p-4 sm:p-6">
                      <div className="mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{selectedManufacturer.name}</h2>
                        {selectedManufacturer.details?.website && (
                          <a
                            href={selectedManufacturer.details.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-2 text-sm sm:text-base break-all"
                          >
                            <Globe size={16} />
                            {selectedManufacturer.details.website}
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
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

                      {selectedManufacturer.history && (
                        <div className="border-t pt-4">
                          <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">History</h3>
                          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{selectedManufacturer.history}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-100 rounded-lg mb-4">
                <button
                  onClick={() => toggleSection('licensedVaccines')}
                  className="w-full flex justify-between items-center px-4 sm:px-6 py-3 text-left hover:bg-gray-200 transition-colors rounded-t-lg"
                >
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    Licensed Vaccines ({selectedManufacturer.licensedVaccines?.length || 0})
                  </span>
                  <ChevronDown
                    className={`text-gray-600 transition-transform flex-shrink-0 ${expandedSections.licensedVaccines ? '' : 'rotate-180'}`}
                    size={20}
                  />
                </button>

                {expandedSections.licensedVaccines && (
                  <div className="px-3 sm:px-6 pb-4">
                    <div className="bg-white rounded shadow overflow-hidden">
                      {selectedManufacturer.licensedVaccines && selectedManufacturer.licensedVaccines.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {selectedManufacturer.licensedVaccines.map(vaccine => (
                            <div key={vaccine._id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{vaccine.name}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">Type: {vaccine.vaccineType}</p>
                              {vaccine.licensingDates && vaccine.licensingDates.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Licensing Dates:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {vaccine.licensingDates.map((license, idx) => (
                                      <a
                                        key={idx}
                                        href={license.source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors"
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

              <div className="bg-gray-100 rounded-lg mb-4">
                <button
                  onClick={() => toggleSection('candidateVaccines')}
                  className="w-full flex justify-between items-center px-4 sm:px-6 py-3 text-left hover:bg-gray-200 transition-colors rounded-t-lg"
                >
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    Candidate Vaccines ({selectedManufacturer.candidateVaccines?.length || 0})
                  </span>
                  <ChevronDown
                    className={`text-gray-600 transition-transform flex-shrink-0 ${expandedSections.candidateVaccines ? '' : 'rotate-180'}`}
                    size={20}
                  />
                </button>

                {expandedSections.candidateVaccines && (
                  <div className="px-3 sm:px-6 pb-4">
                    <div className="bg-white rounded shadow overflow-hidden">
                      <div className="hidden md:grid md:grid-cols-7 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-sm">
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
                            <div key={candidate._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <div className="hidden md:grid md:grid-cols-7 gap-4 p-4 items-center">
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

                              <div className="md:hidden p-4 space-y-3">
                                <div>
                                  <span className="text-xs font-semibold text-gray-500 uppercase">Vaccine Name</span>
                                  <div className="mt-1">
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
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-gray-500 uppercase">Pathogen</span>
                                  <div className="mt-1 text-sm text-gray-700">{candidate.pathogenName}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">Phase I</span>
                                    <div className="bg-blue-50/30 rounded p-2">{getPhaseLabel(phases.phase_i, candidate.companyUrl) || <span className="text-gray-400 text-sm">-</span>}</div>
                                  </div>
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">Phase II</span>
                                    <div className="bg-green-50/30 rounded p-2">{getPhaseLabel(phases.phase_ii, candidate.companyUrl) || <span className="text-gray-400 text-sm">-</span>}</div>
                                  </div>
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">Phase III</span>
                                    <div className="bg-purple-50/30 rounded p-2">{getPhaseLabel(phases.phase_iii, candidate.companyUrl) || <span className="text-gray-400 text-sm">-</span>}</div>
                                  </div>
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">Phase IV</span>
                                    <div className="bg-orange-50/30 rounded p-2">{getPhaseLabel(phases.phase_iv, candidate.companyUrl) || <span className="text-gray-400 text-sm">-</span>}</div>
                                  </div>
                                </div>
                              </div>
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

