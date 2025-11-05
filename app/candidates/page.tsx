'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search, ChevronDown } from 'lucide-react';

interface Candidate {
  candidate_id: number;
  pathogen_name: string;
  vaccine_name: string;
  vaccine_link: string;
  phase_i: string | null;
  phase_ii: string | null;
  phase_iii: string | null;
  phase_iv: string | null;
  manufacturer: string;
}

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

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('vaccine_candidates')
      .select('*')
      .order('pathogen_name');

    if (!error && data) {
      setCandidates(data as Candidate[]);
      const uniquePathogens = Array.from(new Set((data as Candidate[]).map(v => v.pathogen_name))).sort();
      setPathogens(uniquePathogens);
      if (uniquePathogens.length > 0) {
        setSelectedPathogen(uniquePathogens[0]);
      }
    }
    setLoading(false);
  }

  const filteredPathogens = pathogens.filter(pathogen => {
    const matchesSearch = pathogen.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !activeLetter || pathogen.charAt(0).toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  });

  const selectedCandidates = candidates.filter(c => c.pathogen_name === selectedPathogen);

  const toggleSection = (section: 'candidates' | 'pathogenProfile') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPhaseLabel = (phase: string | null) => {
    if (!phase || phase === '' || phase.toLowerCase() === 'no') {
      return (
        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-sm">
          -
        </span>
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
          ) : (
            <>
              {filteredPathogens.map(pathogen => (
                <button
                  key={pathogen}
                  onClick={() => setSelectedPathogen(pathogen)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-orange-50 transition-colors ${
                    selectedPathogen === pathogen
                      ? 'bg-orange-500 text-white font-semibold'
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
                      <div className="col-span-2">Vaccine Name / Manufacturer</div>
                      <div className="text-center bg-blue-50 rounded">Phase I</div>
                      <div className="text-center bg-green-50 rounded">Phase II</div>
                      <div className="text-center bg-purple-50 rounded">Phase III</div>
                      <div className="text-center bg-orange-50 rounded">Phase IV</div>
                    </div>
                    {selectedCandidates.length > 0 ? (
                      selectedCandidates.map(candidate => (
                        <div key={candidate.candidate_id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover:bg-orange-50 transition-colors items-center">
                          <div className="col-span-2">
                            {candidate.vaccine_link ? (
                              <a
                                href={candidate.vaccine_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {candidate.vaccine_name}
                              </a>
                            ) : (
                              <span className="font-medium">{candidate.vaccine_name}</span>
                            )}
                            {candidate.manufacturer && (
                              <p className="text-sm text-gray-600 mt-1">{candidate.manufacturer}</p>
                            )}
                          </div>
                          <div className="text-center bg-blue-50/30">{getPhaseLabel(candidate.phase_i)}</div>
                          <div className="text-center bg-green-50/30">{getPhaseLabel(candidate.phase_ii)}</div>
                          <div className="text-center bg-purple-50/30">{getPhaseLabel(candidate.phase_iii)}</div>
                          <div className="text-center bg-orange-50/30">{getPhaseLabel(candidate.phase_iv)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No vaccine candidates found for this pathogen.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-100 rounded-lg">
              <button
                onClick={() => toggleSection('pathogenProfile')}
                className="w-full flex justify-between items-center px-6 py-3 text-left"
              >
                <span className="font-semibold text-gray-800">Pathogen Profile</span>
                <ChevronDown
                  className={`text-gray-600 transition-transform ${expandedSections.pathogenProfile ? '' : 'rotate-180'}`}
                  size={20}
                />
              </button>

              {expandedSections.pathogenProfile && (
                <div className="px-6 pb-4">
                  <div className="bg-white rounded shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{selectedPathogen}</h3>
                    <p className="text-gray-600">
                      Detailed pathogen profile information will be displayed here, including epidemiology,
                      transmission, symptoms, and prevention strategies.
                    </p>
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
