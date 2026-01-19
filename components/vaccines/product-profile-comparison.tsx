'use client';

import { ProductProfile, LicensingDate } from '@/lib/types';
import { ExternalLink } from 'lucide-react';
import { formatAuthorityName } from '@/lib/authority-formatting';

interface ProductProfileWithVaccine extends ProductProfile {
  vaccineName?: string;
}

interface ProductProfileComparisonProps {
  profiles: ProductProfileWithVaccine[];
  licensingDates?: LicensingDate[];
  showVaccineName?: boolean;
}

export function ProductProfileComparison({
  profiles,
  licensingDates = [],
  showVaccineName = false,
}: ProductProfileComparisonProps) {
  if (profiles.length === 0) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
        <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Product Profiles Comparison</h3>
        </div>
        <div className="p-8 sm:p-12 text-center">
          <p className="text-sm sm:text-base text-gray-500">
            No product profiles available.
          </p>
        </div>
      </div>
    );
  }

  // Sort profiles: EMA, WHO, FDA first (in that order), then all others
  const sortedProfiles = [...profiles].sort((a, b) => {
    const aType = (a.type || '').toUpperCase();
    const bType = (b.type || '').toUpperCase();
    
    const aHasEMA = aType.includes('EMA');
    const aHasWHO = aType.includes('WHO');
    const aHasFDA = aType.includes('FDA');
    const bHasEMA = bType.includes('EMA');
    const bHasWHO = bType.includes('WHO');
    const bHasFDA = bType.includes('FDA');
    
    const getPriority = (hasEMA: boolean, hasWHO: boolean, hasFDA: boolean) => {
      if (hasEMA) return 0;
      if (hasWHO) return 1;
      if (hasFDA) return 2;
      return 3;
    };
    
    const aPriority = getPriority(aHasEMA, aHasWHO, aHasFDA);
    const bPriority = getPriority(bHasEMA, bHasWHO, bHasFDA);
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    return 0;
  });

  // Field definitions for comparison
  const fields = [
    { key: 'composition', label: 'Composition' },
    { key: 'strainCoverage', label: 'Strain Coverage' },
    { key: 'indication', label: 'Indication' },
    { key: 'contraindication', label: 'Contraindication' },
    { key: 'dosing', label: 'Dosing' },
    { key: 'immunogenicity', label: 'Immunogenicity' },
    { key: 'Efficacy', label: 'Efficacy' },
    { key: 'durationOfProtection', label: 'Duration of Protection' },
    { key: 'coAdministration', label: 'Co-Administration' },
    { key: 'reactogenicity', label: 'Reactogenicity' },
    { key: 'safety', label: 'Safety' },
    { key: 'vaccinationGoal', label: 'Vaccination Goal' },
    { key: 'others', label: 'Others' },
  ];

  // Match licensing dates to profiles
  const getProfileLicensingDates = (profile: ProductProfileWithVaccine) => {
    return licensingDates.filter((license) => {
      const licenseName = (license.name || '').toLowerCase();
      const profileType = (profile.type || '').toLowerCase();
      return licenseName.includes(profileType) || profileType.includes(licenseName);
    });
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
      <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Product Profiles Comparison</h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="min-w-max">
            {/* Header row */}
            <div
              className="grid border-b-2 border-gray-300 bg-gray-50"
              style={{ gridTemplateColumns: `180px repeat(${sortedProfiles.length}, 280px)` }}
            >
              <div className="p-3 font-semibold text-sm text-gray-800 border-r border-gray-300">
                Field
              </div>
              {sortedProfiles.map((profile, index) => (
                <div key={index} className="p-3 border-r border-gray-300 last:border-r-0">
                  <div className="flex flex-col gap-2">
                    <span className="px-2 py-1 bg-[#d17728] text-white rounded font-semibold text-xs w-fit">
                      {profile.type}
                    </span>
                    <h4 className="font-semibold text-gray-800 text-xs break-words">
                      {profile.name}
                    </h4>
                    {showVaccineName && profile.vaccineName && (
                      <p className="text-xs text-gray-500 italic">
                        {profile.vaccineName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Field rows */}
            {fields.map((field, fieldIndex) => (
              <div
                key={field.key}
                className={`grid border-b border-gray-200 ${
                  fieldIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
                style={{ gridTemplateColumns: `180px repeat(${sortedProfiles.length}, 280px)` }}
              >
                <div className="p-3 font-semibold text-xs sm:text-sm text-gray-700 border-r border-gray-300">
                  {field.label}
                </div>
                {sortedProfiles.map((profile, profileIndex) => (
                  <div
                    key={profileIndex}
                    className="p-3 text-xs sm:text-sm text-gray-600 border-r border-gray-300 last:border-r-0 break-words"
                  >
                    {(profile as any)[field.key] || '-'}
                  </div>
                ))}
              </div>
            ))}

            {/* Licensing Data row */}
            <div
              className="grid border-b-2 border-gray-300 bg-gray-50"
              style={{ gridTemplateColumns: `180px repeat(${sortedProfiles.length}, 280px)` }}
            >
              <div className="p-3 font-semibold text-xs sm:text-sm text-gray-700 border-r border-gray-300">
                Licensing Data
              </div>
              {sortedProfiles.map((profile, index) => {
                const profileLicensingDates = getProfileLicensingDates(profile);
                return (
                  <div key={index} className="p-3 border-r border-gray-300 last:border-r-0">
                    {profileLicensingDates.length > 0 ? (
                      <div className="space-y-2">
                        {profileLicensingDates.map((license, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-100 rounded p-2 border border-gray-200 space-y-1 text-xs"
                          >
                            <div>
                              <span className="font-semibold text-gray-700">Authority:</span>
                              <span className="ml-1 text-gray-600 break-words">
                                {formatAuthorityName(license.name || '-')}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Approval Date:</span>
                              <span className="ml-1 text-gray-600 break-words">
                                {license.approvalDate || '-'}
                              </span>
                            </div>
                            {license.source && (
                              <div>
                                <span className="font-semibold text-gray-700">Source:</span>
                                <a
                                  href={license.source}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-blue-600 underline underline-offset-2 hover:underline break-all inline-flex items-center gap-1"
                                  title="Visit licensing source (opens in new tab)"
                                >
                                  <span>View Source</span>
                                  <ExternalLink size={10} className="opacity-70" />
                                </a>
                              </div>
                            )}
                            {license.lastUpdateOnVaccine &&
                              license.lastUpdateOnVaccine !== 'N/A' && (
                                <div>
                                  <span className="font-semibold text-gray-700">Last Updated:</span>
                                  <span className="ml-1 text-gray-600 break-words">
                                    {license.lastUpdateOnVaccine}
                                  </span>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

