import { NITAGsClient, NITAG } from './nitags-client';

async function fetchNITAGs(): Promise<NITAG[]> {
  try {
    const response = await fetch(
      `https://vacciprofile-backend.vercel.app/api/nitags`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.nitags && Array.isArray(data.nitags)) {
      return data.nitags.map((item: any) => ({
        country: item.country || '',
        availableNitag: item.availableNitag || 'No',
        availableWebsite: item.availableWebsite || '',
        websiteUrl: item.websiteUrl || '',
        nationalNitagName: item.nationalNitagName || '',
        yearEstablished: item.yearEstablished || null,
      }));
    }
    
    return [];
  } catch (err: any) {
    console.error('Error fetching NITAGs:', err);
    return [];
  }
}

export default async function NITAGsPage({
  searchParams,
}: {
  searchParams: { country?: string };
}) {
  const nitags = await fetchNITAGs();
  
  const initialSelectedCountry = 
    searchParams.country && nitags.find(n => n.country === decodeURIComponent(searchParams.country))
      ? decodeURIComponent(searchParams.country)
      : undefined;

  return (
    <NITAGsClient
      initialNitags={nitags}
      initialSelectedCountry={initialSelectedCountry}
    />
  );
}

