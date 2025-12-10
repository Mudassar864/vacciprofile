import { ManufacturersClient, Manufacturer } from './manufacturers-client';

async function fetchManufacturers(): Promise<Manufacturer[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
  
  try {
    const response = await fetch(
      `${API_BASE}/manufacturers`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data)) {
      // Sort manufacturers alphabetically by name
      return data.sort((a: Manufacturer, b: Manufacturer) => a.name.localeCompare(b.name));
    }
    
    return [];
  } catch (err: any) {
    console.error('Error fetching data:', err);
    return [];
  }
}

export default async function ManufacturersPage({
  searchParams,
}: {
  searchParams: { manufacturer?: string };
}) {
  const manufacturers = await fetchManufacturers();
  
  const initialSelectedManufacturerId = 
    searchParams.manufacturer && manufacturers.find(m => m._id === searchParams.manufacturer)
      ? searchParams.manufacturer
      : undefined;

  return (
    <ManufacturersClient
      initialManufacturers={manufacturers}
      initialSelectedManufacturerId={initialSelectedManufacturerId}
    />
  );
}
