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

  return new NextResponse(
    JSON.stringify({ success: true, data: vaccines }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}