import { VaccinesClient } from './vaccines-client';

export const dynamic = 'force-dynamic';

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

async function fetchPathogensData() {
  const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
  
  try {
    const response = await fetch(
      `${API_BASE}/pathogens?populate=true`,
      { next: { revalidate: 3600 } } // Revalidate every hour
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
      const pathogenName = pathogen.name;
      if (pathogenName) {
        pathogenNames.push(pathogenName);
      }

      transformedPathogens.push({
        pathogenId: pathogen.pathogenId,
        name: pathogen.name,
        description: pathogen.description,
        image: pathogen.image,
        bulletpoints: pathogen.bulletpoints,
        link: pathogen.link,
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
            authorityNames.push(licensing.name);
          }
          if (licensing.source) {
            authorityLinks.push(licensing.source);
          }
        });

        transformedVaccines.push({
          licensed_vaccine_id: `${pathogen.pathogenId}-${vIndex}`,
          pathogen_name: pathogenName,
          vaccine_brand_name: vaccine.name,
          single_or_combination: vaccine.vaccineType === "single" ? "Single Pathogen Vaccine" : "Combination Vaccine",
          authority_names: authorityNames,
          authority_links: authorityLinks,
          vaccine_link: vaccine.vaccineLink,
          manufacturer: vaccine.manufacturer,
          productProfiles: vaccine.productProfiles,
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

    return {
      vaccines: transformedVaccines,
      pathogensData: transformedPathogens,
      pathogens: uniquePathogenNames,
    };
  } catch (err) {
    console.error("Error fetching pathogens:", err);
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
    <VaccinesClient
      initialVaccines={vaccines}
      initialPathogensData={pathogensData}
      initialPathogens={pathogens}
      initialSelectedPathogen={initialSelectedPathogen}
    />
  );
}
