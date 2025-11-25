'use client';

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

// 👉 Replace this static array with your real data
const STATIC_VACCINES: Vaccine[] = [
  {
    licensed_vaccine_id: 1,
    pathogen_name: "Hepatitis A",
    vaccine_brand_name: "Havrix",
    single_or_combination: "Single Pathogen",
    authority_name: "FDA",
    vaccine_link: "https://example.com",
    authority_link: "https://example.com/fda",
    manufacturer: "GSK"
  },
  {
    licensed_vaccine_id: 2,
    pathogen_name: "Influenza",
    vaccine_brand_name: "Fluzone",
    single_or_combination: "Single Pathogen",
    authority_name: "FDA",
    vaccine_link: "",
    authority_link: "",
    manufacturer: "Sanofi"
  },
  // Add all your static data here
];

export default function VaccinesPage() {
  const vaccines = STATIC_VACCINES;

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">All Licensed Vaccines (Static)</h1>

      <div className="bg-white rounded shadow overflow-x-auto">
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
              vaccines.map((vaccine) => (
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
                    {vaccine.single_or_combination}
                  </td>

                  <td className="p-3 text-gray-700">
                    {vaccine.manufacturer}
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
                      <span className="text-gray-700">{vaccine.authority_name}</span>
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
      </div>
    </div>
  );
}
