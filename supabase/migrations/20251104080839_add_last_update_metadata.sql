/*
  # Add Metadata Table for Last Update Tracking

  ## Overview
  Creates a metadata table to track the last update time for the database.
  This will be displayed in the header across all pages.

  ## Changes

  ### 1. New Table: metadata
  - `key` (varchar, primary key) - Unique identifier for the metadata entry
  - `value` (text) - The metadata value
  - `updated_at` (timestamptz) - Timestamp of when the value was last updated

  ### 2. Initial Data
  - Insert initial 'last_update' entry with current timestamp

  ### 3. Security
  - Enable RLS on metadata table
  - Add policy for public read access
  - Add policy for authenticated users to update

  ## Notes
  - The 'last_update' key will be automatically updated whenever data is imported
  - Format: ISO 8601 timestamp
*/

-- Create metadata table
CREATE TABLE IF NOT EXISTS metadata (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial last_update entry
INSERT INTO metadata (key, value, updated_at)
VALUES ('last_update', now()::text, now())
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE metadata ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Anyone can read metadata"
  ON metadata
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy for authenticated users to update
CREATE POLICY "Authenticated users can update metadata"
  ON metadata
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update last_update timestamp
CREATE OR REPLACE FUNCTION update_last_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE metadata
  SET value = now()::text, updated_at = now()
  WHERE key = 'last_update';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all main tables to update last_update timestamp
CREATE TRIGGER update_last_update_on_licensed_vaccines
  AFTER INSERT OR UPDATE OR DELETE ON licensed_vaccines
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_last_update_timestamp();

CREATE TRIGGER update_last_update_on_vaccine_candidates
  AFTER INSERT OR UPDATE OR DELETE ON vaccine_candidates
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_last_update_timestamp();

CREATE TRIGGER update_last_update_on_manufacturers
  AFTER INSERT OR UPDATE OR DELETE ON manufacturers
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_last_update_timestamp();

CREATE TRIGGER update_last_update_on_licensing_authorities
  AFTER INSERT OR UPDATE OR DELETE ON licensing_authorities
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_last_update_timestamp();

CREATE TRIGGER update_last_update_on_nitags
  AFTER INSERT OR UPDATE OR DELETE ON nitags
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_last_update_timestamp();
