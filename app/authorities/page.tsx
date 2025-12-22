import { AuthoritiesClient, Licenser, Vaccine } from './authorities-client';

export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';

async function fetchAuthoritiesData() {
  try {
    // Fetch licensers
    console.log('Fetching licensers from:', `${API_BASE}/api/licensers`);
    const licensersResponse = await fetch(
      `${API_BASE}/api/licensers`,
      { cache: 'no-store' } // Disable caching
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
      { cache: 'no-store' } // Disable caching
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
        // Improved matching for EMA, FDA, WHO - exact case-insensitive match first
        let matchingLicenserAcronym = licenserName.trim();
        const licenserNameUpper = licenserName.trim().toUpperCase();
        const licenserNameLower = licenserName.trim().toLowerCase();
        
        if (licensersList.length > 0) {
          // First try exact case-insensitive match (important for EMA, FDA, WHO)
          let matchingLicenser = licensersList.find(
            (l: Licenser) => {
              const acronymUpper = (l.acronym || '').trim().toUpperCase();
              const fullNameUpper = (l.fullName || '').trim().toUpperCase();
              return acronymUpper === licenserNameUpper || fullNameUpper === licenserNameUpper;
            }
          );
          
          // If no exact match, try partial matches
          if (!matchingLicenser) {
            matchingLicenser = licensersList.find(
              (l: Licenser) => {
                const acronym = (l.acronym || '').trim().toLowerCase();
                const fullName = (l.fullName || '').trim().toLowerCase();
                const searchName = licenserName.trim().toLowerCase();
                return acronym === searchName ||
                       fullName === searchName ||
                       acronym.includes(searchName) ||
                       searchName.includes(acronym);
              }
            );
          }
          
          // If still no match, check if licenserName matches a country name
          // This handles cases like name="Austria" matching licensers with country="Austria"
          if (!matchingLicenser) {
            const countryLicensers = licensersList.filter(
              (l: Licenser) => {
                const country = (l.country || '').trim().toLowerCase();
                return country === licenserNameLower;
              }
            );
            
            // If we found licensers in this country, use the first one
            // We'll add the vaccine to all country licensers later
            if (countryLicensers.length > 0) {
              matchingLicenser = countryLicensers[0];
            }
          }
          
          if (matchingLicenser) {
            matchingLicenserAcronym = matchingLicenser.acronym;
          } else {
            // If no matching licenser found, use the licenser name as-is
            // This ensures EMA, FDA, etc. show up even if not in licensers list
            matchingLicenserAcronym = licenserName.trim();
          }
        }
        
        // Helper function to add vaccine to a licenser's list
        const addVaccineToLicenser = (licenserKey: string) => {
          if (!vaccinesMap[licenserKey]) {
            vaccinesMap[licenserKey] = [];
          }
          
          // Check if this vaccine is already added for this licenser
          const exists = vaccinesMap[licenserKey].some(
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
            
            vaccinesMap[licenserKey].push({
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
        };
        
        // Add vaccine to the matched licenser (based on licensing name)
        addVaccineToLicenser(matchingLicenserAcronym);
        
        // Additionally, if licensing date name matches a country name,
        // also add vaccine to ALL licensers in that country
        // This handles cases like name="Austria" - add to all Austrian licensers
        const countryLicensersByName = licensersList.filter(
          (l: Licenser) => {
            const country = (l.country || '').trim().toLowerCase();
            return country === licenserNameLower;
          }
        );
        
        // Add vaccine to all licensers in the matching country
        countryLicensersByName.forEach((licenser: Licenser) => {
          if (licenser.acronym && licenser.acronym !== matchingLicenserAcronym) {
            addVaccineToLicenser(licenser.acronym);
          }
        });
        
        // Additionally, if licensing date type matches a country name, 
        // also add vaccine to all licensers in that country
        // This allows vaccines with type="Austria" to show up under Austria
        const licensingType = ld.type || '';
        if (licensingType && licensingType !== 'N/A' && licensingType.trim() !== '') {
          const typeCountry = licensingType.trim();
          
          // Find all licensers in this country (case-insensitive match)
          const countryLicensersByType = licensersList.filter(
            (l: Licenser) => {
              const country = (l.country || '').trim().toLowerCase();
              return country === typeCountry.toLowerCase();
            }
          );
          
          // Add vaccine to all licensers in the matching country
          countryLicensersByType.forEach((licenser: Licenser) => {
            if (licenser.acronym) {
              addVaccineToLicenser(licenser.acronym);
            }
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
  searchParams: { licenser?: string; country?: string };
}) {
  const { licensers, vaccinesByLicenser } = await fetchAuthoritiesData();
  
  // Use licenser name (acronym) or country name from URL
  const initialSelectedLicenserName = searchParams.licenser 
    ? decodeURIComponent(searchParams.licenser)
    : undefined;
  const initialSelectedCountry = searchParams.country
    ? decodeURIComponent(searchParams.country)
    : undefined;

  return (
    <AuthoritiesClient
      initialLicensers={licensers}
      initialVaccinesByLicenser={vaccinesByLicenser}
      initialSelectedLicenserName={initialSelectedLicenserName}
      initialSelectedCountry={initialSelectedCountry}
    />
  );
}
