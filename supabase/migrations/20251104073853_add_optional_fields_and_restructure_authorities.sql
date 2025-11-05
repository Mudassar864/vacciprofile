/*
  # Add Optional Fields and Restructure Licensing Authorities

  ## Overview
  Adds optional display fields to manufacturers table and restructures licensing_authorities
  to include vaccine-level details for display purposes.

  ## Changes

  ### 1. Manufacturers Table Updates
  - Add `licensed_vaccines` (text) - Optional comma-separated list for display
  - Add `vaccine_candidates` (text) - Optional comma-separated list for display

  ### 2. Licensing Authorities Table Restructure
  - Add `country` (varchar) - Country of the authority
  - Add `vaccine_brand_name` (varchar) - Vaccine brand name
  - Add `single_or_combination` (varchar) - Vaccine type
  - Add `pathogen_name` (varchar) - Pathogen name
  - Add `manufacturer` (varchar) - Manufacturer name
  - Keep existing fields: authority_id, authority_name, info, website

  ## Notes
  The licensing_authorities table now serves dual purpose:
  - Store authority information
  - Store vaccine-authority relationships with denormalized data for display
*/

-- Add optional display fields to manufacturers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'manufacturers' AND column_name = 'licensed_vaccines'
  ) THEN
    ALTER TABLE manufacturers ADD COLUMN licensed_vaccines TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'manufacturers' AND column_name = 'vaccine_candidates'
  ) THEN
    ALTER TABLE manufacturers ADD COLUMN vaccine_candidates TEXT;
  END IF;
END $$;

-- Add new fields to licensing_authorities table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'licensing_authorities' AND column_name = 'country'
  ) THEN
    ALTER TABLE licensing_authorities ADD COLUMN country VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'licensing_authorities' AND column_name = 'vaccine_brand_name'
  ) THEN
    ALTER TABLE licensing_authorities ADD COLUMN vaccine_brand_name VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'licensing_authorities' AND column_name = 'single_or_combination'
  ) THEN
    ALTER TABLE licensing_authorities ADD COLUMN single_or_combination VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'licensing_authorities' AND column_name = 'pathogen_name'
  ) THEN
    ALTER TABLE licensing_authorities ADD COLUMN pathogen_name VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'licensing_authorities' AND column_name = 'manufacturer'
  ) THEN
    ALTER TABLE licensing_authorities ADD COLUMN manufacturer VARCHAR(255);
  END IF;
END $$;

-- Create index for licensing_authorities country field
CREATE INDEX IF NOT EXISTS idx_licensing_authorities_country ON licensing_authorities(country);
CREATE INDEX IF NOT EXISTS idx_licensing_authorities_vaccine ON licensing_authorities(vaccine_brand_name);
