import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

export const revalidate = 0;

async function getManufacturer(id: string) {
  const { data: manufacturer, error } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('manufacturer_id', id)
    .maybeSingle();

  if (error || !manufacturer) {
    return null;
  }

  const manufacturerName = (manufacturer as any).name;

  const { data: licensedVaccines } = await supabase
    .from('licensed_vaccines')
    .select('*')
    .eq('manufacturer', manufacturerName);

  const { data: vaccineCandidates } = await supabase
    .from('vaccine_candidates')
    .select('*')
    .eq('manufacturer', manufacturerName);

  return {
    ...(manufacturer as any),
    licensed_vaccines: licensedVaccines || [],
    vaccine_candidates: vaccineCandidates || []
  };
}

export default async function ManufacturerDetailPage({ params }: { params: { id: string } }) {
  const manufacturer = await getManufacturer(params.id);

  if (!manufacturer) {
    notFound();
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/manufacturers" className="text-white/90 hover:text-white text-sm mb-2 inline-block">
                &larr; Back to Manufacturers
              </Link>
              <h1 className="text-3xl font-bold">{manufacturer.name}</h1>
              {manufacturer.headquarters && (
                <p className="text-white/90 mt-1">Last Updated: {currentDate}</p>
              )}
            </div>
            <p className="text-white/90">VacciProfile Last updated: {currentDate}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle>Manufacturer Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  {manufacturer.website && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Website</p>
                      <a
                        href={manufacturer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        {manufacturer.name}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                  {manufacturer.founded && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Founded</p>
                      <p className="font-semibold text-gray-900">{manufacturer.founded}</p>
                    </div>
                  )}
                  {manufacturer.headquarters && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Headquarters</p>
                      <p className="font-semibold text-gray-900">{manufacturer.headquarters}</p>
                    </div>
                  )}
                  {manufacturer.ceo && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">CEO</p>
                      <p className="font-semibold text-gray-900">{manufacturer.ceo}</p>
                    </div>
                  )}
                  {manufacturer.revenue_operating_income_net_income && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Revenue/Operating Income/Net Income</p>
                      <p className="font-semibold text-gray-900">{manufacturer.revenue_operating_income_net_income}</p>
                    </div>
                  )}
                  {manufacturer.total_assets_total_equity && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Assets/Total Equity</p>
                      <p className="font-semibold text-gray-900">{manufacturer.total_assets_total_equity}</p>
                    </div>
                  )}
                  {manufacturer.num_employees && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Number Of Employees</p>
                      <p className="font-semibold text-gray-900">{manufacturer.num_employees.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {manufacturer.history && (
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle>Brief history about {manufacturer.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{manufacturer.history}</p>
                </CardContent>
              </Card>
            )}

            {manufacturer.licensed_vaccines && manufacturer.licensed_vaccines.length > 0 && (
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle>Licensed Vaccines</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vaccine Brand Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pathogen</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Authority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manufacturer.licensed_vaccines.map((vaccine: any) => (
                          <tr key={vaccine.licensed_vaccine_id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <span className="font-medium text-gray-900">{vaccine.vaccine_brand_name}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-700 text-sm">
                              {vaccine.single_or_combination || 'Single'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[#d17728] font-medium">{vaccine.pathogen_name}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-700 text-sm">
                              {vaccine.authority_name || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {manufacturer.vaccine_candidates && manufacturer.vaccine_candidates.length > 0 && (
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle>Vaccine Candidates</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vaccine Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pathogen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manufacturer.vaccine_candidates.map((candidate: any) => (
                          <tr key={candidate.candidate_id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <span className="font-medium text-gray-900">{candidate.vaccine_name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[#d17728] font-medium">{candidate.pathogen_name}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/vaccines"
                  className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-center text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  All Licensed Vaccines
                </Link>
                <Link
                  href="/candidates"
                  className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-center text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Vaccine Candidates
                </Link>
                <Link
                  href="/manufacturers"
                  className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-center text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  All Manufacturers
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
