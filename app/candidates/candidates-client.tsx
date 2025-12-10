'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import { AlphabetNav } from '@/components/alphabet-nav';

interface Candidate {
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

interface CandidatesClientProps {
  initialCandidates: Candidate[];
  initialPathogens: string[];
  initialSelectedPathogen?: string;
}

export function CandidatesClient({
  initialCandidates,
  initialPathogens,
  initialSelectedPathogen,
}: CandidatesClientProps) {
  const router = useRouter();
  const [candidates] = useState<Candidate[]>(initialCandidates);
  const [pathogens] = useState<string[]>(initialPathogens);
  const [selectedPathogen, setSelectedPathogen] = useState<string>(
    initialSelectedPathogen || initialPathogens[0] || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    candidates: true,
    pathogenProfile: true
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredPathogens = pathogens.filter(pathogen => {
    const matchesSearch = pathogen.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !activeLetter || pathogen.charAt(0).toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  });

  const selectedCandidates = candidates.filter(c => c.pathogenName === selectedPathogen);

  const toggleSection = (section: 'candidates' | 'pathogenProfile') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePathogenClick = (pathogen: string) => {
    setSelectedPathogen(pathogen);
    router.push(`/candidates?pathogen=${encodeURIComponent(pathogen)}`);
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
              <h2 className="font-semibold text-gray-800">Pathogens</h2>
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
                placeholder="Search pathogens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredPathogens.length > 0 ? (
              <>
                {filteredPathogens.map(pathogen => (
                  <button
                    key={pathogen}
                    onClick={() => {
                      handlePathogenClick(pathogen);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-[#d17728] hover:text-white transition-colors ${
                      selectedPathogen === pathogen
                        ? 'bg-[#d17728] text-white font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className={selectedPathogen === pathogen ? '' : 'italic'}>{pathogen}</span>
                  </button>
                ))}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500">No pathogens found</div>
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
                {selectedPathogen || "Select Pathogen"}
              </span>
            </button>
          </div>
          <div className="max-w-full">
            <div className="bg-gray-100 rounded-lg mb-4">
              <button
                onClick={() => toggleSection('candidates')}
                className="w-full flex justify-between items-center px-4 sm:px-6 py-3 text-left hover:bg-gray-200 transition-colors rounded-t-lg"
              >
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Vaccine Candidates</span>
                <ChevronDown
                  className={`text-gray-600 transition-transform flex-shrink-0 ${expandedSections.candidates ? '' : 'rotate-180'}`}
                  size={20}
                />
              </button>

              {expandedSections.candidates && (
                <div className="px-3 sm:px-6 pb-4">
                  <div className="bg-white rounded shadow overflow-hidden">
                    <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-sm">
                      <div className="col-span-2">Vaccine Name</div>
                      <div className="text-center bg-blue-50 rounded">Phase I</div>
                      <div className="text-center bg-green-50 rounded">Phase II</div>
                      <div className="text-center bg-purple-50 rounded">Phase III</div>
                      <div className="text-center bg-orange-50 rounded">Phase IV</div>
                    </div>
                    {selectedCandidates.length > 0 ? (
                      selectedCandidates.map(candidate => {
                        const phases = getPhaseDisplay(candidate.clinicalPhase, candidate.manufacturer);
                        return (
                          <div key={candidate._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 items-center">
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
                        No vaccine candidates found for this pathogen.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

