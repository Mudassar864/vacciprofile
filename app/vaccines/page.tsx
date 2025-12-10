import { VaccinesClient } from './vaccines-client';

export const dynamic = 'force-dynamic';

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
