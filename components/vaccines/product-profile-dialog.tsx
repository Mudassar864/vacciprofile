'use client';

import { Vaccine, ProductProfile, LicensingDate } from '@/lib/types';
import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductProfileComparison } from './product-profile-comparison';

interface ProductProfileDialogProps {
  vaccine: Vaccine | null;
  onClose: () => void;
  loading?: boolean;
}

export function ProductProfileDialog({
  vaccine,
  onClose,
  loading = false,
}: ProductProfileDialogProps) {
  if (!vaccine) return null;

  // Find unmatched licensing dates
  const matchedLicenseIds = new Set<string>();
  vaccine.productProfiles?.forEach((profile) => {
    vaccine.licensingDates?.forEach((license) => {
      const licenseName = (license.name || '').toLowerCase();
      const profileType = (profile.type || '').toLowerCase();
      if (
        (licenseName.includes(profileType) || profileType.includes(licenseName)) &&
        license.id
      ) {
        matchedLicenseIds.add(license.id);
      }
    });
  });

  const unmatchedLicenses =
    vaccine.licensingDates?.filter(
      (license) => !license.id || !matchedLicenseIds.has(license.id)
    ) || [];

  return (
    <Dialog open={!!vaccine} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto p-0 mx-2 sm:mx-4">
        <DialogHeader className="bg-gradient-to-r from-[#d17728] to-[#e6893a] px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-t-lg">
          <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white break-words">
            {vaccine.vaccine_brand_name || ''}
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="font-semibold text-gray-700">Pathogen:</span>
              <span className="ml-2 text-gray-600 break-words">
                {vaccine.pathogen_name || ''}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Type:</span>
              <span className="ml-2 text-gray-600 break-words">
                {vaccine.single_or_combination}
              </span>
            </div>
            {vaccine.vaccine_link && (
              <div className="sm:col-span-2">
                <span className="font-semibold text-gray-700">Official Source:</span>
                <a
                  href={vaccine.vaccine_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline break-all inline-flex items-center gap-1"
                  title="Visit official vaccine source (opens in new tab)"
                >
                  <span>View Official Source</span>
                  <ExternalLink size={14} className="opacity-70" />
                </a>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d17728]"></div>
              <p className="mt-2 text-gray-600">Loading product profiles...</p>
            </div>
          ) : vaccine.productProfiles &&
            Array.isArray(vaccine.productProfiles) &&
            vaccine.productProfiles.length > 0 ? (
            <>
              <ProductProfileComparison
                profiles={vaccine.productProfiles}
                licensingDates={vaccine.licensingDates || []}
              />

              {/* Show unmatched licensing dates at the end */}
              {unmatchedLicenses.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-gray-300">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                    Additional Licensing Data
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {unmatchedLicenses.map((license, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 space-y-2 text-xs sm:text-sm"
                      >
                        <div>
                          <span className="font-semibold text-gray-700">Authority:</span>
                          <span className="ml-2 text-gray-600 break-words">
                            {license.name || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Approval Date:</span>
                          <span className="ml-2 text-gray-600 break-words">
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
                              className="ml-2 text-blue-600 underline underline-offset-4 hover:underline break-all inline-flex items-center gap-1"
                              title="Visit licensing source (opens in new tab)"
                            >
                              <span>View Licensing Source</span>
                              <ExternalLink size={12} className="opacity-70" />
                            </a>
                          </div>
                        )}
                        {license.lastUpdateOnVaccine &&
                          license.lastUpdateOnVaccine !== 'N/A' && (
                            <div>
                              <span className="font-semibold text-gray-700">Last Updated:</span>
                              <span className="ml-2 text-gray-600 break-words">
                                {license.lastUpdateOnVaccine}
                              </span>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No product profile information available for this vaccine.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

