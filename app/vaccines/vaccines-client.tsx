'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import { AlphabetNav } from "@/components/alphabet-nav";

interface Vaccine {
  licensed_vaccine_id: string;
  pathogen_name: string;
  vaccine_brand_name: string;
  single_or_combination: string;
  authority_names: string[];
  authority_links: string[];
  vaccine_link: string;
  manufacturer: string;
}

interface PathogenData {
  pathogenId: number;
  name: string;
  description: string;
  image: string;
  bulletpoints: string;
  link: string;
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
  const [vaccines] = useState<Vaccine[]>(initialVaccines);
  const [pathogensData] = useState<PathogenData[]>(initialPathogensData);
  const [pathogens] = useState<string[]>(initialPathogens);
  const [selectedPathogen, setSelectedPathogen] = useState<string>(
    initialSelectedPathogen || initialPathogens[0] || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    licensedVaccines: true,
    pathogenProfile: true,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const pathogenParam = searchParams.get("pathogen");
    if (pathogenParam && pathogens.length > 0) {
      const decodedPathogen = decodeURIComponent(pathogenParam);
      if (pathogens.includes(decodedPathogen)) {
        setSelectedPathogen(decodedPathogen);
      }
    }
  }, [searchParams, pathogens]);

  const filteredPathogens = pathogens.filter((p) => {
    const matchSearch = p.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLetter =
      !activeLetter || p.charAt(0).toUpperCase() === activeLetter;
    return matchSearch && matchLetter;
  });

  const selectedVaccines = vaccines.filter(
    (v) => v.pathogen_name === selectedPathogen
  );

  const selectedPathogenData = pathogensData.find(
    (p) => p.name === selectedPathogen
  );

  const toggleSection = (section: "licensedVaccines" | "pathogenProfile") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePathogenClick = (pathogen: string) => {
    setSelectedPathogen(pathogen);
    router.push(`/vaccines?pathogen=${encodeURIComponent(pathogen)}`);
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
                placeholder="Search pathogens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
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
                    <div className="hidden md:grid md:grid-cols-3 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-sm">
                      <div>Vaccine Brand Name</div>
                      <div>Single or Combination Vaccine</div>
                      <div>Licensing Authority</div>
                    </div>

                    {selectedVaccines.length > 0 ? (
                      selectedVaccines.map((vaccine) => (
                        <div
                          key={vaccine.licensed_vaccine_id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          {/* Desktop layout */}
                          <div className="hidden md:grid md:grid-cols-3 gap-4 p-4">
                            <div>
                              {vaccine.vaccine_link ? (
                                <a
                                  href={vaccine.vaccine_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {vaccine.vaccine_brand_name}
                                </a>
                              ) : (
                                <span>{vaccine.vaccine_brand_name}</span>
                              )}
                            </div>

                            <div className="text-gray-700">
                              {vaccine.single_or_combination}
                            </div>

                            <div>
                              {vaccine.authority_names.map((authority, idx) => {
                                const link = vaccine.authority_links[idx] || "";

                                return (
                                  <span key={idx}>
                                    {idx > 0 && ", "}
                                    {link ? (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        {authority}
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

                          {/* Mobile layout */}
                          <div className="md:hidden p-4 space-y-2">
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Vaccine Brand Name</span>
                              <div className="mt-1">
                                {vaccine.vaccine_link ? (
                                  <a
                                    href={vaccine.vaccine_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                  >
                                    {vaccine.vaccine_brand_name}
                                  </a>
                                ) : (
                                  <span className="font-medium">{vaccine.vaccine_brand_name}</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Type</span>
                              <div className="mt-1 text-gray-700">{vaccine.single_or_combination}</div>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Licensing Authority</span>
                              <div className="mt-1">
                                {vaccine.authority_names.map((authority, idx) => {
                                  const link = vaccine.authority_links[idx] || "";

                                  return (
                                    <span key={idx}>
                                      {idx > 0 && ", "}
                                      {link ? (
                                        <a
                                          href={link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          {authority}
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

