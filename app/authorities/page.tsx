import { AuthoritiesClient, Licenser, Vaccine } from './authorities-client';

export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';

async function fetchAuthoritiesData() {
  try {
    // Fetch licensers
    console.log('Fetching licensers from:', `${API_BASE}/api/licensers`);
    const licensersResponse = await fetch(
      `${API_BASE}/api/licensers`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );
    if (!licensersResponse.ok) {
      const errorText = await licensersResponse.text();
      console.error('Licensers API Error:', licensersResponse.status, licensersResponse.statusText, errorText);
      // Note: This endpoint requires authentication, so it might fail
      console.warn('Licensers endpoint requires authentication. Returning empty array.');
    }
    const licensersResult = licensersResponse.ok ? await licensersResponse.json() : { licensers: [] };
    // Backend returns { success: true, count: number, licensers: [...] }
    const licensersData = licensersResult.licensers || licensersResult.data || [];
    const licensersList: Licenser[] = Array.isArray(licensersData) ? licensersData : [];
    console.log('Licensers count:', licensersList.length);

    // Fetch vaccines with populated data and group by licenser
    console.log('Fetching vaccines from:', `${API_BASE}/api/vaccines/populated`);
    const vaccinesResponse = await fetch(
      `${API_BASE}/api/vaccines/populated`,
      { next: { revalidate: 3600 } }
    );
    if (!vaccinesResponse.ok) {
      const errorText = await vaccinesResponse.text();
      console.error('Vaccines API Error:', vaccinesResponse.status, vaccinesResponse.statusText, errorText);
      throw new Error(`HTTP error! status: ${vaccinesResponse.status}`);
    }
    const vaccinesResult = await vaccinesResponse.json();
    console.log('Vaccines API Response:', { success: vaccinesResult.success, count: vaccinesResult.count });
    // Backend returns { success: true, count: number, vaccines: [...] }
    const vaccinesData = vaccinesResult.vaccines || vaccinesResult.data || [];
    console.log('Vaccines count:', vaccinesData.length);

    // Create a map of licenser acronym to vaccines
    const vaccinesMap: { [key: string]: Vaccine[] } = {};
    
    // Group vaccines by licenser from licensing dates
    const vaccinesArray = Array.isArray(vaccinesData) ? vaccinesData : [];
    
    vaccinesArray.forEach((vaccine: any) => {
      const licensingDates = vaccine.licensingDates || [];
      
      licensingDates.forEach((ld: any) => {
        const licenserName = ld.name || '';
        if (!licenserName) return;
        
        if (!vaccinesMap[licenserName]) {
          vaccinesMap[licenserName] = [];
        }
        
        // Check if this vaccine is already added for this licenser
        const exists = vaccinesMap[licenserName].some(
          (v: Vaccine) => v.vaccineBrandName === vaccine.name
        );
        
        if (!exists) {
          vaccinesMap[licenserName].push({
            vaccineId: vaccine.id || 0,
            vaccineBrandName: vaccine.name || 'Unknown Vaccine',
            vaccineType: (vaccine.vaccineType || 'single')
              .toString()
              .toLowerCase()
              .includes('combination')
              ? 'combination'
              : 'single',
            pathogens: Array.isArray(vaccine.pathogenNames)
              ? vaccine.pathogenNames
              : typeof vaccine.pathogenNames === 'string'
              ? [vaccine.pathogenNames]
              : [],
            manufacturers: Array.isArray(vaccine.manufacturerNames)
              ? vaccine.manufacturerNames
              : typeof vaccine.manufacturerNames === 'string'
              ? [vaccine.manufacturerNames]
              : []
          });
        }
      });
    });

    console.log('Vaccines grouped by licenser:', Object.keys(vaccinesMap).length, 'licensers');
    return {
      licensers: licensersList,
      vaccinesByLicenser: vaccinesMap,
    };
  } catch (error) {
    console.error('Error fetching authorities data:', error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
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
