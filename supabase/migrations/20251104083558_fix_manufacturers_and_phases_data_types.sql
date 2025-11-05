/*
  # Fix Data Types for CSV Upload

  ## Overview
  Fixes data type issues preventing CSV uploads:
  1. Change num_employees from integer to text in manufacturers table
  2. Change all phase columns from boolean to text in vaccine_candidates table

  ## Changes

  ### 1. Manufacturers Table
  - Change `num_employees` from integer to text to support formatted numbers like "150,000"
  
  ### 2. Vaccine Candidates Table
  - Change `phase_i` from boolean to text
  - Change `phase_ii` from boolean to text
  - Change `phase_iii` from boolean to text
  - Change `phase_iv` from boolean to text
  - Remove default values
  - Allows for flexible phase descriptions (e.g., "Completed", "In Progress", "Phase I/II")

  ## Notes
  - This makes the columns more flexible for various types of data
  - Text fields can still be validated in the application layer if needed
*/

-- Change num_employees from integer to text in manufacturers
ALTER TABLE manufacturers 
ALTER COLUMN num_employees TYPE text USING num_employees::text;

-- Change phase columns from boolean to text in vaccine_candidates
ALTER TABLE vaccine_candidates 
ALTER COLUMN phase_i DROP DEFAULT,
ALTER COLUMN phase_i TYPE text USING 
  CASE 
    WHEN phase_i = true THEN 'Yes'
    WHEN phase_i = false THEN 'No'
    ELSE NULL
  END;

ALTER TABLE vaccine_candidates 
ALTER COLUMN phase_ii DROP DEFAULT,
ALTER COLUMN phase_ii TYPE text USING 
  CASE 
    WHEN phase_ii = true THEN 'Yes'
    WHEN phase_ii = false THEN 'No'
    ELSE NULL
  END;

ALTER TABLE vaccine_candidates 
ALTER COLUMN phase_iii DROP DEFAULT,
ALTER COLUMN phase_iii TYPE text USING 
  CASE 
    WHEN phase_iii = true THEN 'Yes'
    WHEN phase_iii = false THEN 'No'
    ELSE NULL
  END;

ALTER TABLE vaccine_candidates 
ALTER COLUMN phase_iv DROP DEFAULT,
ALTER COLUMN phase_iv TYPE text USING 
  CASE 
    WHEN phase_iv = true THEN 'Yes'
    WHEN phase_iv = false THEN 'No'
    ELSE NULL
  END;
