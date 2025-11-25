'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Vaccine {
  licensed_vaccine_id: number;
  pathogen_name: string;
  vaccine_brand_name: string;
  single_or_combination: string;
  authority_name: string;
  vaccine_link: string;
  authority_link: string;
  manufacturer: string;
}

export default function VaccinesPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('licensed_vaccines')
      .select('*')
      .order('pathogen_name');

    if (!error && data) {
      setVaccines(data as Vaccine[]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">All Licensed Vaccines</h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading data...</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="p-3 text-left font-semibold text-sm text-gray-700">Pathogen</th>
                <th className="p-3 text-left font-semibold text-sm text-gray-700">Vaccine Brand</th>
                <th className="p-3 text-left font-semibold text-sm text-gray-700">Type</th>
                <th className="p-3 text-left font-semibold text-sm text-gray-700">Manufacturer</th>
                <th className="p-3 text-left font-semibold text-sm text-gray-700">Licensing Authority</th>
              </tr>
            </thead>

            <tbody>
              {vaccines.length > 0 ? (
                vaccines.map(vaccine => (
                  <tr
                    key={vaccine.licensed_vaccine_id}
                    className="border-b border-gray-200 hover:bg-orange-50 transition-colors"
                  >
                    <td className="p-3">{vaccine.pathogen_name}</td>

                    <td className="p-3">
                      {vaccine.vaccine_link ? (
                        <a
                          href={vaccine.vaccine_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {vaccine.vaccine_brand_name}
                        </a>
                      ) : (
                        vaccine.vaccine_brand_name
                      )}
                    </td>

                    <td className="p-3 text-gray-700">
                      {vaccine.single_or_combination || 'Single Pathogen Vaccine'}
                    </td>

                    <td className="p-3 text-gray-700">
                      {vaccine.manufacturer || 'Unknown'}
                    </td>

                    <td className="p-3">
                      {vaccine.authority_link ? (
                        <a
                          href={vaccine.authority_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {vaccine.authority_name}
                        </a>
                      ) : (
                        <span className="text-gray-700">{vaccine.authority_name || '-'}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No vaccine data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
