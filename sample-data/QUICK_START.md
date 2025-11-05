# Quick Start Guide - VacciProfile Sample Data

## Step 1: Create Admin Account

Visit `/signup` and create an account with:
- Email: `admin@vacciprofile.com`
- Password: Your choice (min 6 characters)

## Step 2: Login

Visit `/admin` and login with your credentials.

## Step 3: Upload Data Files (IN THIS ORDER!)

### 1. Manufacturers Tab
Upload: `manufacturers.csv`
- Contains 10 major vaccine manufacturers
- **This MUST be uploaded first!**
- Note the exact manufacturer names for the next steps

### 2. Licensed Vaccines Tab
Upload: `licensed_vaccines.csv`
- Contains 30 licensed vaccines
- Uses manufacturer NAMES (not IDs)
- Example: "Pfizer Inc.", "Moderna Inc."

### 3. Candidates Tab
Upload: `vaccine_candidates.csv`
- Contains 30 vaccine candidates in clinical trials
- Uses manufacturer NAMES (not IDs)
- Example: "Pfizer Inc.", "Moderna Inc."

### 4. Authorities Tab
Upload: `licensing_authorities.csv`
- Contains 30 vaccine-authority approval records
- Shows which vaccines are approved by which authorities
- Each row is one vaccine approved by one authority

### 5. NITAGs Tab
Upload: `nitags.csv`
- Contains 30 national immunization advisory groups
- No dependencies

## Step 4: View Your Data

After uploading, visit these pages to see your data:

- `/` - Home page with navigation
- `/vaccines` - Licensed vaccines table
- `/candidates` - Vaccine candidates by pathogen
- `/manufacturers` - Manufacturers list (click for details)
- `/authorities` - Licensing authorities with vaccine approvals
- `/nitags` - National advisory groups

## That's it!

Your VacciProfile database is now populated with comprehensive sample data.

## Important: Name-Based Linking

The database now uses **manufacturer names** instead of IDs to link tables:

✅ **Correct**: Use "Pfizer Inc." in the manufacturer column
❌ **Wrong**: Use "1" or numeric IDs

### Manufacturer Names to Use:
- Pfizer Inc.
- Moderna Inc.
- GlaxoSmithKline (GSK)
- Sanofi
- Merck & Co.
- AstraZeneca
- Bharat Biotech
- Serum Institute of India
- Johnson & Johnson
- Sinovac Biotech

## Benefits

### Easier Data Entry
- No need to remember or look up IDs
- Just type the manufacturer name
- More human-readable CSV files

### Simplified Management
- CSV files are self-documenting
- Easy to understand relationships
- Less error-prone than numeric IDs

## Tips

- Manufacturer names are case-sensitive
- Must match exactly as shown above
- Boolean fields (phase_I, available, etc.) accept: `true`, `false`, `1`, or `0`
- All data is editable through the database
