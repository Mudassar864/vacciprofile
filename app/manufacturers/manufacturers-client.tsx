'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Building2, Globe, Calendar, Users, DollarSign, Menu, X, ExternalLink, Clock } from 'lucide-react';
import { AlphabetNav } from '@/components/alphabet-nav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductProfile, LicensingDate } from '@/lib/types';
import { formatPathogenName } from '@/lib/pathogen-formatting';

interface LicensedVaccine {
  _id: string;
  vaccineId: number;
  name: string;
  pathogenId: number[];
  vaccineType: string;
  licensingDates: LicensingDate[];
  productProfiles?: ProductProfile[];
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
  const [selectedVaccine, setSelectedVaccine] = useState<LicensedVaccine | null>(null);
  const [loadingProductProfiles, setLoadingProductProfiles] = useState(false);

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

  const fetchProductProfiles = async (vaccineName: string) => {
    setLoadingProductProfiles(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL|| 'http://localhost:5000';
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
      const API_BASE = process.env.NEXT_PUBLIC_API_URL|| 'http://localhost:5000';
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

  const handleVaccineClick = async (vaccine: LicensedVaccine) => {
    setSelectedVaccine(vaccine);
    const vaccineName = vaccine.name || '';
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
          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
          title="Visit company website for more details (opens in new tab)"
        >
          <span>{phase}</span>
          <ExternalLink size={12} className="opacity-70" />
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
                placeholder="Type to search manufacturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                aria-label="Search manufacturers"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 Click on a manufacturer to view details</p>
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
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
              aria-label="Open sidebar to select manufacturer"
            >
              <Menu size={20} />
              <span className="font-medium text-gray-700">
                {selectedManufacturer?.name || "👆 Tap to select a manufacturer"}
              </span>
            </button>
            {!selectedManufacturer && (
              <p className="text-xs text-gray-500 mt-1 ml-1">Select a manufacturer from the menu to view details</p>
            )}
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
                            title="Visit manufacturer website (opens in new tab)"
                          >
                            <Globe size={16} />
                            <span>Visit Company Website</span>
                            <ExternalLink size={14} className="opacity-70" />
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

                      {selectedManufacturer.lastUpdated && (
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={16} className="text-orange-600" />
                            <span className="font-semibold text-gray-700">Last Updated:</span>
                            <span>{new Date(selectedManufacturer.lastUpdated).toLocaleDateString()}</span>
                          </div>
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
                              <h4 
                                onClick={() => handleVaccineClick(vaccine)}
                                className="font-semibold text-gray-900 mb-2 text-sm sm:text-base cursor-pointer text-blue-600 hover:underline flex items-center gap-1 group"
                                title="Click to view product profile and licensing details"
                              >
                                <span>{vaccine.name}</span>
                                <span className="text-xs opacity-0 group-hover:opacity-70 transition-opacity">→</span>
                              </h4>
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
                      <div className="hidden md:grid md:grid-cols-8 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-sm">
                        <div className="col-span-2">Vaccine Name</div>
                        <div>Pathogen</div>
                        <div className="text-center bg-blue-50 rounded">Phase I</div>
                        <div className="text-center bg-green-50 rounded">Phase II</div>
                        <div className="text-center bg-purple-50 rounded">Phase III</div>
                        <div className="text-center bg-orange-50 rounded">Phase IV</div>
                        <div>Last Updated</div>
                      </div>
                      {selectedManufacturer.candidateVaccines && selectedManufacturer.candidateVaccines.length > 0 ? (
                        selectedManufacturer.candidateVaccines.map(candidate => {
                          const phases = getPhaseDisplay(candidate.clinicalPhase, candidate.manufacturer);
                          return (
                            <div key={candidate._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <div className="hidden md:grid md:grid-cols-8 gap-4 p-4 items-center">
                                <div className="col-span-2">
                                  {candidate.companyUrl ? (
                                    <a
                                      href={candidate.companyUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                                      title="Visit company website (opens in new tab)"
                                    >
                                      <span>{candidate.name}</span>
                                      <ExternalLink size={12} className="opacity-70" />
                                    </a>
                                  ) : (
                                    <span className="font-medium">{candidate.name}</span>
                                  )}
                                  {candidate.other && (
                                    <a
                                      href={candidate.other}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-500 hover:underline mt-1 block inline-flex items-center gap-1"
                                      title="View clinical trials information (opens in new tab)"
                                    >
                                      <span>Clinical Trials</span>
                                      <ExternalLink size={10} className="opacity-70" />
                                    </a>
                                  )}
                                </div>
                                <div className="text-sm text-gray-700">
                                  {(() => {
                                    const { displayName, className } = formatPathogenName(candidate.pathogenName);
                                    return (
                                      <a
                                        href={`/candidates?pathogen=${encodeURIComponent(candidate.pathogenName)}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          router.push(`/candidates?pathogen=${encodeURIComponent(candidate.pathogenName)}`);
                                        }}
                                        className={`text-blue-600 hover:underline cursor-pointer ${className || ''}`}
                                      >
                                        {displayName}
                                      </a>
                                    );
                                  })()}
                                </div>
                                <div className="text-center bg-blue-50/30">{getPhaseLabel(phases.phase_i, candidate.companyUrl)}</div>
                                <div className="text-center bg-green-50/30">{getPhaseLabel(phases.phase_ii, candidate.companyUrl)}</div>
                                <div className="text-center bg-purple-50/30">{getPhaseLabel(phases.phase_iii, candidate.companyUrl)}</div>
                                <div className="text-center bg-orange-50/30">{getPhaseLabel(phases.phase_iv, candidate.companyUrl)}</div>
                                <div className="text-gray-600 text-xs flex items-center gap-1">
                                  {candidate.lastUpdated ? (
                                    <>
                                      <Clock size={12} className="opacity-70" />
                                      <span>{new Date(candidate.lastUpdated).toLocaleDateString()}</span>
                                    </>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </div>
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
                                  <div className="mt-1 text-sm text-gray-700">
                                    {(() => {
                                      const { displayName, className } = formatPathogenName(candidate.pathogenName);
                                      return (
                                        <a
                                          href={`/vaccines?pathogen=${encodeURIComponent(candidate.pathogenName)}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            router.push(`/vaccines?pathogen=${encodeURIComponent(candidate.pathogenName)}`);
                                          }}
                                          className={`text-blue-600 hover:underline cursor-pointer ${className || ''}`}
                                        >
                                          {displayName}
                                        </a>
                                      );
                                    })()}
                                  </div>
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
                                <div>
                                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">Last Updated</span>
                                  <div className="text-gray-600 text-xs flex items-center gap-1">
                                    {candidate.lastUpdated ? (
                                      <>
                                        <Clock size={12} className="opacity-70" />
                                        <span>{new Date(candidate.lastUpdated).toLocaleDateString()}</span>
                                      </>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
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

      {/* Product Profile Dialog */}
      <Dialog open={!!selectedVaccine} onOpenChange={(open) => {
        if (!open) setSelectedVaccine(null);
      }}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto p-0 mx-2 sm:mx-4">
          {selectedVaccine && (
            <>
              <DialogHeader className="bg-gradient-to-r from-[#d17728] to-[#e6893a] px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-t-lg">
                <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white break-words">
                  {selectedVaccine.name || ""}
                </DialogTitle>
              </DialogHeader>
              
              <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600 break-words">{selectedVaccine.vaccineType || ""}</span>
                  </div>
                </div>

                {loadingProductProfiles ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d17728]"></div>
                    <p className="mt-2 text-gray-600">Loading product profiles...</p>
                  </div>
                ) : selectedVaccine.productProfiles && Array.isArray(selectedVaccine.productProfiles) && selectedVaccine.productProfiles.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">
                      Product Profiles
                    </h3>
                    <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                      <div className="flex gap-3 sm:gap-4 min-w-max pb-4">
                        {[...selectedVaccine.productProfiles].sort((a, b) => {
                          const aType = (a.type || '').toUpperCase();
                          const bType = (b.type || '').toUpperCase();
                          const aHasEMA = aType.includes('EMA');
                          const aHasWHO = aType.includes('WHO');
                          const aHasFDA = aType.includes('FDA');
                          const bHasEMA = bType.includes('EMA');
                          const bHasWHO = bType.includes('WHO');
                          const bHasFDA = bType.includes('FDA');
                          const getPriority = (hasEMA: boolean, hasWHO: boolean, hasFDA: boolean) => {
                            if (hasEMA) return 0;
                            if (hasWHO) return 1;
                            if (hasFDA) return 2;
                            return 3;
                          };
                          const aPriority = getPriority(aHasEMA, aHasWHO, aHasFDA);
                          const bPriority = getPriority(bHasEMA, bHasWHO, bHasFDA);
                          if (aPriority !== bPriority) {
                            return aPriority - bPriority;
                          }
                          return 0;
                        }).map((profile, index) => (
                          <div 
                            key={index} 
                            className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] border border-gray-200 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 bg-white shadow-sm"
                          >
                            <div className="flex flex-col gap-2 mb-2 sm:mb-3">
                              <span className="px-2 sm:px-3 py-1 bg-[#d17728] text-white rounded font-semibold text-xs sm:text-sm w-fit">
                                {profile.type}
                              </span>
                              <h4 className="font-semibold text-gray-800 text-xs sm:text-sm break-words">
                                {profile.name}
                              </h4>
                            </div>
                            
                            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Composition:</span>
                                <p className="text-gray-600 break-words">{profile.composition || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Strain Coverage:</span>
                                <p className="text-gray-600 break-words">{profile.strainCoverage || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Indication:</span>
                                <p className="text-gray-600 break-words">{profile.indication || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Contraindication:</span>
                                <p className="text-gray-600 break-words">{profile.contraindication || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Dosing:</span>
                                <p className="text-gray-600 break-words">{profile.dosing || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Immunogenicity:</span>
                                <p className="text-gray-600 break-words">{profile.immunogenicity || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Efficacy:</span>
                                <p className="text-gray-600 break-words">{profile.Efficacy || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Duration of Protection:</span>
                                <p className="text-gray-600 break-words">{profile.durationOfProtection || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Co-Administration:</span>
                                <p className="text-gray-600 break-words">{profile.coAdministration || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Reactogenicity:</span>
                                <p className="text-gray-600 break-words">{profile.reactogenicity || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Safety:</span>
                                <p className="text-gray-600 break-words">{profile.safety || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Vaccination Goal:</span>
                                <p className="text-gray-600 break-words">{profile.vaccinationGoal || "-"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Others:</span>
                                <p className="text-gray-600 break-words">{profile.others || "-"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Licensing Data Section */}
                    {selectedVaccine.licensingDates && selectedVaccine.licensingDates.length > 0 && (
                      <div className="mt-6 pt-4 border-t-2 border-gray-300">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                          Licensing Data
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {selectedVaccine.licensingDates.map((license: LicensingDate, idx: number) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 space-y-2 text-xs sm:text-sm">
                              <div>
                                <span className="font-semibold text-gray-700">Authority:</span>
                                <span className="ml-2 text-gray-600 break-words">{license.name || "-"}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">Approval Date:</span>
                                <span className="ml-2 text-gray-600 break-words">{license.approvalDate || "-"}</span>
                              </div>
                              {license.source && (
                                <div>
                                  <span className="font-semibold text-gray-700">Source:</span>
                                  <a
                                    href={license.source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 underline underline-offset-4 hover:underline break-all"
                                  >
                                    View Source
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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

