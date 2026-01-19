'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search, Menu, X, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarWithSearch } from '@/components/common/sidebar-with-search';
import { ProductProfileComparison } from '@/components/vaccines/product-profile-comparison';
import { VaccineComparisonTable } from '@/components/vaccines/vaccine-comparison-table';
import { Vaccine, ProductProfile } from '@/lib/types';
import { formatPathogenName } from '@/lib/pathogen-formatting';
import { formatAuthorityName } from '@/lib/authority-formatting';

interface VaccineWithProfiles extends Vaccine {
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
  const router = useRouter();
  
  // Use Next.js searchParams directly
  const pathogenParam = searchParams?.get("pathogen");
  const currentPathogen = pathogenParam && initialPathogens.includes(decodeURIComponent(pathogenParam))
    ? decodeURIComponent(pathogenParam)
    : initialSelectedPathogen || initialPathogens[0] || "";
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [vaccinesWithProfiles, setVaccinesWithProfiles] = useState<Vaccine[]>(initialVaccines);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState({
    single: true,
    combination: true,
  });
  const [isChangingPathogen, setIsChangingPathogen] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState<{ [key: string]: boolean }>({});

  // Fetch product profiles for a vaccine
  const fetchProductProfiles = async (vaccineName: string) => {
    if (loadingProfiles[vaccineName]) return;
    
    setLoadingProfiles(prev => ({ ...prev, [vaccineName]: true }));
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
      const response = await fetch(
        `${API_BASE}/api/product-profiles?vaccineName=${encodeURIComponent(vaccineName)}`,
        { cache: 'no-store' }
      );
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const result = await response.json();
      return result.productProfiles || [];
    } catch (error) {
      console.error('Error fetching product profiles:', error);
      return [];
    } finally {
      setLoadingProfiles(prev => ({ ...prev, [vaccineName]: false }));
    }
  };

  // Filter vaccines for current pathogen (needed for product profile fetching)
  const pathogenVaccines = vaccinesWithProfiles.filter(v => {
    const matchesPathogen = v.pathogen_name === currentPathogen;
    const matchesFilter = 
      (viewFilter.single && (v.single_or_combination === "Single" || v.single_or_combination === "Single Pathogen Vaccine")) ||
      (viewFilter.combination && (v.single_or_combination === "Combination" || v.single_or_combination === "Combination Vaccine"));
    return matchesPathogen && matchesFilter;
  });

  // Fetch product profiles for selected vaccines
  useEffect(() => {
    const loadProfiles = async () => {
      // Get all selected vaccines from pathogenVaccines (the ones currently visible)
      const selectedVaccinesList = pathogenVaccines.filter(v => 
        selectedVaccines.includes(v.licensed_vaccine_id)
      );
      
      if (selectedVaccinesList.length === 0) return;
      
      // Process each selected vaccine
      for (const vaccine of selectedVaccinesList) {
        // Check if vaccine already exists in vaccinesWithProfiles
        const existingVaccine = vaccinesWithProfiles.find(v => 
          v.licensed_vaccine_id === vaccine.licensed_vaccine_id && 
          v.pathogen_name === currentPathogen
        );
        
        // If vaccine doesn't exist in vaccinesWithProfiles, add it
        if (!existingVaccine) {
          setVaccinesWithProfiles(prev => {
            // Check if it's already being added
            const alreadyExists = prev.some(v => 
              v.licensed_vaccine_id === vaccine.licensed_vaccine_id && 
              v.pathogen_name === currentPathogen
            );
            if (alreadyExists) return prev;
            return [...prev, { ...vaccine, productProfiles: [] }];
          });
        }
        
        // Fetch profiles if vaccine has a name and no profiles yet
        const vaccineToCheck = existingVaccine || vaccine;
        if (vaccineToCheck.vaccine_brand_name && 
            (!vaccineToCheck.productProfiles || vaccineToCheck.productProfiles.length === 0)) {
          
          // Check if we're already loading this vaccine's profiles
          if (loadingProfiles[vaccineToCheck.vaccine_brand_name]) continue;
          
          const profiles = await fetchProductProfiles(vaccineToCheck.vaccine_brand_name);
          if (profiles.length > 0) {
            setVaccinesWithProfiles(prev => 
              prev.map(v => 
                v.licensed_vaccine_id === vaccine.licensed_vaccine_id && 
                v.pathogen_name === currentPathogen
                  ? { ...v, productProfiles: profiles }
                  : v
              )
            );
          }
        }
      }
    };
    
    if (selectedVaccines.length > 0 && currentPathogen && pathogenVaccines.length > 0) {
      loadProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVaccines, currentPathogen, pathogenVaccines]);

  const filteredPathogens = initialPathogens.filter(pathogen => {
    const matchesSearch = pathogen.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !activeLetter || pathogen.charAt(0).toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  });

  const toggleVaccineSelection = (vaccineId: string) => {
    const isCurrentlySelected = selectedVaccines.includes(vaccineId);
    
    if (isCurrentlySelected) {
      setSelectedVaccines(prev => {
        const currentPathogenVaccineIds = vaccinesWithProfiles
          .filter(v => v.pathogen_name === currentPathogen)
          .map(v => v.licensed_vaccine_id);
        const filteredPrev = prev.filter(id => currentPathogenVaccineIds.includes(id));
        return filteredPrev.filter(id => id !== vaccineId);
      });
    } else {
      setSelectedVaccines(prev => {
        const currentPathogenVaccineIds = vaccinesWithProfiles
          .filter(v => v.pathogen_name === currentPathogen)
          .map(v => v.licensed_vaccine_id);
        const filteredPrev = prev.filter(id => currentPathogenVaccineIds.includes(id));
        return [...filteredPrev, vaccineId];
      });
    }
  };


  const handlePathogenClick = (pathogen: string) => {
    // Only update if clicking a different pathogen
    if (pathogen === currentPathogen) {
      setSidebarOpen(false);
      return;
    }
    
    // Show loading state
    setIsChangingPathogen(true);
    
    // Clear vaccine selection when pathogen changes
    setSelectedVaccines([]);
    router.push(`/compare?pathogen=${encodeURIComponent(pathogen)}`);
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


  // Get selected vaccine details for comparison
  // First try to find in vaccinesWithProfiles, then fallback to pathogenVaccines
  const selectedVaccineDetails = (() => {
    // Filter from vaccinesWithProfiles first (includes product profiles)
    const fromProfiles = vaccinesWithProfiles.filter(v => 
      selectedVaccines.includes(v.licensed_vaccine_id) && v.pathogen_name === currentPathogen
    );
    
    // If we found matches, return them
    if (fromProfiles.length > 0) {
      return fromProfiles;
    }
    
    // Fallback: try to find in pathogenVaccines (current pathogen's vaccines)
    const fromPathogen = pathogenVaccines.filter(v => 
      selectedVaccines.includes(v.licensed_vaccine_id)
    );
    
    return fromPathogen;
  })();

  // Debug logging (remove in production)
  useEffect(() => {
    if (selectedVaccines.length > 0) {
      console.log('Selected vaccines:', selectedVaccines);
      console.log('Current pathogen:', currentPathogen);
      console.log('Vaccines with profiles count:', vaccinesWithProfiles.length);
      console.log('Pathogen vaccines count:', pathogenVaccines.length);
      console.log('Selected vaccine details count:', selectedVaccineDetails.length);
      console.log('Selected vaccine details:', selectedVaccineDetails);
    }
  }, [selectedVaccines, currentPathogen, vaccinesWithProfiles, pathogenVaccines, selectedVaccineDetails]);

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
        <SidebarWithSearch
          title="Pathogens"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Type to search pathogens..."
          items={filteredPathogens}
          selectedItem={currentPathogen}
          onItemClick={handlePathogenClick}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          emptyMessage="No pathogens found"
          hintText="💡 Select a pathogen, then choose vaccines to compare"
          sidebarClassName="bg-white/95 backdrop-blur-sm border-r border-gray-200/50 shadow-xl lg:shadow-none"
          headerClassName="p-4 sm:p-5 border-b border-gray-200/80 bg-gradient-to-r from-gray-50 to-white"
          itemClassName={(isSelected) =>
            `w-full text-left px-4 sm:px-5 py-3 border-b border-gray-200/50 transition-all duration-200 ease-in-out transform ${
              isSelected
                ? 'bg-[#d17728] text-white font-semibold shadow-md scale-[1.02]'
                : 'text-gray-700 hover:bg-[#d17728]/10 hover:text-[#d17728] hover:font-medium active:scale-[0.98]'
            }`
          }
          renderItem={(pathogen, isSelected) => {
            const { displayName, className } = formatPathogenName(pathogen);
            return (
              <>
                <span className={`transition-all duration-200 ${isSelected ? 'font-semibold' : 'font-normal'} ${className || ''}`}>
                  {displayName}
                </span>
                {isSelected && (
                  <span className="ml-2 inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </>
            );
          }}
        />

        <main className="flex-1 p-4 sm:p-6 w-full lg:w-auto">
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all shadow-sm"
              aria-label="Open sidebar"
            >
              <Menu size={20} className="text-gray-700" />
              <span className="font-medium text-gray-700">
                {currentPathogen || "Select Pathogen"}
              </span>
            </button>
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Selection Section */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
              <div className="bg-[#d17728] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
                <h2 className="text-lg sm:text-xl font-bold">Licensed Vaccines</h2>
                <p className="text-xs sm:text-sm text-orange-100 mt-1">
                  ☑️ Check the boxes below to select vaccines for comparison
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
                                        .filter(v => v.pathogen_name === currentPathogen)
                                        .map(v => v.licensed_vaccine_id);
                                      const filteredPrev = prev.filter(id => currentPathogenVaccineIds.includes(id));
                                      
                                      // Add all current pathogen vaccines
                                      const combined = Array.from(new Set([...filteredPrev, ...allIds]));
                                      return combined;
                                    });
                                    
                                    // Product profiles will be fetched automatically by useEffect
                                  } else {
                                    // Unselect all vaccines for current pathogen
                                    setSelectedVaccines(prev => {
                                      // Keep vaccines from other pathogens, remove current pathogen vaccines
                                      const currentPathogenVaccineIds = vaccinesWithProfiles
                                        .filter(v => v.pathogen_name === currentPathogen)
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
                                      vaccine.authority_names
                                        .map((authority, idx) => ({ authority, idx }))
                                        .filter(({ authority, idx }) => {
                                          const rawLink = vaccine.authority_links[idx];
                                          const link = rawLink && rawLink !== "Not Available" ? rawLink : null;
                                          // Filter out Austria authorities without website link
                                          const isAustria = authority.toLowerCase().includes('austria');
                                          return !(isAustria && !link);
                                        })
                                        .map(({ authority, idx }) => {
                                          const rawLink = vaccine.authority_links[idx];
                                          const link = rawLink && rawLink !== "Not Available" ? rawLink : null;
                                          const formattedAuthority = formatAuthorityName(authority);
                                          return (
                                            <span key={idx} className="inline-flex items-center gap-1">
                                              {link ? (
                                                <a
                                                  href={link}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                                                  title={`Visit ${formattedAuthority} website (opens in new tab)`}
                                                >
                                                  <span>{formattedAuthority}</span>
                                                  <ExternalLink size={12} className="opacity-70" />
                                                </a>
                                              ) : (
                                                <span 
                                                  className="text-gray-700 text-xs flex items-center gap-1 cursor-help"
                                                  title="No website link available for this"
                                                >
                                                  {formattedAuthority}
                                                </span>
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
                  <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 font-medium">
                      ✓ {selectedVaccines.length} vaccine{selectedVaccines.length !== 1 ? 's' : ''} selected - Scroll down to view comparison
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
            ) : selectedVaccines.length > 0 ? (
              selectedVaccineDetails.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Product Profiles Comparison */}
                {(() => {
                  // Check if any profiles are currently being loaded
                  const isLoadingProfiles = selectedVaccineDetails.some(v => 
                    v.vaccine_brand_name && loadingProfiles[v.vaccine_brand_name]
                  );
                  
                  // Collect all profiles from all selected vaccines
                  const allProfiles: (ProductProfile & { vaccineName: string })[] = [];
                  selectedVaccineDetails.forEach(vaccine => {
                    (vaccine.productProfiles || []).forEach(profile => {
                      // Include all profiles - we'll display them all
                      allProfiles.push({
                        ...profile,
                        vaccineName: vaccine.vaccine_brand_name || 'Unknown'
                      });
                    });
                  });

                  // Sort profiles: EMA, WHO, FDA first (in that order), then all others
                  const priorityOrder = ['EMA', 'WHO', 'FDA'];
                  const sortedProfiles = allProfiles.sort((a, b) => {
                    const aType = (a.type || '').toUpperCase();
                    const bType = (b.type || '').toUpperCase();
                    
                    // Check if profile type contains priority keywords
                    const aHasEMA = aType.includes('EMA');
                    const aHasWHO = aType.includes('WHO');
                    const aHasFDA = aType.includes('FDA');
                    const bHasEMA = bType.includes('EMA');
                    const bHasWHO = bType.includes('WHO');
                    const bHasFDA = bType.includes('FDA');
                    
                    // Priority order: EMA (0), WHO (1), FDA (2), others (3)
                    const getPriority = (hasEMA: boolean, hasWHO: boolean, hasFDA: boolean) => {
                      if (hasEMA) return 0;
                      if (hasWHO) return 1;
                      if (hasFDA) return 2;
                      return 3;
                    };
                    
                    const aPriority = getPriority(aHasEMA, aHasWHO, aHasFDA);
                    const bPriority = getPriority(bHasEMA, bHasWHO, bHasFDA);
                    
                    // Sort by priority
                    if (aPriority !== bPriority) {
                      return aPriority - bPriority;
                    }
                    
                    // If same priority, maintain original order
                    return 0;
                  });

                  // Show loading state or empty state
                  if (isLoadingProfiles) {
                    return (
                      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                        <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900">Product Profiles Comparison</h3>
                        </div>
                        <div className="p-8 sm:p-12 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d17728] mb-4"></div>
                          <p className="text-sm sm:text-base text-gray-600">
                            Loading product profiles...
                          </p>
                        </div>
                      </div>
                    );
                  }
                  
                  if (sortedProfiles.length === 0) {
                    // Check if vaccines have empty product profiles arrays (meaning they were checked but no profiles found)
                    const hasCheckedProfiles = selectedVaccineDetails.some(v => 
                      v.productProfiles !== undefined && v.productProfiles.length === 0
                    );
                    
                    if (hasCheckedProfiles) {
                      return (
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                          <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">Product Profiles Comparison</h3>
                          </div>
                          <div className="p-8 sm:p-12 text-center">
                            <p className="text-sm sm:text-base text-gray-500">
                              No product profiles available for the selected vaccines.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
                    return null;
                  }

                  return (
                    <ProductProfileComparison
                      profiles={sortedProfiles}
                      showVaccineName={true}
                    />
                  );
                })()}

                <VaccineComparisonTable vaccines={selectedVaccineDetails} />
              </div>
              ) : (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                  <p className="text-sm sm:text-base text-gray-600 font-medium">
                    ⚠️ Vaccines selected but no data found
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Selected: {selectedVaccines.length} vaccine{selectedVaccines.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Current pathogen: {currentPathogen || 'None'}
                  </p>
                  <p className="text-xs text-gray-400 mt-4">
                    Try selecting vaccines again or check if they match the current pathogen filter.
                  </p>
                </div>
              )
            ) : (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-gray-500">
                  👆 Select vaccines above using the checkboxes to compare them side-by-side
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  💡 Tip: Select 2-4 vaccines for the best comparison view
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}

