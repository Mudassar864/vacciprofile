import { VaccinesClient } from './vaccines-client';
import { Suspense } from 'react';
import { fetchFromAPI } from '@/lib/cache';

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
  lastUpdated?: string;
  productProfiles?: ProductProfile[];
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

async function fetchPathogensData() {
  const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
  
  try {
    console.log('Fetching pathogens from:', `${API_BASE}/api/pathogens/populated`);
    const response = await fetchFromAPI(`${API_BASE}/api/pathogens/populated`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, response.statusText, errorText);
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log('API Response:', { success: result.success, count: result.count, hasPathogens: !!result.pathogens });

    // Backend returns { success: true, count: number, pathogens: [...] }
    const data = result.pathogens || result.data || [];
    
    if (!Array.isArray(data)) {
      console.error('Invalid data format:', typeof data, data);
      throw new Error("Invalid data format received from API");
    }
    
    console.log('Pathogens count:', data.length);

    const transformedPathogens: PathogenData[] = [];
    const transformedVaccines: Vaccine[] = [];
    const pathogenNames: string[] = [];

    data.forEach((pathogen: any) => {
      const pathogenName = pathogen.name;
      if (pathogenName) {
        pathogenNames.push(pathogenName);
      }

      transformedPathogens.push({
        pathogenId: pathogen.id || pathogen.pathogenId,
        name: pathogen.name,
        description: pathogen.description,
        image: pathogen.image,
        bulletpoints: pathogen.bulletpoints,
        link: pathogen.link,
        updatedAt: pathogen.updatedAt || '',
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
        const seenAuthorities = new Set<string>();

        licensingDates.forEach((licensing: any) => {
          if (licensing.name && !seenAuthorities.has(licensing.name)) {
            seenAuthorities.add(licensing.name);
            authorityNames.push(licensing.name);
            authorityLinks.push(licensing.source || "");
          }
        });

        transformedVaccines.push({
          licensed_vaccine_id: vaccine.id || `${pathogen.id || pathogen.pathogenId}-${vIndex}`,
          pathogen_name: pathogenName,
          vaccine_brand_name: vaccine.name,
          single_or_combination: vaccine.vaccineType === "single" ? "Single Pathogen Vaccine" : "Combination Vaccine",
          authority_names: authorityNames,
          authority_links: authorityLinks,
          vaccine_link: vaccine.vaccineLink || vaccine.link,
          manufacturer: vaccine.manufacturerNames 
            ? (Array.isArray(vaccine.manufacturerNames) 
                ? vaccine.manufacturerNames.join(', ') 
                : typeof vaccine.manufacturerNames === 'string'
                ? vaccine.manufacturerNames
                : '')
            : vaccine.manufacturer || '',
          lastUpdated: vaccine.lastUpdated || vaccine.updatedAt || licensingDates[0]?.lastUpdateOnVaccine || '',
          productProfiles: [], // Don't load product profiles initially - will be fetched on demand
        });
      });
    });

    transformedVaccines.sort((a, b) => {
      const aPathogen = a.pathogen_name || "";
      const bPathogen = b.pathogen_name || "";
      const aVaccine = a.vaccine_brand_name || "";
      const bVaccine = b.vaccine_brand_name || "";
      
      if (aPathogen === bPathogen) {
        return aVaccine.localeCompare(bVaccine);
      }
      return aPathogen.localeCompare(bPathogen);
    });

    const uniquePathogenNames = Array.from(new Set(pathogenNames)).sort(
      (a, b) => a.localeCompare(b)
    );

    console.log('Transformed data:', {
      vaccinesCount: transformedVaccines.length,
      pathogensCount: transformedPathogens.length,
      pathogenNamesCount: uniquePathogenNames.length
    });

    return {
      vaccines: transformedVaccines,
      pathogensData: transformedPathogens,
      pathogens: uniquePathogenNames,
    };
  } catch (err) {
    console.error("Error fetching pathogens:", err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return {
      vaccines: [],
      pathogensData: [],
      pathogens: [],
    };
  }
}

export default async function VaccinesPage({
  searchParams,
}: {
  searchParams: { pathogen?: string };
}) {
  const { vaccines, pathogensData, pathogens } = await fetchPathogensData();
  
  let initialSelectedPathogen: string = pathogens[0] || "";
  if (searchParams.pathogen) {
    const decodedPathogen = decodeURIComponent(searchParams.pathogen);
    if (pathogens.includes(decodedPathogen)) {
      initialSelectedPathogen = decodedPathogen;
    }
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d17728] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vaccines...</p>
        </div>
      </div>
    }>
      <VaccinesClient
        initialVaccines={vaccines}
        initialPathogensData={pathogensData}
        initialPathogens={pathogens}
        initialSelectedPathogen={initialSelectedPathogen}
      />
    </Suspense>
  );
}
