import { AuthoritiesClient } from './authorities-client';
import { fetchFromAPI } from '@/lib/cache';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const LICENSER_ACRONYMS = ['EMA', 'FDA', 'WHO'] as const;

async function fetchLicensers() {
  try {
    const r = await fetchFromAPI(`${API_BASE}/api/licensers`);
    const j = r.ok ? await r.json() : { licensers: [] };
    return j.licensers || j.data || [];
  } catch (e) {
    console.error('Error fetching licensers:', e);
    return [];
  }
}

function deriveCountries(licensers: { acronym?: string; country?: string }[]): string[] {
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

/** Allowed licensingDates[].name values: FDA, EMA, WHO + countries from licensers. */
function allowedAuthorityNames(licensers: { acronym?: string; country?: string }[]): Set<string> {
  const lower = new Set<string>();
  for (const a of LICENSER_ACRONYMS) lower.add(a.toLowerCase());
  for (const c of deriveCountries(licensers)) lower.add(c.trim().toLowerCase());
  return lower;
}

function filterVaccinesByAuthority(
  vaccines: { licensingDates?: Array<{ name?: string }> }[],
  allowedLower: Set<string>
): unknown[] {
  return vaccines.filter((v) => {
    const ld = Array.isArray(v.licensingDates) ? v.licensingDates : [];
    return ld.some((l) => {
      const n = (l.name || '').trim().toLowerCase();
      return n && allowedLower.has(n);
    });
  });
}

async function fetchVaccines(licensers: { acronym?: string; country?: string }[]): Promise<unknown[]> {
  try {
    const r = await fetchFromAPI(`${API_BASE}/api/vaccines/populated`);
    if (!r.ok) return [];
    const j = await r.json();
    const list = j.vaccines || j.data || [];
    if (!Array.isArray(list)) return [];
    const allowed = allowedAuthorityNames(licensers);
    return filterVaccinesByAuthority(list as { licensingDates?: Array<{ name?: string }> }[], allowed);
  } catch (e) {
    console.error('Error fetching vaccines:', e);
    return [];
  }
}

export default async function AuthoritiesPage() {
  const licensers = await fetchLicensers();
  const vaccines = await fetchVaccines(licensers);
  return (
    <AuthoritiesClient
      initialLicensers={licensers}
      initialVaccines={vaccines}
    />
  );
}
