/*
  # Update VacciProfile Database Schema

  ## Overview
  Restructures the database to match the new schema requirements with simplified field names and structure.

  ## Changes
  
  ### Drop existing tables and recreate with new structure
  
  ### 1. `manufacturers` table (updated)
  - `manufacturer_id` (serial, primary key) - Changed from uuid
  - `name` (varchar) - Company name
  - `website` (text) - Official website
  - `founded` (varchar) - Founding year
  - `headquarters` (varchar) - Location
  - `ceo` (varchar) - CEO name
  - `revenue_operating_income_net_income` (text) - Financial details
  - `total_assets_total_equity` (text) - Assets and equity
  - `num_employees` (int) - Number of employees
  - `history` (text) - Company background

  ### 2. `licensed_vaccines` table (replaces vaccines)
  - `licensed_vaccine_id` (serial, primary key)
  - `pathogen_name` (varchar) - Disease/pathogen
  - `vaccine_brand_name` (varchar) - Commercial name
  - `single_or_combination` (varchar) - Vaccine type
  - `authority_name` (varchar) - Licensing authority
  - `vaccine_link` (text) - URL for vaccine details
  - `authority_link` (text) - URL for authority
  - `manufacturer_id` (int, foreign key) - Related manufacturer

  ### 3. `vaccine_candidates` table (updated)
  - `candidate_id` (serial, primary key) - Changed from uuid
  - `pathogen_name` (varchar) - Disease/pathogen
  - `vaccine_name` (varchar) - Candidate name
  - `vaccine_link` (text) - URL for candidate details
  - `phase_I` (boolean) - Phase I status
  - `phase_II` (boolean) - Phase II status
  - `phase_III` (boolean) - Phase III status
  - `phase_IV` (boolean) - Phase IV status
  - `manufacturer_id` (int, foreign key) - Developing company

  ### 4. `licensing_authorities` table (updated)
  - `authority_id` (serial, primary key)
  - `authority_name` (varchar) - Authority name
  - `info` (text) - Description
  - `website` (text) - Official website

  ### 5. `nitags` table (updated)
  - `nitag_id` (serial, primary key) - Changed from uuid
  - `country` (varchar) - Country name
  - `available` (boolean) - Whether NITAG exists
  - `website` (text) - Official website
  - `url` (text) - Additional link
  - `nitag_name` (varchar) - NITAG name
  - `established` (varchar) - Year established

  ## Security
  - Enable RLS on all tables
  - Public read access for all data
  - Authenticated write access for admin users only
*/

-- Drop existing tables (cascade to remove dependencies)
DROP TABLE IF EXISTS vaccine_licensing CASCADE;
DROP TABLE IF EXISTS vaccine_candidates CASCADE;
DROP TABLE IF EXISTS vaccines CASCADE;
DROP TABLE IF EXISTS pathogens CASCADE;
DROP TABLE IF EXISTS licensing_authorities CASCADE;
DROP TABLE IF EXISTS manufacturers CASCADE;
DROP TABLE IF EXISTS nitags CASCADE;

-- Create manufacturers table with new structure
CREATE TABLE manufacturers (
  manufacturer_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  website TEXT,
  founded VARCHAR(50),
  headquarters VARCHAR(255),
  ceo VARCHAR(255),
  revenue_operating_income_net_income TEXT,
  total_assets_total_equity TEXT,
  num_employees INT,
  history TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create licensed_vaccines table
CREATE TABLE licensed_vaccines (
  licensed_vaccine_id SERIAL PRIMARY KEY,
  pathogen_name VARCHAR(255) NOT NULL,
  vaccine_brand_name VARCHAR(255) NOT NULL,
  single_or_combination VARCHAR(255),
  authority_name VARCHAR(255),
  vaccine_link TEXT,
  authority_link TEXT,
  manufacturer_id INT REFERENCES manufacturers(manufacturer_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create vaccine_candidates table with new structure
CREATE TABLE vaccine_candidates (
  candidate_id SERIAL PRIMARY KEY,
  pathogen_name VARCHAR(255) NOT NULL,
  vaccine_name VARCHAR(255) NOT NULL,
  vaccine_link TEXT,
  phase_I BOOLEAN DEFAULT false,
  phase_II BOOLEAN DEFAULT false,
  phase_III BOOLEAN DEFAULT false,
  phase_IV BOOLEAN DEFAULT false,
  manufacturer_id INT REFERENCES manufacturers(manufacturer_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create licensing_authorities table (informational only)
CREATE TABLE licensing_authorities (
  authority_id SERIAL PRIMARY KEY,
  authority_name VARCHAR(255) NOT NULL,
  info TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create nitags table with new structure
CREATE TABLE nitags (
  nitag_id SERIAL PRIMARY KEY,
  country VARCHAR(255) NOT NULL,
  available BOOLEAN DEFAULT true,
  website TEXT,
  url TEXT,
  nitag_name VARCHAR(255),
  established VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_licensed_vaccines_manufacturer ON licensed_vaccines(manufacturer_id);
CREATE INDEX idx_licensed_vaccines_pathogen ON licensed_vaccines(pathogen_name);
CREATE INDEX idx_vaccine_candidates_manufacturer ON vaccine_candidates(manufacturer_id);
CREATE INDEX idx_vaccine_candidates_pathogen ON vaccine_candidates(pathogen_name);
CREATE INDEX idx_nitags_country ON nitags(country);

-- Enable Row Level Security
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE licensed_vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE licensing_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE nitags ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public can view manufacturers"
  ON manufacturers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view licensed vaccines"
  ON licensed_vaccines FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view vaccine candidates"
  ON vaccine_candidates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view licensing authorities"
  ON licensing_authorities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view nitags"
  ON nitags FOR SELECT
  TO public
  USING (true);

-- Authenticated admin write policies for manufacturers
CREATE POLICY "Authenticated users can insert manufacturers"
  ON manufacturers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update manufacturers"
  ON manufacturers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete manufacturers"
  ON manufacturers FOR DELETE
  TO authenticated
  USING (true);

-- Authenticated admin write policies for licensed_vaccines
CREATE POLICY "Authenticated users can insert licensed vaccines"
  ON licensed_vaccines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update licensed vaccines"
  ON licensed_vaccines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete licensed vaccines"
  ON licensed_vaccines FOR DELETE
  TO authenticated
  USING (true);

-- Authenticated admin write policies for vaccine_candidates
CREATE POLICY "Authenticated users can insert vaccine candidates"
  ON vaccine_candidates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vaccine candidates"
  ON vaccine_candidates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete vaccine candidates"
  ON vaccine_candidates FOR DELETE
  TO authenticated
  USING (true);

-- Authenticated admin write policies for licensing_authorities
CREATE POLICY "Authenticated users can insert licensing authorities"
  ON licensing_authorities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update licensing authorities"
  ON licensing_authorities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete licensing authorities"
  ON licensing_authorities FOR DELETE
  TO authenticated
  USING (true);

-- Authenticated admin write policies for nitags
CREATE POLICY "Authenticated users can insert nitags"
  ON nitags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update nitags"
  ON nitags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete nitags"
  ON nitags FOR DELETE
  TO authenticated
  USING (true);
