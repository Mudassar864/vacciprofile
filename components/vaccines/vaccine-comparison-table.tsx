'use client';

import { Vaccine } from '@/lib/types';
import { ExternalLink } from 'lucide-react';
import { formatPathogenName } from '@/lib/pathogen-formatting';
import { formatAuthorityName } from '@/lib/authority-formatting';

interface VaccineComparisonTableProps {
  vaccines: Vaccine[];
}

export function VaccineComparisonTable({ vaccines }: VaccineComparisonTableProps) {
  if (vaccines.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
      <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Comparison Table</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[150px]">
                Property
              </th>
              {vaccines.map((vaccine) => (
                <th
                  key={vaccine.licensed_vaccine_id}
                  className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 min-w-[180px]"
                >
                  <div className="font-semibold text-gray-900 break-words">
                    {vaccine.vaccine_brand_name || 'Unknown'}
                  </div>
                  {vaccine.manufacturer && (
                    <div className="text-xs text-gray-500 mt-1">{vaccine.manufacturer}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                Pathogen
              </td>
              {vaccines.map((vaccine) => {
                const { displayName, className } = formatPathogenName(vaccine.pathogen_name || '');
                return (
                  <td
                    key={vaccine.licensed_vaccine_id}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 ${className || ''}`}
                  >
                    {displayName || '-'}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                Type
              </td>
              {vaccines.map((vaccine) => (
                <td
                  key={vaccine.licensed_vaccine_id}
                  className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"
                >
                  {vaccine.single_or_combination}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                Manufacturer
              </td>
              {vaccines.map((vaccine) => (
                <td
                  key={vaccine.licensed_vaccine_id}
                  className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"
                >
                  {vaccine.manufacturer || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                Licensing Authority
              </td>
              {vaccines.map((vaccine) => (
                <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex flex-col gap-1">
                    {vaccine.authority_names.length > 0 ? (
                      vaccine.authority_names.map((authority, idx) => {
                        const rawLink = vaccine.authority_links[idx] || '#';
                        const link = rawLink !== "Not Available" ? rawLink : "#";
                        const formattedAuthority = formatAuthorityName(authority);
                        const isLinkAvailable = link !== '#';
                        return (
                          <span key={idx} className="text-xs sm:text-sm">
                            <a
                              href={link}
                              target={isLinkAvailable ? '_blank' : undefined}
                              rel={isLinkAvailable ? 'noopener noreferrer' : undefined}
                              className="text-blue-600 hover:underline flex items-center gap-1"
                              title={isLinkAvailable ? `Visit ${formattedAuthority} website (opens in new tab)` : "No link available for this"}
                            >
                              <span>{formattedAuthority}</span>
                              {isLinkAvailable && <ExternalLink size={12} className="opacity-70" />}
                            </a>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-400 text-xs sm:text-sm">-</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
            {vaccines.some((v) => v.vaccine_link) && (
              <tr>
                <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-900 sticky left-0 bg-white z-10">
                  Official Source
                </td>
                {vaccines.map((vaccine) => (
                  <td key={vaccine.licensed_vaccine_id} className="px-4 sm:px-6 py-3 sm:py-4">
                    {vaccine.vaccine_link ? (
                      <a
                        href={vaccine.vaccine_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs sm:text-sm flex items-center gap-1"
                        title="Visit official vaccine source (opens in new tab)"
                      >
                        <span>View Official Source</span>
                        <ExternalLink size={12} className="opacity-70" />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs sm:text-sm">-</span>
                    )}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

