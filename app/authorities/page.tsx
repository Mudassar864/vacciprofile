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
      console.warn('Failed to fetch licensers. Returning empty array.');
    }
    const licensersResult = licensersResponse.ok ? await licensersResponse.json() : { licensers: [] };
    // Backend returns { success: true, count: number, licensers: [...] }
    const licensersData = licensersResult.licensers || licensersResult.data || [];
    // Transform API response to match frontend interface
    // API returns { id, acronym, region, country, fullName, description, website }
    // Frontend expects { licenserId, acronym, region, country, fullName, description, website }
    const licensersList: Licenser[] = Array.isArray(licensersData) 
      ? licensersData.map((l: any) => ({
          licenserId: parseInt(l.id?.replace(/[^0-9]/g, '') || '0', 10) || 0, // Convert id to number
          acronym: l.acronym || '',
          region: l.region || '',
          country: l.country || null,
          fullName: l.fullName || '',
          description: l.description || '',
          website: l.website || '',
        }))
      : [];
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
        // The licensing date 'name' field contains the licenser name/acronym
        // We need to match it with licenser acronym or fullName
        const licenserName = ld.name || '';
        if (!licenserName) return;
        
        // Try to find matching licenser by acronym or fullName
        // Use the licenser name from licensing date as key, or match to acronym if found
        let matchingLicenserAcronym = licenserName;
        if (licensersList.length > 0) {
          const matchingLicenser = licensersList.find(
            (l: Licenser) => 
              l.acronym?.toLowerCase() === licenserName.toLowerCase() ||
              l.fullName?.toLowerCase() === licenserName.toLowerCase() ||
              l.acronym?.toLowerCase().includes(licenserName.toLowerCase()) ||
              licenserName.toLowerCase().includes(l.acronym?.toLowerCase() || '')
          );
          if (matchingLicenser) {
            matchingLicenserAcronym = matchingLicenser.acronym;
          }
        }
        
        if (!vaccinesMap[matchingLicenserAcronym]) {
          vaccinesMap[matchingLicenserAcronym] = [];
        }
        
        // Check if this vaccine is already added for this licenser
        const exists = vaccinesMap[matchingLicenserAcronym].some(
          (v: Vaccine) => v.vaccineBrandName === vaccine.name
        );
        
        if (!exists) {
          // Parse pathogenNames and manufacturerNames (they are comma-separated strings)
          const pathogenNamesStr = vaccine.pathogenNames || '';
          const manufacturerNamesStr = vaccine.manufacturerNames || '';
          
          const pathogens = typeof pathogenNamesStr === 'string'
            ? pathogenNamesStr.split(',').map(p => p.trim()).filter(Boolean)
            : Array.isArray(pathogenNamesStr)
            ? pathogenNamesStr
            : [];
          
          const manufacturers = typeof manufacturerNamesStr === 'string'
            ? manufacturerNamesStr.split(',').map(m => m.trim()).filter(Boolean)
            : Array.isArray(manufacturerNamesStr)
            ? manufacturerNamesStr
            : [];
          
          vaccinesMap[matchingLicenserAcronym].push({
            vaccineId: parseInt(String(vaccine.id || '0').replace(/[^0-9]/g, '') || '0', 10) || 0,
            vaccineBrandName: vaccine.name || 'Unknown Vaccine',
            vaccineType: (vaccine.vaccineType || 'single')
              .toString()
              .toLowerCase()
              .includes('combination')
              ? 'combination'
              : 'single',
            pathogens: pathogens,
            manufacturers: manufacturers
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
