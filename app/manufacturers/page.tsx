import { ManufacturersClient, Manufacturer } from './manufacturers-client';
import { fetchFromAPI } from '@/lib/cache';

async function fetchManufacturers(): Promise<Manufacturer[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL|| 'http://localhost:5000';
  
  try {
    console.log('Fetching manufacturers from:', `${API_BASE}/api/manufacturers/populated`);
    const response = await fetchFromAPI(`${API_BASE}/api/manufacturers/populated`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, response.statusText, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API Response:', { success: result.success, count: result.count, hasManufacturers: !!result.manufacturers });
    
    // Backend returns { success: true, count: number, manufacturers: [...] }
    const data = result.manufacturers || result.data || [];
    console.log('Manufacturers count:', data.length);
    
    if (data && Array.isArray(data)) {
      // Transform backend data to match frontend interface
      const transformed = data.map((m: any) => ({
        _id: m.id || m._id,
        manufacturerId: m.manufacturerId || 0,
        name: m.name,
        description: m.description,
        history: m.history,
        details: {
          website: m.details_website,
          founded: m.details_founded,
          headquarters: m.details_headquarters,
          ceo: m.details_ceo,
          revenue: m.details_revenue,
          operatingIncome: m.details_operatingIncome,
          netIncome: m.details_netIncome,
          totalAssets: m.details_totalAssets,
          totalEquity: m.details_totalEquity,
          numberOfEmployees: m.details_numberOfEmployees,
        },
        licensedVaccines: (m.vaccines || []).map((v: any) => ({
          _id: v.id || v._id,
          vaccineId: v.vaccineId || 0,
          name: v.name,
          pathogenId: Array.isArray(v.pathogenNames) ? v.pathogenNames.map(() => 0) : [],
          vaccineType: v.vaccineType,
          licensingDates: (v.licensingDates || []).map((ld: any) => ({
            name: ld.name,
            type: ld.type,
            approvalDate: ld.approvalDate,
            source: ld.source,
            lastUpdated: ld.lastUpdateOnVaccine || ld.lastUpdated,
          })),
        })),
        candidateVaccines: (m.candidates || []).map((c: any) => ({
          _id: c.id || c._id,
          pathogenName: c.pathogenName,
          name: c.name,
          manufacturer: c.manufacturer,
          platform: c.platform,
          clinicalPhase: c.clinicalPhase,
          companyUrl: c.companyUrl,
          other: c.other,
          lastUpdated: c.updatedAt || c.lastUpdated,
        })),
        lastUpdated: m.updatedAt || m.lastUpdated,
      }));
      
      // Sort manufacturers alphabetically by name
      const sorted = transformed.sort((a: Manufacturer, b: Manufacturer) => a.name.localeCompare(b.name));
      console.log('Transformed manufacturers count:', sorted.length);
      return sorted;
    }
    
    console.warn('No manufacturers data found');
    return [];
  } catch (err: any) {
    console.error('Error fetching manufacturers:', err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return [];
  }
}

export default async function ManufacturersPage({
  searchParams,
}: {
  searchParams: { manufacturer?: string };
}) {
  const manufacturers = await fetchManufacturers();
  
  let initialSelectedManufacturerName: string | undefined = undefined;
  if (searchParams.manufacturer) {
    const decodedName = decodeURIComponent(searchParams.manufacturer);
    const found = manufacturers.find(m => m.name === decodedName);
    if (found) {
      initialSelectedManufacturerName = decodedName;
    }
  }

  return (
    <ManufacturersClient
      initialManufacturers={manufacturers}
      initialSelectedManufacturerName={initialSelectedManufacturerName}
    />
  );
}
