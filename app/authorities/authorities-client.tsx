'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { AlphabetNav } from '@/components/alphabet-nav';
import { ProductProfileDialog } from '@/components/vaccines/product-profile-dialog';
import { formatPathogenName } from '@/lib/pathogen-formatting';
import type { ProductProfile, LicensingDate, Vaccine } from '@/lib/types';
import { getApiBaseUrl } from '@/lib/api-url';

/** Raw vaccine from API – no restructuring. */
export type RawVaccine = Record<string, unknown> & {
  id?: string;
  name?: string;
  vaccineType?: string;
  pathogenNames?: string | string[];
  manufacturerNames?: string | string[];
  licensingDates?: Array<Record<string, unknown> & { name?: string; source?: string }>;
};

export type Licenser = {
  id: string;
  acronym?: string;
  region?: string;
  country?: string;
  fullName?: string;
  description?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
};

const LICENSER_ACRONYMS = ['EMA', 'FDA', 'WHO'] as const;

export type AuthoritiesClientProps = {
  initialLicensers?: Licenser[];
  initialVaccines?: unknown[];
};

function deriveCountries(licensers: Licenser[]): string[] {
  const want = new Set(LICENSER_ACRONYMS.map((a) => a.toUpperCase()));
  const seen = new Set<string>();
  for (const l of licensers || []) {
    const ac = (l.acronym || '').trim().toUpperCase();
    if (ac && want.has(ac)) continue;
    const c = (l.country || '').trim();
    if (c) seen.add(c);
  }
  return Array.from(seen).sort();
}

function derivePinnedLicensers(licensers: Licenser[]): Licenser[] {
  const want = new Set(LICENSER_ACRONYMS.map((a) => a.toUpperCase()));
  const filtered = (licensers || []).filter((l) => {
    const ac = (l.acronym || '').trim().toUpperCase();
    return ac && want.has(ac);
  });
  const order = ['EMA', 'FDA', 'WHO'] as const;
  return order
    .map((ac) => filtered.find((l) => (l.acronym || '').toUpperCase() === ac))
    .filter((l): l is Licenser => !!l);
}

/** Build map: licensingDates[].name -> vaccines. Uses raw API shape. */
function buildVaccinesByLicenser(vaccines: RawVaccine[]): Map<string, RawVaccine[]> {
  const map = new Map<string, RawVaccine[]>();
  for (const v of vaccines || []) {
    const ld = Array.isArray(v.licensingDates) ? v.licensingDates : [];
    for (const l of ld) {
      const k = (l.name || '').trim();
      if (!k) continue;
      if (!map.has(k)) map.set(k, []);
      const list = map.get(k)!;
      const vid = (v.id ?? '') as string;
      if (!list.some((x) => (x.id ?? '') === vid)) list.push(v);
    }
  }
  return map;
}

/** Candidate keys to match a licenser against licensingDates[].name. */
function licenserMatchKeys(l: Licenser): string[] {
  const ac = (l.acronym || '').trim();
  const full = (l.fullName || '').trim();
  const country = (l.country || '').trim();
  const keys: string[] = [];
  if (ac) keys.push(ac);
  if (full) keys.push(full);
  if (full && country) keys.push(`${full} (${country})`);
  if (full && ac) keys.push(`${full} (${ac})`);
  return keys;
}

function pathogenDisplay(v: RawVaccine): string {
  const p = v.pathogenNames;
  if (typeof p === 'string') return p.trim();
  if (Array.isArray(p)) return (p as string[]).map((s) => String(s).trim()).filter(Boolean).join(', ');
  return '';
}

function manufacturerDisplay(v: RawVaccine): string {
  const m = v.manufacturerNames;
  if (typeof m === 'string') return m.trim();
  if (Array.isArray(m)) return (m as string[]).map((s) => String(s).trim()).filter(Boolean).join(', ');
  return '';
}

function toVaccineForDialog(
  v: (RawVaccine & { productProfiles?: ProductProfile[]; licensingDates?: LicensingDate[] }) | null
): Vaccine | null {
  if (!v) return null;
  const p = pathogenDisplay(v);
  const first =
    typeof v.pathogenNames === 'string'
      ? (v.pathogenNames as string).split(',')[0]?.trim()
      : Array.isArray(v.pathogenNames)
        ? (v.pathogenNames as string[])[0]?.trim()
        : '';
  const isComb = (v.vaccineType ?? '').toString().toLowerCase().includes('combination');
  const link = (v.vaccineLink ?? v.link ?? '') as string;
  return {
    licensed_vaccine_id: (v.id ?? '') as string,
    vaccine_brand_name: (v.name ?? '') as string,
    pathogen_name: first || p || undefined,
    single_or_combination: isComb ? 'Combination' : 'Single',
    authority_names: [],
    authority_links: [],
    vaccine_link: link || undefined,
    manufacturer: manufacturerDisplay(v) || undefined,
    productProfiles: v.productProfiles,
    licensingDates: (v as { licensingDates?: LicensingDate[] }).licensingDates,
  };
}

function vaccinesForLicenser(
  map: Map<string, RawVaccine[]>,
  licenser: Licenser
): RawVaccine[] {
  const candidates = licenserMatchKeys(licenser);
  const seen = new Set<string>();
  const out: RawVaccine[] = [];
  const match = (key: string) => {
    const k = key.trim();
    if (!k) return;
    const list = map.get(k);
    if (!list) return;
    for (const v of list) {
      const vid = (v.id ?? '') as string;
      if (seen.has(vid)) continue;
      seen.add(vid);
      out.push(v);
    }
  };
  for (const c of candidates) match(c);
  for (const k of Array.from(map.keys())) {
    const lower = k.toLowerCase();
    if (candidates.some((c) => c.trim().toLowerCase() === lower)) match(k);
  }
  return out;
}

function parseDescription(description: string) {
  const lines = description.split('\n').map((l) => l.trim()).filter(Boolean);
  const content: Array<{ type: 'heading' | 'bullet' | 'text'; content: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('•') || line.startsWith('●') || line.startsWith('▪') || line.startsWith('▸')) {
      const t = line.replace(/^[•●▪▸]\s*/, '').trim();
      if (t) content.push({ type: 'bullet', content: t });
      continue;
    }
    const curly = line.match(/\{([^}]+)\}/);
    if (curly) {
      const h = curly[1].trim();
      if (h) content.push({ type: 'heading', content: h });
      const rest = line.replace(/\{[^}]+\}/, '').trim();
      if (rest) content.push({ type: 'text', content: rest });
      continue;
    }
    const wordCount = line.split(/\s+/).filter(Boolean).length;
    const short = line.length < 60;
    const allCaps = line === line.toUpperCase() && line.length > 3 && /[A-Z]/.test(line);
    const fewWords = wordCount <= 3;
    const next = lines[i + 1];
    const nextBullet = next && /^[•●▪▸]/.test(next);
    const nextShort = next && next.split(/\s+/).filter(Boolean).length <= 3;
    if ((short && nextBullet) || (allCaps && short) || (fewWords && (nextBullet || nextShort))) {
      content.push({ type: 'heading', content: line });
    } else {
      content.push({ type: 'text', content: line });
    }
  }
  return content;
}

export function AuthoritiesClient({
  initialLicensers = [],
  initialVaccines = [],
}: AuthoritiesClientProps) {
  const vaccinesByLicenser = useMemo(
    () => buildVaccinesByLicenser((initialVaccines || []) as RawVaccine[]),
    [initialVaccines]
  );
  
  const pinnedLicensers = useMemo(
    () => derivePinnedLicensers(initialLicensers),
    [initialLicensers]
  );

  const otherLicensers = useMemo(() => {
    const want = new Set(LICENSER_ACRONYMS.map((a) => a.toUpperCase()));
    return (initialLicensers || []).filter(
      (l) => !want.has((l.acronym || '').trim().toUpperCase())
    );
  }, [initialLicensers]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [showOtherCountries, setShowOtherCountries] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedProfile, setExpandedProfile] = useState(true);
  const [expandedTable, setExpandedTable] = useState(true);
  const [selectedLicenserAcronym, setSelectedLicenserAcronym] = useState('EMA');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState<(RawVaccine & { productProfiles?: ProductProfile[]; licensingDates?: LicensingDate[] }) | null>(null);
  const [loadingProductProfiles, setLoadingProductProfiles] = useState(false);

  const filteredPinned = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const letter = activeLetter;
    return pinnedLicensers.filter((l) => {
      const text = `${l.acronym || ''} ${l.fullName || ''} ${l.region || ''} ${l.country || ''}`.toLowerCase();
      const matchSearch = !q || text.includes(q);
      const ac = (l.acronym || '').trim();
      const matchLetter = !letter || ac.charAt(0).toUpperCase() === letter;
      return matchSearch && matchLetter;
    });
  }, [pinnedLicensers, searchQuery, activeLetter]);

  const filteredOthers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const letter = activeLetter;
    return otherLicensers.filter((l) => {
      const text = `${l.acronym || ''} ${l.fullName || ''} ${l.region || ''} ${l.country || ''}`.toLowerCase();
      const matchSearch = !q || text.includes(q);
      const ac = (l.acronym || '').trim();
      const matchLetter = !letter || ac.charAt(0).toUpperCase() === letter;
      return matchSearch && matchLetter;
    });
  }, [otherLicensers, searchQuery, activeLetter]);

  const otherCountries = useMemo(() => {
    const raw = Array.from(
      new Set(filteredOthers.map((l) => (l.country || '').trim() || 'Unknown'))
    ).filter(Boolean);
    if (!searchQuery.trim()) return raw.sort();
    const q = searchQuery.toLowerCase();
    return raw
      .filter((c) => c.toLowerCase().includes(q) || filteredOthers.some((l) => (l.country || '').trim() === c))
      .sort();
  }, [filteredOthers, searchQuery]);

  const displayedLicenser = useMemo((): Licenser | null => {
    if (selectedLicenserAcronym) {
      return pinnedLicensers.find(
        (l) => ((l.acronym || '').trim() || l.id) === selectedLicenserAcronym
      ) || null;
    }
    if (selectedCountry) {
      return initialLicensers.find((l) => (l.country || '').trim() === selectedCountry) || null;
    }
    return null;
  }, [selectedLicenserAcronym, selectedCountry, pinnedLicensers, initialLicensers]);

  const selectedVaccines = useMemo(
    () => (displayedLicenser ? vaccinesForLicenser(vaccinesByLicenser, displayedLicenser) : []),
    [displayedLicenser, vaccinesByLicenser]
  );
  const handleLicenserClick = (l: Licenser) => {
    const ac = (l.acronym || '').trim() || l.id;
    setSelectedLicenserAcronym((prev) => (prev === ac ? '' : ac));
    setSelectedCountry('');
    setSidebarOpen(false);
  };

  const handleCountryClick = (country: string) => {
    const first = initialLicensers.find((l) => (l.country || '').trim() === country);
    if (!first) return;
    setSelectedCountry((prev) => (prev === country ? '' : country));
    setSelectedLicenserAcronym('');
    setSidebarOpen(false);
  };

  const fetchProductProfiles = async (name: string) => {
    const API_BASE = getApiBaseUrl();
    const r = await fetch(`${API_BASE}/api/product-profiles?vaccineName=${encodeURIComponent(name)}`, { cache: 'no-store' });
    if (!r.ok) return [];
    const j = await r.json();
    return j.productProfiles || [];
  };

  const fetchLicensingDates = async (name: string) => {
    const API_BASE = getApiBaseUrl();
    const r = await fetch(`${API_BASE}/api/licensing-dates?vaccineName=${encodeURIComponent(name)}`, { cache: 'no-store' });
    if (!r.ok) return [];
    const j = await r.json();
    return j.licensingDates || [];
  };

  const handleVaccineClick = async (v: RawVaccine) => {
    setSelectedVaccine(v as RawVaccine & { productProfiles?: ProductProfile[]; licensingDates?: LicensingDate[] });
    const name = (v.name ?? '') as string;
    if (name) {
      setLoadingProductProfiles(true);
      try {
        const [profiles, licensingDates] = await Promise.all([
          fetchProductProfiles(name),
          fetchLicensingDates(name),
        ]);
        const { licensingDates: _ld, ...rest } = v;
        setSelectedVaccine({
          ...rest,
          productProfiles: profiles,
          licensingDates: licensingDates as LicensingDate[],
        } as RawVaccine & { productProfiles?: ProductProfile[]; licensingDates?: LicensingDate[] });
      } finally {
        setLoadingProductProfiles(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <AlphabetNav onLetterClick={setActiveLetter} activeLetter={activeLetter} />

      <div className="flex relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={`fixed lg:sticky top-0 left-0 z-50 lg:z-0 w-80 bg-white border-r border-gray-200 h-screen overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between mb-2 lg:hidden">
              <h2 className="font-semibold text-gray-800">Authorities</h2>
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
                placeholder="Type to search authorities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                aria-label="Search licensing authorities"
              />
              {searchQuery.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              ) : (
                <Search className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 Click on an authority to view approved vaccines</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredPinned.map((l) => {
              const ac = (l.acronym || '').trim() || l.id;
              const isSelected = selectedLicenserAcronym === ac;
              return (
                <button
                  key={l.id}
                  onClick={() => handleLicenserClick(l)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 transition-colors ${
                    isSelected
                      ? 'bg-[#d17728] text-white font-semibold hover:bg-[#b96a24]'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  <div className="font-medium">
                    {ac} {l.region ? l.region : ''}
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowOtherCountries((prev) => !prev)}
              className={`w-full text-left px-4 py-3 border-b border-gray-200 transition-colors font-medium flex items-center justify-between ${
                showOtherCountries
                  ? 'bg-[#d17728] text-white hover:bg-[#b96a24]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Licensing authorities in other countries</span>
              <ChevronDown className={`transition-transform flex-shrink-0 ${showOtherCountries ? 'rotate-180' : ''}`} size={20} />
            </button>

            {showOtherCountries &&
              otherCountries.map((country) => {
                const first = initialLicensers.find((l) => (l.country || '').trim() === country);
                const isSelected = !!first && selectedCountry === country;
                return (
                  <button
                    key={country}
                    onClick={() => handleCountryClick(country)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 transition-colors ${
                      isSelected
                        ? 'bg-[#d17728] text-white font-semibold hover:bg-[#b96a24]'
                        : 'text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    <div className="font-medium">{country}</div>
                  </button>
                );
              })}

            {filteredPinned.length === 0 && filteredOthers.length === 0 && (
              <div className="p-4 text-center text-gray-500">No authorities found</div>
            )}
          </div>
        </aside>

        <main className="flex-1 p-3 sm:p-6 w-full lg:w-auto min-w-0">
          <div className="lg:hidden mb-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
              <span className="font-medium text-gray-700">
                {displayedLicenser?.acronym || displayedLicenser?.fullName || 'Select Authority'}
              </span>
            </button>
          </div>

          {displayedLicenser ? (
            <div className="max-w-full">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <button
                  type="button"
                  onClick={() => setExpandedProfile((p) => !p)}
                  className="w-full p-4 sm:p-6 cursor-pointer flex items-center justify-between bg-gray-100 rounded-t-lg hover:bg-gray-200 transition-colors text-left"
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {displayedLicenser.fullName || displayedLicenser.acronym || 'Licenser'} Profile
                  </h2>
                  {expandedProfile ? <ChevronUp size={24} className="text-gray-600 flex-shrink-0" /> : <ChevronDown size={24} className="text-gray-600 flex-shrink-0" />}
                </button>
                {expandedProfile && (
                  <div className="p-4 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#d17728] mb-4">
                      {displayedLicenser.fullName || displayedLicenser.acronym || 'Licenser'}
                    </h1>
                    {displayedLicenser.website && (
                      <a
                        href={displayedLicenser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium text-sm sm:text-base break-all inline-flex items-center gap-2 mb-4"
                        title="Visit licensing authority website (opens in new tab)"
                      >
                        <span>Visit Official Website</span>
                        <ExternalLink size={14} className="opacity-70" />
                      </a>
                    )}
                    {displayedLicenser.description && (
                      <div className="mt-4">
                        {parseDescription(displayedLicenser.description).map((item, i) => {
                          if (item.type === 'heading') {
                            return (
                              <h3 key={i} className="text-lg font-semibold text-[#d17728] mt-6 mb-3 first:mt-0">
                                {item.content}
                              </h3>
                            );
                          }
                          if (item.type === 'bullet') {
                            return (
                              <div key={i} className="flex items-start gap-3 mb-3">
                                <span className="text-[#d17728] mt-1.5 flex-shrink-0">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </span>
                                <span className="text-gray-700 leading-relaxed text-sm sm:text-base flex-1">{item.content}</span>
                              </div>
                            );
                          }
                          return (
                            <p key={i} className="text-gray-700 leading-relaxed mb-3 text-sm sm:text-base">
                              {item.content}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedTable((t) => !t)}
                  className="w-full p-4 bg-gray-100 cursor-pointer flex items-center justify-between hover:bg-gray-200 transition-colors text-left"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Licensed Vaccines ({selectedVaccines.length})
                  </h3>
                  {expandedTable ? <ChevronUp size={20} className="text-gray-600 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-600 flex-shrink-0" />}
                </button>
                {expandedTable && (
                  <div className="overflow-x-auto">
                    <table className="hidden md:table w-full">
                      <thead className="bg-[#d17728] text-white">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm">Vaccine Brand Name</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm">Single or Combination Vaccine</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm">Pathogen</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm">Manufacturer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVaccines.length > 0 ? (
                          selectedVaccines.map((v, idx) => {
                            const pid = (v.id ?? '') as string;
                            const pStr = pathogenDisplay(v);
                            const firstPathogen = typeof v.pathogenNames === 'string'
                              ? (v.pathogenNames as string).split(',')[0]?.trim()
                              : Array.isArray(v.pathogenNames) ? (v.pathogenNames as string[])[0]?.trim() : '';
                            const mStr = manufacturerDisplay(v);
                            const isComb = (v.vaccineType ?? '').toString().toLowerCase().includes('combination');
                            return (
                              <tr key={`${pid}-${idx}`} className="border-b border-gray-200 hover:bg-orange-50 transition-colors">
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                  <button
                                    type="button"
                                    onClick={() => handleVaccineClick(v)}
                                    className="text-blue-600 hover:underline font-medium text-sm cursor-pointer text-left hover:text-blue-800 transition-colors flex items-center gap-1 group"
                                    title="Click to view product profile and licensing details"
                                  >
                                    <span>{(v.name ?? '') as string}</span>
                                    <span className="text-xs opacity-0 group-hover:opacity-70 transition-opacity">→</span>
                                  </button>
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                  <span className={`inline-block px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${isComb ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {isComb ? 'Combination' : 'Single'}
                                  </span>
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                  {firstPathogen ? (
                                    <Link
                                      href={`/vaccines?pathogen=${encodeURIComponent(firstPathogen)}`}
                                      className={`text-blue-600 hover:underline block text-sm cursor-pointer ${formatPathogenName(firstPathogen).className || ''}`}
                                    >
                                      {formatPathogenName(firstPathogen).displayName}
                                    </Link>
                                  ) : pStr ? (
                                    <span className="text-gray-700 text-sm">{pStr}</span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                  )}
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                  {mStr ? (
                                    <Link
                                      href={`/manufacturers?manufacturer=${encodeURIComponent(mStr)}`}
                                      className="text-blue-600 hover:underline block text-sm cursor-pointer"
                                    >
                                      {mStr}
                                    </Link>
                                  ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-gray-500">
                              No licensed vaccines found for this authority.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    <div className="md:hidden divide-y divide-gray-200">
                      {selectedVaccines.length > 0 ? (
                        selectedVaccines.map((v, idx) => {
                          const pid = (v.id ?? '') as string;
                          const pStr = pathogenDisplay(v);
                          const firstPathogen = typeof v.pathogenNames === 'string'
                            ? (v.pathogenNames as string).split(',')[0]?.trim()
                            : Array.isArray(v.pathogenNames) ? (v.pathogenNames as string[])[0]?.trim() : '';
                          const mStr = manufacturerDisplay(v);
                          const isComb = (v.vaccineType ?? '').toString().toLowerCase().includes('combination');
                          return (
                            <div key={`${pid}-${idx}`} className="p-4 space-y-3 hover:bg-orange-50 transition-colors">
                              <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Vaccine Brand Name</span>
                                <div className="mt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleVaccineClick(v)}
                                    className="text-blue-600 hover:underline font-medium text-left cursor-pointer flex items-center gap-1 group"
                                    title="Tap to view product profile"
                                  >
                                    <span>{(v.name ?? '') as string}</span>
                                    <span className="text-xs opacity-0 group-hover:opacity-70 transition-opacity">→</span>
                                  </button>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Type</span>
                                <div className="mt-1">
                                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${isComb ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {isComb ? 'Combination' : 'Single'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Pathogen</span>
                                <div className="mt-1">
                                  {firstPathogen ? (
                                    <Link href={`/vaccines?pathogen=${encodeURIComponent(firstPathogen)}`} className={`text-blue-600 hover:underline block cursor-pointer ${formatPathogenName(firstPathogen).className || ''}`}>
                                      {formatPathogenName(firstPathogen).displayName}
                                    </Link>
                                  ) : pStr ? (
                                    <span className="text-gray-700">{pStr}</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Manufacturer</span>
                                <div className="mt-1">
                                  {mStr ? (
                                    <Link href={`/manufacturers?manufacturer=${encodeURIComponent(mStr)}`} className="text-blue-600 hover:underline block cursor-pointer">
                                      {mStr}
                                    </Link>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-gray-500">No licensed vaccines found for this authority.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-gray-500 text-lg">Select a licensing authority to view details</p>
            </div>
          )}
        </main>
      </div>

      <ProductProfileDialog
        vaccine={toVaccineForDialog(selectedVaccine)}
        onClose={() => setSelectedVaccine(null)}
        loading={loadingProductProfiles}
      />
    </div>
  );
}
