'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search, Menu, X, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductProfile {
  type: string;
  name: string;
  composition: string;
  strainCoverage: string;
  indication: string;
  contraindication: string;
  dosing: string;
  immunogenicity: string;
  Efficacy: string;
  durationOfProtection: string;
  coAdministration: string;
  reactogenicity: string;
  safety: string;
  vaccinationGoal: string;
  others: string;
}

interface Vaccine {
  licensed_vaccine_id: string;
  pathogen_name?: string;
  vaccine_brand_name?: string;
  single_or_combination: string;
  authority_names: string[];
  authority_links: string[];
  vaccine_link?: string;
  manufacturer?: string;
  productProfiles?: ProductProfile[];
}

interface PathogenData {
  pathogenId?: number;
  name?: string;
  description?: string;
  image?: string;
  bulletpoints?: string;
  link?: string;
}

interface CompareClientProps {
  initialVaccines: Vaccine[];
  initialPathogensData: PathogenData[];
  initialPathogens: string[];
  initialSelectedPathogen?: string;
}

export function CompareClient({
  initialVaccines,
  initialPathogensData,
  initialPathogens,
  initialSelectedPathogen,
}: CompareClientProps) {
  const searchParams = useSearchParams();
  const [vaccines] = useState<Vaccine[]>(initialVaccines);
  const [pathogensData] = useState<PathogenData[]>(initialPathogensData);
  const [pathogens] = useState<string[]>(initialPathogens);
  const [selectedPathogen, setSelectedPathogen] = useState<string>(
    initialSelectedPathogen || initialPathogens[0] || ""
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [vaccinesWithProfiles, setVaccinesWithProfiles] = useState<Vaccine[]>(initialVaccines);
  const [loadingProductProfiles, setLoadingProductProfiles] = useState<{ [key: string]: boolean }>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState({
    single: true,
    combination: true,
  });
  const [isChangingPathogen, setIsChangingPathogen] = useState(false);

  // Only read initial pathogen from URL on mount, don't track changes
  useEffect(() => {
    const pathogenParam = searchParams.get("pathogen");
    
    // Only set pathogen from URL if it's valid and different from current
    if (pathogenParam && pathogens.length > 0) {
      const decodedPathogen = decodeURIComponent(pathogenParam);
      if (pathogens.includes(decodedPathogen) && decodedPathogen !== selectedPathogen) {
        setSelectedPathogen(decodedPathogen);
        setSelectedVaccines([]);
        setIsChangingPathogen(false);
      }
    }
  }, []); // Only run once on mount

  const fetchProductProfiles = async (vaccineName: string) => {
    setLoadingProductProfiles(prev => ({ ...prev, [vaccineName]: true }));
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
      const response = await fetch(
        `${API_BASE}/api/product-profiles?vaccineName=${encodeURIComponent(vaccineName)}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch product profiles: ${response.status}`);
      }

      const result = await response.json();
      return result.productProfiles || [];
    } catch (error) {
      console.error('Error fetching product profiles:', error);
      return [];
    } finally {
      setLoadingProductProfiles(prev => ({ ...prev, [vaccineName]: false }));
    }
  };

  const filteredPathogens = pathogens.filter(pathogen => {
    const matchesSearch = pathogen.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !activeLetter || pathogen.charAt(0).toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  });

  const pathogenVaccines = vaccinesWithProfiles.filter(v => {
    const matchesPathogen = v.pathogen_name === selectedPathogen;
    const matchesFilter = 
      (viewFilter.single && v.single_or_combination === "Single Pathogen Vaccine") ||
      (viewFilter.combination && v.single_or_combination === "Combination Vaccine");
    return matchesPathogen && matchesFilter;
  });

  const toggleVaccineSelection = async (vaccineId: string) => {
    const isCurrentlySelected = selectedVaccines.includes(vaccineId);
    
    if (isCurrentlySelected) {
      // Deselecting - just remove from selection
      setSelectedVaccines(prev => {
        const currentPathogenVaccineIds = vaccinesWithProfiles
          .filter(v => v.pathogen_name === selectedPathogen)
          .map(v => v.licensed_vaccine_id);
        const filteredPrev = prev.filter(id => currentPathogenVaccineIds.includes(id));
        return filteredPrev.filter(id => id !== vaccineId);
      });
    } else {
      // Selecting - add to selection and fetch product profiles
      setSelectedVaccines(prev => {
        const currentPathogenVaccineIds = vaccinesWithProfiles
          .filter(v => v.pathogen_name === selectedPathogen)
          .map(v => v.licensed_vaccine_id);
        const filteredPrev = prev.filter(id => currentPathogenVaccineIds.includes(id));
        return [...filteredPrev, vaccineId];
      });

      // Find the vaccine and fetch its product profiles
      const vaccine = vaccinesWithProfiles.find(v => v.licensed_vaccine_id === vaccineId);
      if (vaccine && vaccine.vaccine_brand_name) {
        const profiles = await fetchProductProfiles(vaccine.vaccine_brand_name);
        
        // Update the vaccine with product profiles in the state
        setVaccinesWithProfiles(prev => {
          const updated = prev.map(v => {
            if (v.licensed_vaccine_id === vaccineId) {
              return { ...v, productProfiles: profiles };
            }
            return v;
          });
          return updated;
        });
      }
    }
  };

  // Only show selected vaccines that belong to the current pathogen
  // Use vaccinesWithProfiles to get vaccines with their product profiles
  const selectedVaccineDetails = vaccinesWithProfiles.filter(v => 
    selectedVaccines.includes(v.licensed_vaccine_id) && v.pathogen_name === selectedPathogen
  );

  const handlePathogenClick = (pathogen: string) => {
    // Only update if clicking a different pathogen
    if (pathogen === selectedPathogen) {
      setSidebarOpen(false);
      return;
    }
    
    // Show loading state
    setIsChangingPathogen(true);
    
    // Clear vaccine selection when pathogen changes
    setSelectedVaccines([]);
    setSelectedPathogen(pathogen);
    
    // Don't update URL - keep everything in state
    setSidebarOpen(false);
    
    // Clear loading state after a short delay for smooth transition
    setTimeout(() => {
      setIsChangingPathogen(false);
    }, 300);
  };

  const clearSelection = () => {
    setSelectedVaccines([]);
    // Don't update URL - vaccines are not stored in URL
  };


  // Get all unique product profile types from selected vaccines
  // Filter out profiles where composition equals "- not licensed yet -"
  const allProductProfileTypes = Array.from(
    new Set(
      selectedVaccineDetails.flatMap(v => 
        (v.productProfiles || [])
          .filter(p => {
            const composition = p.composition?.trim().toLowerCase();
            return composition && composition !== '- not licensed yet -';
          })
          .map(p => p.type)
      )
    )
  );

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

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredPathogens.length > 0 ? (
              filteredPathogens.map(pathogen => {
                const isSelected = selectedPathogen === pathogen;
                return (
                  <button
                    key={pathogen}
                    onClick={() => handlePathogenClick(pathogen)}
                    className={`w-full text-left px-4 sm:px-5 py-3 border-b border-gray-200/50 transition-all duration-200 ease-in-out transform ${
                      isSelected
                        ? 'bg-[#d17728] text-white font-semibold shadow-md scale-[1.02]'
                        : 'text-gray-700 hover:bg-[#d17728]/10 hover:text-[#d17728] hover:font-medium active:scale-[0.98]'
                    }`}
                  >
                    <span className={`transition-all duration-200 ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                      {pathogen}
                    </span>
                    {isSelected && (
                      <span className="ml-2 inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-sm">No pathogens found</p>
              </div>
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

          <div className="max-w-7xl mx-auto">
            {/* Selection Section */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
              <div className="bg-[#d17728] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
                <h2 className="text-lg sm:text-xl font-bold">Licensed Vaccines</h2>
                <p className="text-xs sm:text-sm text-orange-100 mt-1">
                  Select vaccines to compare
                </p>
              </div>
              <div className="p-4 sm:p-6">
                {isChangingPathogen ? (
                  // Skeleton loader for table
                  <div className="space-y-4">
                    {/* Filter Options Skeleton */}
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-52" />
                    </div>
                    
                    {/* Table Skeleton */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-12">
                              <Skeleton className="h-4 w-4" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              <Skeleton className="h-4 w-24" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              <Skeleton className="h-4 w-32" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              <Skeleton className="h-4 w-28" />
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[...Array(5)].map((_, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-3">
                                <Skeleton className="h-4 w-4" />
                              </td>
                              <td className="px-4 py-3">
                                <Skeleton className="h-4 w-32" />
                              </td>
                              <td className="px-4 py-3">
                                <Skeleton className="h-4 w-40" />
                              </td>
                              <td className="px-4 py-3">
                                <Skeleton className="h-4 w-24" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Filter Options */}
                    <div className="mb-4 space-y-2">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={viewFilter.single}
                          onChange={(e) => setViewFilter(prev => ({ ...prev, single: e.target.checked }))}
                          className="w-4 h-4 text-[#d17728] border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span>View Single Pathogen Vaccines</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={viewFilter.combination}
                          onChange={(e) => setViewFilter(prev => ({ ...prev, combination: e.target.checked }))}
                          className="w-4 h-4 text-[#d17728] border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span>View Combination Vaccines</span>
                      </label>
                    </div>

                    {/* Vaccine Selection Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-12">
                              <input
                                type="checkbox"
                                checked={pathogenVaccines.length > 0 && pathogenVaccines.every(v => selectedVaccines.includes(v.licensed_vaccine_id))}
                                onChange={async (e) => {
                                  const allIds = pathogenVaccines.map(v => v.licensed_vaccine_id);
                                  
                                  if (e.target.checked) {
                                    // Select all vaccines for current pathogen only
                                    const newIds = allIds.filter(id => !selectedVaccines.includes(id));
                                    setSelectedVaccines(prev => {
                                      // Remove any vaccines from other pathogens first
                                      const currentPathogenVaccineIds = vaccinesWithProfiles
                                        .filter(v => v.pathogen_name === selectedPathogen)
                                        .map(v => v.licensed_vaccine_id);
                                      const filteredPrev = prev.filter(id => currentPathogenVaccineIds.includes(id));
                                      
                                      // Add all current pathogen vaccines
                                      const combined = Array.from(new Set([...filteredPrev, ...allIds]));
                                      return combined;
                                    });
                                    
                                    // Fetch product profiles for newly selected vaccines
                                    for (const vaccineId of newIds) {
                                      const vaccine = vaccinesWithProfiles.find(v => v.licensed_vaccine_id === vaccineId);
                                      if (vaccine && vaccine.vaccine_brand_name) {
                                        const profiles = await fetchProductProfiles(vaccine.vaccine_brand_name);
                                        setVaccinesWithProfiles(prev => {
                                          const updated = prev.map(v => {
                                            if (v.licensed_vaccine_id === vaccineId) {
                                              return { ...v, productProfiles: profiles };
                                            }
                                            return v;
                                          });
                                          return updated;
                                        });
                                      }
                                    }
                                  } else {
                                    // Unselect all vaccines for current pathogen
                                    setSelectedVaccines(prev => {
                                      // Keep vaccines from other pathogens, remove current pathogen vaccines
                                      const currentPathogenVaccineIds = vaccinesWithProfiles
                                        .filter(v => v.pathogen_name === selectedPathogen)
                                        .map(v => v.licensed_vaccine_id);
                                      return prev.filter(id => !currentPathogenVaccineIds.includes(id));
                                    });
                                  }
                                }}
                                className="w-4 h-4 text-[#d17728] border-gray-300 rounded focus:ring-orange-500"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Vaccine Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Single or Combination Vaccine</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Licensing Authority</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {pathogenVaccines.length > 0 ? (
                            pathogenVaccines.map(vaccine => (
                              <tr key={vaccine.licensed_vaccine_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedVaccines.includes(vaccine.licensed_vaccine_id)}
                                    onChange={() => toggleVaccineSelection(vaccine.licensed_vaccine_id)}
                                    className="w-4 h-4 text-[#d17728] border-gray-300 rounded focus:ring-orange-500"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-sm text-gray-900">
                                    {vaccine.vaccine_brand_name || 'Unknown'}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {vaccine.single_or_combination}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-2">
                                    {vaccine.authority_names.length > 0 ? (
                                      vaccine.authority_names.map((authority, idx) => {
                                        const link = vaccine.authority_links[idx] || '';
                                        return (
                                          <span key={idx} className="inline-flex items-center gap-1">
                                            {link ? (
                                              <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                                              >
                                                {authority}
                                                <ExternalLink size={12} />
                                              </a>
                                            ) : (
                                              <span className="text-gray-700 text-xs">{authority}</span>
                                            )}
                                          </span>
                                        );
                                      })
                                    ) : (
                                      <span className="text-gray-400 text-xs">-</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                                No vaccines available for this pathogen
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {selectedVaccines.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {selectedVaccines.length} vaccine{selectedVaccines.length !== 1 ? 's' : ''} selected
                    </p>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-[#d17728] hover:text-[#b8651f] font-medium"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Section */}
            {isChangingPathogen ? (
              // Skeleton for comparison section
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
                  <Skeleton className="h-6 w-48" />
                </div>
                <div className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 min-w-[150px]">
                            <Skeleton className="h-4 w-20" />
                          </th>
                          {[...Array(3)].map((_, idx) => (
                            <th key={idx} className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 min-w-[180px]">
                              <Skeleton className="h-4 w-32" />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {[...Array(5)].map((_, rowIdx) => (
                          <tr key={rowIdx}>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <Skeleton className="h-4 w-24" />
                            </td>
                            {[...Array(3)].map((_, colIdx) => (
                              <td key={colIdx} className="px-4 sm:px-6 py-3 sm:py-4">
                                <Skeleton className="h-4 w-28" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : selectedVaccineDetails.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Basic Comparison Table */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                  <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Comparison Table</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[150px]">
                            Property
                          </th>
                          {selectedVaccineDetails.map(vaccine => (
                            <th key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 min-w-[180px]">
                              <div className="font-semibold text-gray-900 break-words">
                                {vaccine.vaccine_brand_name || 'Unknown'}
                              </div>
                              {vaccine.manufacturer && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {vaccine.manufacturer}
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                            Pathogen
                          </td>
                          {selectedVaccineDetails.map(vaccine => (
                            <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                              {vaccine.pathogen_name || '-'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                            Type
                          </td>
                          {selectedVaccineDetails.map(vaccine => (
                            <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                              {vaccine.single_or_combination}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                            Manufacturer
                          </td>
                          {selectedVaccineDetails.map(vaccine => (
                            <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                              {vaccine.manufacturer || '-'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                            Licensing Authority
                          </td>
                          {selectedVaccineDetails.map(vaccine => (
                            <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="flex flex-col gap-1">
                                {vaccine.authority_names.length > 0 ? (
                                  vaccine.authority_names.map((authority, idx) => {
                                    const link = vaccine.authority_links[idx] || '';
                                    return (
                                      <span key={idx} className="text-xs sm:text-sm">
                                        {link ? (
                                          <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                          >
                                            {authority}
                                            <ExternalLink size={12} />
                                          </a>
                                        ) : (
                                          <span className="text-gray-700">{authority}</span>
                                        )}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-gray-400 text-xs sm:text-sm">-</span>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        {selectedVaccineDetails.some(v => v.vaccine_link) && (
                          <tr>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                              Link
                            </td>
                            {selectedVaccineDetails.map(vaccine => (
                              <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4">
                                {vaccine.vaccine_link ? (
                                  <a
                                    href={vaccine.vaccine_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-xs sm:text-sm flex items-center gap-1"
                                  >
                                    View Source
                                    <ExternalLink size={12} />
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-xs sm:text-sm">-</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Product Profiles Comparison */}
                {allProductProfileTypes.length > 0 && (
                  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Product Profiles Comparison</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="space-y-6">
                        {allProductProfileTypes.map(profileType => {
                          // Get vaccines that have valid profiles for this type (not "- not licensed yet -")
                          const vaccinesWithValidProfiles = selectedVaccineDetails.filter(vaccine => {
                            const profile = (vaccine.productProfiles || [])
                              .find(p => {
                                const composition = p.composition?.trim().toLowerCase();
                                return p.type === profileType && 
                                       composition && 
                                       composition !== '- not licensed yet -';
                              });
                            return !!profile;
                          });

                          // Only show this profile type section if there's at least one valid profile
                          if (vaccinesWithValidProfiles.length === 0) {
                            return null;
                          }

                          return (
                            <div key={profileType} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="bg-[#d17728] text-white px-4 py-2">
                                <h4 className="font-semibold text-sm sm:text-base">{profileType}</h4>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[150px]">
                                        Property
                                      </th>
                                      {vaccinesWithValidProfiles.map(vaccine => {
                                        const profile = (vaccine.productProfiles || [])
                                          .find(p => {
                                            const composition = p.composition?.trim().toLowerCase();
                                            return p.type === profileType && 
                                                   composition && 
                                                   composition !== '- not licensed yet -';
                                          });
                                        return (
                                          <th key={vaccine.licensed_vaccine_id} className="px-4 py-2 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                                            <div className="font-semibold text-gray-900 break-words">
                                              {profile?.name || vaccine.vaccine_brand_name || 'Unknown'}
                                            </div>
                                          </th>
                                        );
                                      })}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {[
                                      { key: 'composition', label: 'Composition' },
                                      { key: 'strainCoverage', label: 'Strain Coverage' },
                                      { key: 'indication', label: 'Indication' },
                                      { key: 'contraindication', label: 'Contraindication' },
                                      { key: 'dosing', label: 'Dosing' },
                                      { key: 'immunogenicity', label: 'Immunogenicity' },
                                      { key: 'Efficacy', label: 'Efficacy' },
                                      { key: 'durationOfProtection', label: 'Duration of Protection' },
                                      { key: 'coAdministration', label: 'Co-Administration' },
                                      { key: 'reactogenicity', label: 'Reactogenicity' },
                                      { key: 'safety', label: 'Safety' },
                                      { key: 'vaccinationGoal', label: 'Vaccination Goal' },
                                      { key: 'others', label: 'Others' },
                                    ].map(({ key, label }) => (
                                      <tr key={key}>
                                        <td className="px-4 py-2 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                                          {label}
                                        </td>
                                        {vaccinesWithValidProfiles.map(vaccine => {
                                          const profile = (vaccine.productProfiles || [])
                                            .find(p => {
                                              const composition = p.composition?.trim().toLowerCase();
                                              return p.type === profileType && 
                                                     composition && 
                                                     composition !== '- not licensed yet -';
                                            });
                                          const value = profile ? (profile as any)[key] : null;
                                          return (
                                            <td key={vaccine.licensed_vaccine_id} className="px-4 py-2 text-xs sm:text-sm text-gray-700">
                                              {value && value.trim() ? (
                                                <div className="break-words whitespace-pre-wrap">{value}</div>
                                              ) : (
                                                <span className="text-gray-400">-</span>
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-gray-500">
                  Select vaccines above to compare them side-by-side
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}

