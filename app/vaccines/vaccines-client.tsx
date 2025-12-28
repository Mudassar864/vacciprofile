'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown, Menu, X, ExternalLink, Clock } from "lucide-react";
import { AlphabetNav } from "@/components/alphabet-nav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface LicensingDate {
  id: string;
  vaccineName: string;
  name: string;
  type: string;
  approvalDate: string;
  source: string;
  lastUpdateOnVaccine: string;
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
  lastUpdated?: string;
  productProfiles?: ProductProfile[];
  licensingDates?: LicensingDate[];
}

interface PathogenData {
  pathogenId?: number;
  name?: string;
  description?: string;
  image?: string;
  bulletpoints?: string;
  link?: string;
  updatedAt?: string;
}

interface VaccinesClientProps {
  initialVaccines: Vaccine[];
  initialPathogensData: PathogenData[];
  initialPathogens: string[];
  initialSelectedPathogen?: string;
}

export function VaccinesClient({
  initialVaccines,
  initialPathogensData,
  initialPathogens,
  initialSelectedPathogen,
}: VaccinesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use Next.js searchParams directly - no need for useState for static data
  const pathogenParam = searchParams?.get("pathogen");
  const selectedPathogen = pathogenParam && initialPathogens.includes(decodeURIComponent(pathogenParam))
    ? decodeURIComponent(pathogenParam)
    : initialSelectedPathogen || initialPathogens[0] || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    licensedVaccines: true,
    pathogenProfile: true,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [loadingProductProfiles, setLoadingProductProfiles] = useState(false);

  const filteredPathogens = initialPathogens.filter((p) => {
    const matchSearch = p.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLetter =
      !activeLetter || p.charAt(0).toUpperCase() === activeLetter;
    return matchSearch && matchLetter;
  });

  const selectedVaccines = initialVaccines.filter(
    (v) => (v.pathogen_name || "") === selectedPathogen
  );

  const selectedPathogenData = initialPathogensData.find(
    (p) => p.name === selectedPathogen
  );

  const toggleSection = (section: "licensedVaccines" | "pathogenProfile") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePathogenClick = (pathogen: string) => {
    router.push(`/vaccines?pathogen=${encodeURIComponent(pathogen)}`);
  };

  const fetchProductProfiles = async (vaccineName: string) => {
    setLoadingProductProfiles(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
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
      const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
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

  const handleVaccineClick = async (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    const vaccineName = vaccine.vaccine_brand_name || '';
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

  return (
    <div className="min-h-screen bg-orange-50">
      <AlphabetNav
        onLetterClick={setActiveLetter}
        activeLetter={activeLetter}
      />

      <div className="flex relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
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
                placeholder="Type to search pathogens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                aria-label="Search pathogens"
              />
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 Click on a pathogen below to view its vaccines</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredPathogens.length > 0 ? (
              filteredPathogens.map((pathogen) => (
                <button
                  key={pathogen}
                  onClick={() => {
                    handlePathogenClick(pathogen);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-[#d17728] hover:text-white transition-colors ${
                    selectedPathogen === pathogen
                      ? "bg-[#d17728] text-white font-semibold"
                      : "text-black"
                  }`}
                >
                  <span
                    className={selectedPathogen === pathogen ? "" : "italic"}
                  >
                    {pathogen}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No pathogens found
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 p-3 sm:p-6 w-full lg:w-auto">
          {/* Mobile menu button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
              aria-label="Open sidebar to select pathogen"
            >
              <Menu size={20} />
              <span className="font-medium text-gray-700">
                {selectedPathogen || "👆 Tap to select a pathogen"}
              </span>
            </button>
            {!selectedPathogen && (
              <p className="text-xs text-gray-500 mt-1 ml-1">Select a pathogen from the menu to view vaccines</p>
            )}
          </div>
          <div className="max-w-full">
            <div className="bg-gray-100 rounded-lg mb-4">
              <button
                onClick={() => toggleSection("licensedVaccines")}
                className="w-full flex justify-between items-center px-4 sm:px-6 py-3 text-left hover:bg-gray-200 transition-colors rounded-t-lg"
              >
                <span className="font-semibold text-gray-800 text-sm sm:text-base">
                  Licensed Vaccines
                </span>
                <ChevronDown
                  className={`text-gray-600 transition-transform flex-shrink-0 ${
                    expandedSections.licensedVaccines ? "" : "rotate-180"
                  }`}
                  size={20}
                />
              </button>

              {expandedSections.licensedVaccines && (
                <div className="px-3 sm:px-6 pb-4">
                  <div className="bg-white rounded shadow overflow-hidden">
                    {/* Desktop table header */}
                    <div className="hidden md:grid md:grid-cols-4 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-sm">
                      <div>Vaccine Brand Name</div>
                      <div>Single or Combination Vaccine</div>
                      <div>Licensing Authority</div>
                      <div>Last Updated</div>
                    </div>  

                    {selectedVaccines.length > 0 ? (
                      selectedVaccines.map((vaccine) => (
                        <div
                          key={vaccine.licensed_vaccine_id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          {/* Desktop layout */}
                          <div className="hidden md:grid md:grid-cols-4 gap-4 p-4">
                            <div>
                              <button
                                onClick={() => handleVaccineClick(vaccine)}
                                className="text-blue-600 hover:underline text-left font-medium cursor-pointer hover:text-blue-800 transition-colors flex items-center gap-1"
                                title="Click to view product profile and licensing details"
                              >
                                <span>{vaccine.vaccine_brand_name || ""}</span>
                                <span className="text-xs opacity-70">→</span>
                              </button>
                            </div>

                            <div className="text-gray-700">
                              {vaccine.single_or_combination}
                            </div>

                            <div>
                              {Array.from(new Set(vaccine.authority_names)).map((authority, idx) => {
                                const authorityIndex = vaccine.authority_names.indexOf(authority);
                                const link = vaccine.authority_links[authorityIndex] || "";

                                return (
                                  <span key={idx}>
                                    {idx > 0 && ", "}
                                    {link ? (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                        title={`Visit ${authority} website (opens in new tab)`}
                                      >
                                        <span>{authority}</span>
                                        <ExternalLink size={12} className="opacity-70" />
                                      </a>
                                    ) : (
                                      <span className="text-gray-700">
                                        {authority}
                                      </span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>

                            <div className="text-gray-600 text-xs flex items-center gap-1">
                              {vaccine.lastUpdated ? (
                                <>
                                  <Clock size={12} className="opacity-70" />
                                  <span>{new Date(vaccine.lastUpdated).toLocaleDateString()}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </div>

                          {/* Mobile layout */}
                          <div className="md:hidden p-4 space-y-2">
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Vaccine Brand Name</span>
                              <div className="mt-1">
                                <button
                                  onClick={() => handleVaccineClick(vaccine)}
                                  className="text-blue-600 hover:underline font-medium text-left flex items-center gap-1"
                                  title="Tap to view product profile"
                                >
                                  <span>{vaccine.vaccine_brand_name || ""}</span>
                                  <span className="text-xs opacity-70">→</span>
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Type</span>
                              <div className="mt-1 text-gray-700">{vaccine.single_or_combination}</div>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Licensing Authority</span>
                              <div className="mt-1">
                                {Array.from(new Set(vaccine.authority_names)).map((authority, idx) => {
                                  const authorityIndex = vaccine.authority_names.indexOf(authority);
                                  const link = vaccine.authority_links[authorityIndex] || "";

                                  return (
                                    <span key={idx}>
                                      {idx > 0 && ", "}
                                      {link ? (
                                        <a
                                          href={link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                          title={`Visit ${authority} website (opens in new tab)`}
                                        >
                                          <span>{authority}</span>
                                          <ExternalLink size={12} className="opacity-70" />
                                        </a>
                                      ) : (
                                        <span className="text-gray-700">
                                          {authority}
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No licensed vaccines found for this pathogen
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-100 rounded-lg">
              <button
                onClick={() => toggleSection("pathogenProfile")}
                className="w-full flex justify-between items-center px-4 sm:px-6 py-3 text-left hover:bg-gray-200 transition-colors rounded-t-lg"
              >
                <span className="font-semibold text-gray-800 text-sm sm:text-base">
                  Pathogen Profile
                </span>
                <ChevronDown
                  className={`text-gray-600 transition-transform flex-shrink-0 ${
                    expandedSections.pathogenProfile ? "" : "rotate-180"
                  }`}
                  size={20}
                />
              </button>

              {expandedSections.pathogenProfile && selectedPathogenData && (
                <div className="px-3 sm:px-6 pb-4">
                  <div className="bg-white rounded shadow p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                      {selectedPathogenData.name}
                    </h3>
                    {selectedPathogenData.description && (
                      <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
                        {selectedPathogenData.description}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
                      {selectedPathogenData.image && (
                        <div className="flex-shrink-0 w-full sm:w-48 md:w-64 lg:w-72 mx-auto sm:mx-0">
                          <img
                            src={selectedPathogenData.image}
                            alt={selectedPathogenData.name}
                            className="w-full h-auto max-w-full rounded shadow-sm object-contain"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {selectedPathogenData.bulletpoints && (
                        <ul className="list-disc ml-6 text-gray-700 space-y-2 text-sm sm:text-base">
                          {selectedPathogenData.bulletpoints
                            .split("|")
                            .filter((bp) => bp.trim())
                            .map((bp, i) => (
                              <li key={i}>{bp.trim()}</li>
                            ))}
                        </ul>
                      )}
                    </div>

                    {selectedPathogenData.updatedAt && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-orange-600" />
                          <span className="font-semibold text-gray-700">Last Updated:</span>
                          <span>{new Date(selectedPathogenData.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
                  {selectedVaccine.vaccine_brand_name || ""}
                </DialogTitle>
              </DialogHeader>
              
              <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Pathogen:</span>
                    <span className="ml-2 text-gray-600 break-words">{selectedVaccine.pathogen_name || ""}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600 break-words">{selectedVaccine.single_or_combination}</span>
                  </div>
                  {selectedVaccine.vaccine_link && (
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-gray-700">Official Source:</span>
                      <a
                        href={selectedVaccine.vaccine_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline break-all inline-flex items-center gap-1"
                        title="Visit official vaccine source (opens in new tab)"
                      >
                        <span>View Official Source</span>
                        <ExternalLink size={14} className="opacity-70" />
                      </a>
                    </div>
                  )}
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
                    {/* Horizontal scrollable container */}
                    <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                      <div className="flex gap-3 sm:gap-4 min-w-max pb-4">
                        {[...selectedVaccine.productProfiles].sort((a, b) => {
                          // Sort profiles: EMA, WHO, FDA first (in that order), then all others
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
                              
                              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm ">
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
                    
                    {/* Licensing Data Section - at bottom of product profiles */}
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
                                    className="ml-2 text-blue-600 underline underline-offset-4 hover:underline break-all inline-flex items-center gap-1"
                                    title="Visit licensing source (opens in new tab)"
                                  >
                                    <span>View Licensing Source</span>
                                    <ExternalLink size={12} className="opacity-70" />
                                  </a>
                                </div>
                              )}
                              {license.lastUpdateOnVaccine && license.lastUpdateOnVaccine !== 'N/A' && (
                                <div>
                                  <span className="font-semibold text-gray-700">Last Updated:</span>
                                  <span className="ml-2 text-gray-600 break-words">{license.lastUpdateOnVaccine}</span>
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

