# VacciProfile Sample Data

This directory contains sample CSV files with realistic vaccine data that you can use to populate your VacciProfile database.

## Files Included

1. **manufacturers.csv** - 10 major vaccine manufacturers with optional display fields
2. **licensed_vaccines.csv** - 30 licensed vaccines linked by manufacturer name
3. **vaccine_candidates.csv** - 30 vaccine candidates in various trial phases linked by manufacturer name
4. **licensing_authorities.csv** - 30 vaccine-authority approval records
5. **nitags.csv** - 30 National Immunization Technical Advisory Groups

## Important Schema Changes

### Manufacturer Linking Uses Names (Not IDs)
The database now uses **manufacturer names** instead of IDs to link vaccines and candidates to manufacturers. This simplifies data entry and makes CSV files more human-readable.

- Licensed vaccines link to manufacturers using the `manufacturer` field (text)
- Vaccine candidates link to manufacturers using the `manufacturer` field (text)
- Use exact manufacturer names as they appear in the manufacturers table

## How to Upload

### Upload Order (Important!)

You must upload the files in this specific order:

1. **Upload manufacturers.csv first**
   - This creates the manufacturer records
   - Note the exact names for use in other tables

2. **Upload licensed_vaccines.csv**
   - Uses `manufacturer` field with exact names (e.g., "Pfizer Inc.", "Moderna Inc.")
   - Must match manufacturer names exactly

3. **Upload vaccine_candidates.csv**
   - Uses `manufacturer` field with exact names
   - Must match manufacturer names exactly

4. **Upload licensing_authorities.csv**
   - Stores both authority info and vaccine-authority relationships
   - Each row represents one approved vaccine by one authority

5. **Upload nitags.csv**
   - Independent table, no dependencies

### Steps to Upload

1. **Create Admin Account**
   - Navigate to `/signup`
   - Create your admin account

2. **Login to Admin Panel**
   - Go to `/admin`
   - Login with your credentials

3. **Upload CSV Files**
   - Select the appropriate tab (Manufacturers, Licensed Vaccines, etc.)
   - Click "Choose File" and select the CSV file
   - Click "Upload CSV"
   - Wait for success message
   - Repeat for each file in the correct order

## CSV Format Notes

### manufacturers.csv
- `manufacturer_id` is auto-generated, don't include it in CSV
- `name` - Exact name to use in other tables (e.g., "Pfizer Inc.")
- `num_employees` should be a number
- `licensed_vaccines` (optional) - Comma-separated list for display
- `vaccine_candidates` (optional) - Comma-separated list for display
- All other fields are text

### licensed_vaccines.csv
- `manufacturer` - Exact manufacturer name as text (e.g., "Pfizer Inc.", "Moderna Inc.")
- URLs should start with `http://` or `https://`
- `pathogen_name` stores the pathogen directly
- **No manufacturer_id needed!** Just use the name.

### vaccine_candidates.csv
- `manufacturer` - Exact manufacturer name as text (e.g., "Pfizer Inc.", "Moderna Inc.")
- `phase_I`, `phase_II`, `phase_III`, `phase_IV` should be `true` or `false` (or `1`/`0`)
- `pathogen_name` stores the pathogen directly
- **No manufacturer_id needed!** Just use the name.

### licensing_authorities.csv
**NEW STRUCTURE**: This table now stores vaccine-authority relationships with denormalized data.

Each row represents one vaccine approved by one regulatory authority:
- `country` - Country of the authority (e.g., "United States", "European Union")
- `authority_name` - Name of the regulatory body (e.g., "FDA", "EMA")
- `info` - Description about the authority
- `vaccine_brand_name` - The approved vaccine (e.g., "Comirnaty")
- `single_or_combination` - Type of vaccine
- `pathogen_name` - Target pathogen
- `manufacturer` - Manufacturer name (text, not ID)
- `website` - Authority website

### nitags.csv
- `available` should be `true` or `false` (or `1`/`0`)
- All other fields are text

## Manufacturer Names Reference

Use these exact names when filling in the `manufacturer` field:

1. Pfizer Inc.
2. Moderna Inc.
3. GlaxoSmithKline (GSK)
4. Sanofi
5. Merck & Co.
6. AstraZeneca
7. Bharat Biotech
8. Serum Institute of India
9. Johnson & Johnson
10. Sinovac Biotech

## Data Sources

The sample data includes:
- **10 major vaccine manufacturers** with complete information
- **30 licensed vaccines** covering COVID-19, influenza, HPV, measles, mumps, rubella, hepatitis, and many other diseases
- **30 vaccine candidates** in various phases of clinical trials
- **30 licensing authority records** showing vaccine approvals by FDA, EMA, WHO, and other regulatory bodies
- **30 NITAGs** representing immunization advisory groups from countries on all continents

## Key Benefits of Name-Based Linking

### Simplified Data Entry
- No need to look up manufacturer IDs
- Just type the manufacturer name
- More intuitive for humans

### Easier CSV Management
- CSV files are more readable
- Easy to understand relationships at a glance
- Less error-prone than numeric IDs

### Flexible Database
- Can add vaccines without needing manufacturer IDs first
- Names are self-documenting

## Need Help?

If you encounter any issues uploading the data:
1. Check that you're uploading files in the correct order
2. Verify manufacturer names match exactly (case-sensitive!)
3. Make sure you're logged in as an authenticated user
4. Check the browser console for any error messages

## Modifying the Data

Feel free to modify these CSV files to:
- Add more records
- Update information
- Remove records you don't need
- Customize for your specific use case

Just make sure to:
- Maintain the correct column headers
- Use exact manufacturer names
- Keep data types consistent
