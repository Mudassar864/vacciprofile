import { CandidatesClient } from './candidates-client';

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
    const response = await fetch(
      `${API_BASE}/candidate-vaccines`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data)) {
      const uniquePathogens = Array.from(
        new Set(data.map((v: Candidate) => v.pathogenName))
      ).sort();
      
      return {
        candidates: data,
        pathogens: uniquePathogens,
      };
    }
    
    return {
      candidates: [],
      pathogens: [],
    };
  } catch (err: any) {
    console.error('Error fetching data:', err);
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
  
  const initialSelectedPathogen = 
    searchParams.pathogen && pathogens.includes(decodeURIComponent(searchParams.pathogen))
      ? decodeURIComponent(searchParams.pathogen)
      : pathogens[0] || "";

  return (
    <CandidatesClient
      initialCandidates={candidates}
      initialPathogens={pathogens}
      initialSelectedPathogen={initialSelectedPathogen}
    />
  );
}
