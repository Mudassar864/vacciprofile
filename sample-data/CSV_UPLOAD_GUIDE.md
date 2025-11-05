# CSV Upload Guide for VacciProfile

## Important: Column Names Must Match Exactly

All CSV files must use **lowercase column names with underscores**. Do not use uppercase or camelCase.

## Sample Files Provided

Use these sample CSV files as templates:
- `manufacturers_sample.csv`
- `vaccine_candidates_sample.csv`
- `licensed_vaccines_sample.csv`
- `licensing_authorities_sample.csv`
- `nitags_sample.csv`

---

## 1. Manufacturers CSV

### Required Columns:
- `name` (required)

### Optional Columns:
- `website`
- `headquarters`
- `founded`
- `ceo`
- `revenue_operating_income_net_income`
- `total_assets_total_equity`
- `num_employees` (accepts text like "88,000" or "$197B / $91B")
- `history`
- `licensed_vaccines` (comma-separated list for display)
- `vaccine_candidates` (comma-separated list for display)

### Example:
```csv
name,website,headquarters,founded,ceo,num_employees
Pfizer,https://www.pfizer.com,"New York, USA",1849,Albert Bourla,"88,000"
Moderna,https://www.modernatx.com,"Cambridge, MA",2010,Stéphane Bancel,"3,900"
```

---

## 2. Vaccine Candidates CSV

### Required Columns:
- `pathogen_name` (required)
- `vaccine_name` (required)

### Optional Columns:
- `vaccine_link`
- `phase_i` (text: "Completed", "In Progress", "Phase I/II", etc.)
- `phase_ii` (text: "Completed", "In Progress", "Phase I/II", etc.)
- `phase_iii` (text: "Completed", "In Progress", "Phase I/II", etc.)
- `phase_iv` (text: "Completed", "In Progress", "Phase I/II", etc.)
- `manufacturer`

### Important Notes:
- Column names are **lowercase with underscore**: `phase_i`, `phase_ii`, `phase_iii`, `phase_iv`
- NOT `phase_I`, `phase_II`, `phase_III`, `phase_IV` (these will cause errors!)
- Phase columns accept any text value
- Use "Not Started", "Completed", "Ongoing", "Phase I/II" or any descriptive text

### Example:
```csv
pathogen_name,vaccine_name,manufacturer,phase_i,phase_ii,phase_iii,phase_iv
COVID-19,mRNA-1273,Moderna,Completed,Completed,Completed,Ongoing
Influenza,mRNA-1010,Moderna,Completed,Completed,Phase III,Not Started
HIV,mRNA-1644,Moderna,Completed,Phase II,Not Started,Not Started
```

---

## 3. Licensed Vaccines CSV

### Required Columns:
- `pathogen_name` (required)
- `vaccine_brand_name` (required)

### Optional Columns:
- `single_or_combination`
- `authority_name`
- `vaccine_link`
- `authority_link`
- `manufacturer`

### Example:
```csv
pathogen_name,vaccine_brand_name,single_or_combination,authority_name,manufacturer
COVID-19,Comirnaty,Single,FDA,Pfizer
COVID-19,Spikevax,Single,FDA,Moderna
Influenza,Fluzone Quadrivalent,Single,FDA,Sanofi
```

---

## 4. Licensing Authorities CSV

### Required Columns:
- `authority_name` (required)

### Optional Columns:
- `country`
- `info`
- `vaccine_brand_name`
- `single_or_combination`
- `pathogen_name`
- `manufacturer`
- `website`

### Example:
```csv
country,authority_name,info,website
United States,Food and Drug Administration,The FDA is responsible for protecting public health,https://www.fda.gov/
European Union,European Medicines Agency,The EMA is responsible for scientific evaluation,https://www.ema.europa.eu/
```

---

## 5. NITAGs CSV

### Required Columns:
- `country` (required)

### Optional Columns:
- `available` (true/false)
- `website`
- `url`
- `nitag_name`
- `established`

### Example:
```csv
country,available,website,nitag_name,established
United States,true,https://www.cdc.gov/vaccines/acip/,Advisory Committee on Immunization Practices (ACIP),1964
United Kingdom,true,https://www.gov.uk/jcvi,Joint Committee on Vaccination and Immunisation (JCVI),1963
```

---

## General CSV Formatting Rules

1. **First row must contain column headers** matching the exact names above
2. **Use commas to separate values**
3. **Enclose text with commas in double quotes**:
   - `"New York, USA"` ✓
   - `New York, USA` ✗ (will be split into multiple columns)
4. **Leave empty for optional fields** - don't use NULL or N/A
5. **Text fields can contain any characters** including numbers, symbols, etc.
6. **Save as CSV (UTF-8)** for best compatibility

---

## Common Errors and Solutions

### Error: "Could not find the 'phase_I' column"
**Problem:** Using uppercase in column names
**Solution:** Use lowercase: `phase_i`, `phase_ii`, `phase_iii`, `phase_iv`

### Error: "invalid input syntax for type integer"
**Problem:** Trying to upload non-numeric text to a numeric field
**Solution:** All fields now accept text - this should no longer occur

### Error: Column splitting incorrectly
**Problem:** Text contains commas without quotes
**Solution:** Wrap text in double quotes: `"Cambridge, MA, USA"`

---

## Tips for Success

1. **Use the sample files as templates** - they have the correct format
2. **Test with a small file first** (2-3 rows) before uploading large datasets
3. **Check column names carefully** - they must match exactly
4. **For financial data**: Use text format like "$197B / $91B"
5. **For employee counts**: Use text format like "88,000" or "3,900"
6. **For phases**: Use descriptive text like "Completed", "In Progress", "Phase I/II"

---

## Need Help?

If you encounter errors:
1. Check that column names match exactly (lowercase, underscores)
2. Verify commas in text are within double quotes
3. Ensure the first row contains headers
4. Try uploading a sample file first to verify the format works
