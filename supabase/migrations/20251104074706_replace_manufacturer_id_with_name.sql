/*
  # Replace Manufacturer ID with Manufacturer Name

  ## Overview
  Changes foreign key relationships to use manufacturer names instead of IDs.
  This simplifies data entry and makes the relationships more human-readable.

  ## Changes

  ### 1. Licensed Vaccines Table
  - Drop foreign key constraint to manufacturers
  - Drop manufacturer_id column
  - Add manufacturer (varchar) column

  ### 2. Vaccine Candidates Table
  - Drop foreign key constraint to manufacturers
  - Drop manufacturer_id column
  - Add manufacturer (varchar) column

  ## Migration Steps
  1. Add new manufacturer name columns
  2. Copy data from manufacturer_id to manufacturer name
  3. Drop old foreign key constraints and columns

  ## Notes
  - Data migration attempts to preserve existing manufacturer relationships
  - New structure uses text-based manufacturer names for easier CSV import
*/

-- Add manufacturer name column to licensed_vaccines
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'licensed_vaccines' AND column_name = 'manufacturer'
  ) THEN
    ALTER TABLE licensed_vaccines ADD COLUMN manufacturer VARCHAR(255);
  END IF;
END $$;

-- Migrate existing data: copy manufacturer names to licensed_vaccines
UPDATE licensed_vaccines lv
SET manufacturer = m.name
FROM manufacturers m
WHERE lv.manufacturer_id = m.manufacturer_id
  AND lv.manufacturer IS NULL;

-- Drop foreign key constraint and old column from licensed_vaccines
DO $$
BEGIN
  -- Drop foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name LIKE '%licensed_vaccines%manufacturer%'
    AND table_name = 'licensed_vaccines'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE licensed_vaccines 
    DROP CONSTRAINT IF EXISTS licensed_vaccines_manufacturer_id_fkey;
  END IF;

  -- Drop manufacturer_id column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'licensed_vaccines' AND column_name = 'manufacturer_id'
  ) THEN
    ALTER TABLE licensed_vaccines DROP COLUMN manufacturer_id;
  END IF;
END $$;

-- Add manufacturer name column to vaccine_candidates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaccine_candidates' AND column_name = 'manufacturer'
  ) THEN
    ALTER TABLE vaccine_candidates ADD COLUMN manufacturer VARCHAR(255);
  END IF;
END $$;

-- Migrate existing data: copy manufacturer names to vaccine_candidates
UPDATE vaccine_candidates vc
SET manufacturer = m.name
FROM manufacturers m
WHERE vc.manufacturer_id = m.manufacturer_id
  AND vc.manufacturer IS NULL;

-- Drop foreign key constraint and old column from vaccine_candidates
DO $$
BEGIN
  -- Drop foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name LIKE '%vaccine_candidates%manufacturer%'
    AND table_name = 'vaccine_candidates'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE vaccine_candidates 
    DROP CONSTRAINT IF EXISTS vaccine_candidates_manufacturer_id_fkey;
  END IF;

  -- Drop manufacturer_id column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaccine_candidates' AND column_name = 'manufacturer_id'
  ) THEN
    ALTER TABLE vaccine_candidates DROP COLUMN manufacturer_id;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_licensed_vaccines_manufacturer ON licensed_vaccines(manufacturer);
CREATE INDEX IF NOT EXISTS idx_vaccine_candidates_manufacturer ON vaccine_candidates(manufacturer);
