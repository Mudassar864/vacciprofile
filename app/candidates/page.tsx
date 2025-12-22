import { CandidatesClient } from './candidates-client';

export const dynamic = 'force-dynamic';

interface Candidate {
  _id: string;
  pathogenName: string;
  name: string;
  manufacturer: string;
  platform: string;
  clinicalPhase: string;
  companyUrl: string;
  other: string;
  lastUpdated: string;
}

async function fetchCandidates() {
  const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
  
  try {
    console.log('Fetching candidates from:', `${API_BASE}/api/manufacturer-candidates`);
    const response = await fetch(
      `${API_BASE}/api/manufacturer-candidates`,
      { cache: 'no-store' } // Disable caching
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, response.statusText, errorText);
      console.warn('Failed to fetch manufacturer candidates. Returning empty array.');
      return {
        candidates: [],
        pathogens: [],
      };
    }
    
    const result = await response.json();
    console.log('API Response:', { success: result.success, count: result.count, hasCandidates: !!result.candidates });
    
    // Backend returns { success: true, count: number, candidates: [...] }
    const data = result.candidates || result.data || [];
    console.log('Candidates count:', data.length);
    
    if (data && Array.isArray(data)) {
      // Transform backend data to match frontend interface
      const transformed = data.map((c: any) => ({
        _id: c.id || c._id,
        pathogenName: c.pathogenName || '',
        name: c.name || '',
        manufacturer: c.manufacturer || '',
        platform: c.platform || '',
        clinicalPhase: c.clinicalPhase || '',
        companyUrl: c.companyUrl || '',
        other: c.other || '',
        lastUpdated: c.updatedAt || c.lastUpdated || '',
      }));
      
      const uniquePathogens = Array.from(
        new Set(transformed.map((v: Candidate) => v.pathogenName).filter(Boolean))
      ).sort();
      
      console.log('Transformed candidates:', transformed.length, 'pathogens:', uniquePathogens.length);
      return {
        candidates: transformed,
        pathogens: uniquePathogens,
      };
    }
    
    console.warn('No candidates data found');
    return {
      candidates: [],
      pathogens: [],
    };
  } catch (err: any) {
    console.error('Error fetching candidates:', err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return {
      candidates: [],
      pathogens: [],
    };
  }
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: { pathogen?: string };
}) {
  const { candidates, pathogens } = await fetchCandidates();
  
  let initialSelectedPathogen: string = pathogens[0] || "";
  if (searchParams.pathogen) {
    const decodedPathogen = decodeURIComponent(searchParams.pathogen);
    if (pathogens.includes(decodedPathogen)) {
      initialSelectedPathogen = decodedPathogen;
    }
  }

  return (
    <CandidatesClient
      initialCandidates={candidates}
      initialPathogens={pathogens}
      initialSelectedPathogen={initialSelectedPathogen}
    />
  );
}
