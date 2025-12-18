import { NITAGsClient, NITAG } from './nitags-client';

export const dynamic = 'force-dynamic';

async function fetchNITAGs(): Promise<NITAG[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
  
  try {
    console.log('Fetching NITAGs from:', `${API_BASE}/api/nitags`);
    const response = await fetch(
      `${API_BASE}/api/nitags`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, response.statusText, errorText);
      // Note: This endpoint requires authentication
      console.warn('NITAGs endpoint requires authentication. Returning empty array.');
      return [];
    }
    
    const result = await response.json();
    console.log('API Response:', { success: result.success, count: result.count, hasNitags: !!result.nitags });
    
    // Backend returns { success: true, count: number, nitags: [...] }
    const data = result.nitags || result.data || [];
    console.log('NITAGs count:', data.length);
    
    if (data && Array.isArray(data)) {
      const transformed = data.map((item: any) => ({
        country: item.country || '',
        availableNitag: item.availableNitag || 'No',
        availableWebsite: item.availableWebsite || '',
        websiteUrl: item.websiteUrl || '',
        nationalNitagName: item.nationalNitagName || '',
        yearEstablished: item.yearEstablished || null,
      }));
      console.log('Transformed NITAGs count:', transformed.length);
      return transformed;
    }
    
    console.warn('No NITAGs data found');
    return [];
  } catch (err: any) {
    console.error('Error fetching NITAGs:', err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return [];
  }
}

export default async function NITAGsPage({
  searchParams,
}: {
  searchParams: { country?: string };
}) {
  const nitags = await fetchNITAGs();
  
  let initialSelectedCountry: string | undefined = undefined;
  if (searchParams.country) {
    const decodedCountry = decodeURIComponent(searchParams.country);
    if (nitags.find(n => n.country === decodedCountry)) {
      initialSelectedCountry = decodedCountry;
    }
  }

  return (
    <NITAGsClient
      initialNitags={nitags}
      initialSelectedCountry={initialSelectedCountry}
    />
  );
}

