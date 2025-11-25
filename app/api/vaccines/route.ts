import { NextResponse } from 'next/server';

export async function GET() {
  const vaccines = [
    {
      id: 1,
      name: "Pfizer-BioNTech",
      pathogen: "COVID-19",
      manufacturer: "Pfizer",
    },
    {
      id: 2,
      name: "Moderna",
      pathogen: "COVID-19",
      manufacturer: "Moderna",
    },
  ];

  return NextResponse.json(
    { success: true, data: vaccines },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}