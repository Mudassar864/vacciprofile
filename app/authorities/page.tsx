import { AuthoritiesClient, Licenser, Vaccine } from './authorities-client';

const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';

async function fetchAuthoritiesData() {
  try {
    // Fetch licensers
    const licensersResponse = await fetch(
      `${API_BASE}/licensers`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );
    if (!licensersResponse.ok) {
      throw new Error(`HTTP error! status: ${licensersResponse.status}`);
    }
    const licensersData = await licensersResponse.json();
    const licensersList: Licenser[] = licensersData.data || licensersData || [];

    // Fetch vaccines grouped by licenser
    const vaccinesResponse = await fetch(
      `${API_BASE}/vaccines/by-licenser`,
      { next: { revalidate: 3600 } }
    );
    if (!vaccinesResponse.ok) {
      throw new Error(`HTTP error! status: ${vaccinesResponse.status}`);
    }
    const vaccinesData = await vaccinesResponse.json();
    const vaccinesByLicenserData: any[] = vaccinesData.data || [];

    // Create a map of licenser acronym to vaccines
    const vaccinesMap: { [key: string]: Vaccine[] } = {};
    vaccinesByLicenserData.forEach((item, idx) => {
      const licenserKey =
        item.licenserName ||
        item.licenser?.acronym ||
        item.licenser?.fullName ||
        `Licenser-${idx + 1}`;

      const vaccines = (item.vaccines || []).map((v: any, vIdx: number) => ({
        vaccineId: v.vaccineId ?? v.id ?? vIdx,
        vaccineBrandName: v.name || v.vaccineBrandName || 'Unknown Vaccine',
        vaccineType: (v.type || v.vaccineType || 'single')
          .toString()
          .toLowerCase()
          .includes('combination')
          ? 'combination'
          : 'single',
        pathogens: Array.isArray(v.pathogens)
          ? v.pathogens.map((p: any) => p?.name || p)?.filter(Boolean)
          : [],
        manufacturers: Array.isArray(v.manufacturers)
          ? v.manufacturers.map((m: any) => m?.name || m)?.filter(Boolean)
          : []
      }));

      vaccinesMap[licenserKey] = vaccines;
      if (item.licenser?.acronym && item.licenser?.acronym !== licenserKey) {
        vaccinesMap[item.licenser.acronym] = vaccines;
      }
    });

    return {
      licensers: licensersList,
      vaccinesByLicenser: vaccinesMap,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      licensers: [],
      vaccinesByLicenser: {},
    };
  }
}

export default async function AuthoritiesPage({
  searchParams,
}: {
  searchParams: { licenser?: string };
}) {
  const { licensers, vaccinesByLicenser } = await fetchAuthoritiesData();
  
  const initialSelectedLicenserId = 
    searchParams.licenser 
      ? parseInt(searchParams.licenser, 10) || undefined
      : undefined;

  return (
    <AuthoritiesClient
      initialLicensers={licensers}
      initialVaccinesByLicenser={vaccinesByLicenser}
      initialSelectedLicenserId={initialSelectedLicenserId}
    />
  );
}
