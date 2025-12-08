"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown, AlertCircle } from "lucide-react";

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

const AlphabetNav = ({
  onLetterClick,
  activeLetter,
}: {
  onLetterClick: (letter: string) => void;
  activeLetter: string;
}) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="bg-white border-b border-gray-200 py-3 px-6 ">
      <div className="flex justify-between items-center gap-2 w-full">
        <button
          onClick={() => onLetterClick("")}
          className={`px-3 py-1 rounded transition-colors flex-shrink-0 ${
            !activeLetter
              ? "bg-[#d17728] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          All
        </button>
        <div className="flex justify-between gap-2 flex-1 flex-wrap">
          {letters.map((letter) => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              className={`px-3 py-1 rounded transition-colors ${
                activeLetter === letter
                  ? "bg-[#d17728] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function VaccinesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [pathogensData, setPathogensData] = useState<PathogenData[]>([]);
  const [pathogens, setPathogens] = useState<string[]>([]);
  const [selectedPathogen, setSelectedPathogen] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    licensedVaccines: true,
    pathogenProfile: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPathogensData();
  }, []);

  useEffect(() => {
    const pathogenParam = searchParams.get("pathogen");
    if (pathogenParam && pathogens.length > 0) {
      const decodedPathogen = decodeURIComponent(pathogenParam);
      if (pathogens.includes(decodedPathogen)) {
        setSelectedPathogen(decodedPathogen);
      }
    }
  }, [searchParams, pathogens]);

  async function fetchPathogensData() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/pathogens?populate=true`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from API");
      }

      const transformedPathogens: PathogenData[] = [];
      const transformedVaccines: Vaccine[] = [];
      const pathogenNames: string[] = [];

      data.forEach((pathogen: any) => {
        const pathogenName = pathogen.name || "Unknown Pathogen";
        pathogenNames.push(pathogenName);

        transformedPathogens.push({
          pathogenId: pathogen.pathogenId || 0,
          name: pathogenName,
          description: pathogen.description || "",
          image: pathogen.image || "",
          bulletpoints: pathogen.bulletpoints || "",
          link: pathogen.link || "",
        });

        const vaccinesArray = Array.isArray(pathogen.vaccines)
          ? pathogen.vaccines
          : [];

        vaccinesArray.forEach((vaccine: any, vIndex: number) => {
          const licensingDates = Array.isArray(vaccine.licensingDates)
            ? vaccine.licensingDates
            : [];

          const authorityNames: string[] = [];
          const authorityLinks: string[] = [];

          licensingDates.forEach((licensing: any) => {
            if (licensing.name) {
              authorityNames.push(licensing.name.trim());
            }
            if (licensing.source) {
              authorityLinks.push(licensing.source.trim());
            }
          });

          if (authorityNames.length > 0) {
            transformedVaccines.push({
              licensed_vaccine_id: `${pathogen.pathogenId || 0}-${vIndex}`,
              pathogen_name: pathogenName,
              vaccine_brand_name: vaccine.name || "Unknown Vaccine",
              single_or_combination:
                vaccine.single_or_combination || "Single Pathogen Vaccine",
              authority_names: authorityNames,
              authority_links: authorityLinks,
              vaccine_link: vaccine.vaccineLink || pathogen.link || "",
              manufacturer:
                vaccine.manufacturer || vaccine.manufacturer_name || "Unknown",
            });
          }
        });
      });

      transformedVaccines.sort((a, b) => {
        if (a.pathogen_name === b.pathogen_name) {
          return a.vaccine_brand_name.localeCompare(b.vaccine_brand_name);
        }
        return a.pathogen_name.localeCompare(b.pathogen_name);
      });

      const uniquePathogenNames = Array.from(new Set(pathogenNames)).sort(
        (a, b) => a.localeCompare(b)
      );

      setVaccines(transformedVaccines);
      setPathogensData(transformedPathogens);
      setPathogens(uniquePathogenNames);

      if (uniquePathogenNames.length > 0) {
        setSelectedPathogen(uniquePathogenNames[0]);
      }
    } catch (err) {
      console.error("Error fetching pathogens:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  }

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

      <div className="flex">
        <aside className="w-80 bg-white border-r border-gray-200 h-screen overflow-hidden sticky top-0 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search pathogens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                <p className="text-gray-500 text-sm">Loading pathogens...</p>
              </div>
            ) : error ? (
              <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className="text-red-500 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="text-red-800 font-semibold text-sm">
                      Error loading data
                    </p>
                    <p className="text-red-600 text-xs mt-1">{error}</p>
                    <button
                      onClick={fetchPathogensData}
                      className="mt-2 text-xs text-red-700 underline hover:text-red-800"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            ) : filteredPathogens.length > 0 ? (
              filteredPathogens.map((pathogen) => (
                <button
                  key={pathogen}
                  onClick={() => handlePathogenClick(pathogen)}
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

        <main className="flex-1 p-6">
          <div className="max-w-full">
            <div className="bg-gray-100 rounded-lg mb-4">
              <button
                onClick={() => toggleSection("licensedVaccines")}
                className="w-full flex justify-between items-center px-6 py-3 text-left hover:bg-gray-200 transition-colors rounded-t-lg"
              >
                <span className="font-semibold text-gray-800">
                  Licensed Vaccines
                </span>
                <ChevronDown
                  className={`text-gray-600 transition-transform ${
                    expandedSections.licensedVaccines ? "" : "rotate-180"
                  }`}
                  size={20}
                />
              </button>

              {expandedSections.licensedVaccines && (
                <div className="px-6 pb-4">
                  <div className="bg-white rounded shadow overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-sm">
                      <div>Vaccine Brand Name</div>
                      <div>Single or Combination Vaccine	</div>
                      <div>Licensing Authority</div>
                    </div>

                    {selectedVaccines.length > 0 ? (
                      selectedVaccines.map((vaccine) => (
                        <div
                          key={vaccine.licensed_vaccine_id}
                          className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 hover: transition-colors"
                        >
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
                className="w-full flex justify-between items-center px-6 py-3 text-left hover:bg-gray-200 transition-colors rounded-t-lg"
              >
                <span className="font-semibold text-gray-800">
                  Pathogen Profile
                </span>
                <ChevronDown
                  className={`text-gray-600 transition-transform ${
                    expandedSections.pathogenProfile ? "" : "rotate-180"
                  }`}
                  size={20}
                />
              </button>

              {expandedSections.pathogenProfile && selectedPathogenData && (
                <div className="px-6 pb-4">
                  <div className="bg-white rounded shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      {selectedPathogenData.name}
                    </h3>
                    {selectedPathogenData.description && (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {selectedPathogenData.description}
                      </p>
                    )}
                    <div className="flex gap-10">
                      {selectedPathogenData.image && (
                        <img
                          src={selectedPathogenData.image}
                          alt={selectedPathogenData.name}
                          className="w-48 rounded mb-4 shadow-sm"
                        />
                      )}

                      {selectedPathogenData.bulletpoints && (
                        <ul className="list-disc ml-6 text-gray-700 space-y-2">
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