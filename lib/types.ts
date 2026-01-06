// Shared types used across the application

export interface ProductProfile {
  type: string;
  name: string;
  composition: string;
  strainCoverage: string;
  indication: string;
  contraindication: string;
  dosing: string;
  immunogenicity: string;
  Efficacy: string;
  durationOfProtection: string;
  coAdministration: string;
  reactogenicity: string;
  safety: string;
  vaccinationGoal: string;
  others: string;
}

export interface LicensingDate {
  id: string;
  vaccineName: string;
  name: string;
  type: string;
  approvalDate: string;
  source: string;
  lastUpdateOnVaccine: string;
}

export interface Vaccine {
  licensed_vaccine_id: string;
  pathogen_name?: string;
  vaccine_brand_name?: string;
  single_or_combination: string;
  authority_names: string[];
  authority_links: string[];
  vaccine_link?: string;
  manufacturer?: string;
  lastUpdated?: string;
  productProfiles?: ProductProfile[];
  licensingDates?: LicensingDate[];
}

export interface PathogenData {
  pathogenId?: number;
  name?: string;
  description?: string;
  image?: string;
  bulletpoints?: string;
  link?: string;
  updatedAt?: string;
}

