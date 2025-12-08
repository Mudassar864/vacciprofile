'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

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

interface AlphabetNavProps {
  onLetterClick: (letter: string) => void;
  activeLetter: string;
}

const AlphabetNav = ({ onLetterClick, activeLetter }: AlphabetNavProps) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="bg-white border-b border-gray-200 ">
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

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pathogens, setPathogens] = useState<string[]>([]);
  const [selectedPathogen, setSelectedPathogen] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    candidates: true,
    pathogenProfile: true
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
      const response = await fetch('http://localhost:5000/api/candidate-vaccines');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setCandidates(data);
        const uniquePathogens = Array.from(
          new Set(data.map(v => v.pathogenName))
        ).sort();
        setPathogens(uniquePathogens);
        if (uniquePathogens.length > 0) {
          setSelectedPathogen(uniquePathogens[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

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
          <div className="max-w-full">
            <div className="bg-gray-100 rounded-lg mb-4">
              <button
                onClick={() => toggleSection('candidates')}
                className="w-full flex justify-between items-center px-6 py-3 text-left"
              >
                <span className="font-semibold text-gray-800">Vaccine Candidates</span>
                <ChevronDown
                  className={`text-gray-600 transition-transform ${expandedSections.candidates ? '' : 'rotate-180'}`}
                  size={20}
                />
              </button>

              {expandedSections.candidates && (
                <div className="px-6 pb-4">
                  <div className="bg-white rounded shadow overflow-hidden">
                    <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-sm">
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
                          <div key={candidate._id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover: transition-colors items-center">
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