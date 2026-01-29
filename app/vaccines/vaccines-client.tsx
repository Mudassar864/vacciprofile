'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Menu, ExternalLink, Clock } from "lucide-react";
import { AlphabetNav } from "@/components/alphabet-nav";
import { SidebarWithSearch } from "@/components/common/sidebar-with-search";
import { ProductProfileDialog } from "@/components/vaccines/product-profile-dialog";
import { ProductProfileComparison } from "@/components/vaccines/product-profile-comparison";
import { Vaccine, PathogenData } from "@/lib/types";
import { formatPathogenName } from "@/lib/pathogen-formatting";
import { formatAuthorityName } from "@/lib/authority-formatting";
import { getApiBaseUrl } from "@/lib/api-url";

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
      const API_BASE = getApiBaseUrl();
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
      const API_BASE = getApiBaseUrl();
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
        <SidebarWithSearch
          title="Pathogens"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Type to search pathogens..."
          items={filteredPathogens}
          selectedItem={selectedPathogen}
          onItemClick={handlePathogenClick}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          emptyMessage="No pathogens found"
          hintText="💡 Click on a pathogen below to view its vaccines"
          sidebarClassName="bg-white border-r border-gray-200"
          headerClassName="p-4 border-b border-gray-200 bg-gray-50"
        />

        <main className="flex-1 p-3 sm:p-6 w-full lg:w-auto">
          {/* Mobile menu button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
              aria-label="Open sidebar to select pathogen"
            >
              <Menu size={20} />
              <span className={`font-medium text-gray-700 ${selectedPathogen ? (() => {
                const { className } = formatPathogenName(selectedPathogen);
                return className || '';
              })() : ''}`}>
                {selectedPathogen ? (() => {
                  const { displayName } = formatPathogenName(selectedPathogen);
                  return displayName;
                })() : "👆 Tap to select a pathogen"}
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
                              {vaccine.authority_names && vaccine.authority_names.length > 0 ? (
                                Array.from(new Set(vaccine.authority_names))
                                  .filter((authority) => {
                                    const authorityIndex = vaccine.authority_names.indexOf(authority);
                                    const rawLink = vaccine.authority_links[authorityIndex];
                                    const link = rawLink && rawLink !== "Not Available" ? rawLink : null;
                                    // Filter out Austria authorities without website link
                                    const isAustria = authority.toLowerCase().includes('austria');
                                    return !(isAustria && !link);
                                  })
                                  .map((authority, idx, filteredArray) => {
                                    const authorityIndex = vaccine.authority_names.indexOf(authority);
                                    const rawLink = vaccine.authority_links[authorityIndex];
                                    const link = rawLink && rawLink !== "Not Available" ? rawLink : null;
                                    const formattedAuthority = formatAuthorityName(authority);

                                    return (
                                      <span key={idx}>
                                        {idx > 0 && ", "}
                                        {link ? (
                                          <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                            title={`Visit ${formattedAuthority} website (opens in new tab)`}
                                          >
                                            <span>{formattedAuthority}</span>
                                            <ExternalLink size={12} className="opacity-70" />
                                          </a>
                                        ) : (
                                          <span 
                                            className="text-gray-700 inline-flex items-center gap-1 cursor-help"
                                            title="No website link available for this"
                                          >
                                            {formattedAuthority}
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })
                              ) : (
                                <span className="text-gray-400 italic">No licensing information available</span>
                              )}
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
                                {vaccine.authority_names && vaccine.authority_names.length > 0 ? (
                                  Array.from(new Set(vaccine.authority_names))
                                    .filter((authority) => {
                                      const authorityIndex = vaccine.authority_names.indexOf(authority);
                                      const rawLink = vaccine.authority_links[authorityIndex];
                                      const link = rawLink && rawLink !== "Not Available" ? rawLink : null;
                                      // Filter out Austria authorities without website link
                                      const isAustria = authority.toLowerCase().includes('austria');
                                      return !(isAustria && !link);
                                    })
                                    .map((authority, idx) => {
                                      const authorityIndex = vaccine.authority_names.indexOf(authority);
                                      const rawLink = vaccine.authority_links[authorityIndex];
                                      const link = rawLink && rawLink !== "Not Available" ? rawLink : null;
                                      const formattedAuthority = formatAuthorityName(authority);

                                      return (
                                        <span key={idx}>
                                          {idx > 0 && ", "}
                                          {link ? (
                                            <a
                                              href={link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                              title={`Visit ${formattedAuthority} website (opens in new tab)`}
                                            >
                                              <span>{formattedAuthority}</span>
                                              <ExternalLink size={12} className="opacity-70" />
                                            </a>
                                          ) : (
                                            <span 
                                              className="text-gray-700 inline-flex items-center gap-1 cursor-help"
                                              title="No website link available for this"
                                            >
                                              {formattedAuthority}
                                            </span>
                                          )}
                                        </span>
                                      );
                                    })
                                ) : (
                                  <span className="text-gray-400 italic">No licensing information available</span>
                                )}
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
                    <h3 className={`text-lg sm:text-xl font-semibold text-gray-800 mb-4 ${(() => {
                      const { className } = formatPathogenName(selectedPathogenData.name || '');
                      return className || '';
                    })()}`}>
                      {(() => {
                        const { displayName } = formatPathogenName(selectedPathogenData.name || '');
                        return displayName;
                      })()}
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

      <ProductProfileDialog
        vaccine={selectedVaccine}
        onClose={() => setSelectedVaccine(null)}
        loading={loadingProductProfiles}
      />
    </div>
  );
}

