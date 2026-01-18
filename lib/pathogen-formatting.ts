
export interface PathogenFormattingRule {
  name: string; // Exact name to match (case-insensitive)
  italic?: boolean; // Apply italic styling
  lowercase?: boolean; // Apply lowercase transformation
}


export const PATHOGEN_FORMATTING_RULES: PathogenFormattingRule[] = [
  
  { name: "Adenovirus", lowercase: true },
{ name: "Bacillus anthracis", italic: true },
{ name: "Bordetella pertussis", italic: true },
{ name: "Chikungunya virus", lowercase: true },
{ name: "Clostridium tetani", italic: true },
{ name: "Corynebacterium diphtheriae", italic: true },
{ name: "dengue virus", lowercase: true },
{ name: "Ebola virus" },
{ name: "Haemophilus influenzae", italic: true },
{ name: "hepatitis A virus", lowercase: true },
{ name: "hepatitis B virus", lowercase: true },
{ name: "human papilloma virus (HPV)", lowercase: true },
{ name: "influenza virus", lowercase: true },
{ name: "Japanese encephalitis virus (JEV)" },
{ name: "measles virus", lowercase: true },
{ name: "mpox virus (MPXV, hMPXV)", lowercase: true },
{ name: "mumps virus", lowercase: true },
{ name: "Mycobacterium tuberculosis", italic: true },
{ name: "Neisseria meningitidis", italic: true },
{ name: "Plasmodium falciparum", italic: true },
{ name: "poliovirus", lowercase: true },
{ name: "rabies virus (RABV)", lowercase: true },
{ name: "respiratory syncytial virus (RSV)", lowercase: true },
{ name: "rotavirus", lowercase: true },
{ name: "rubella virus", lowercase: true },
{ name: "Salmonella Typhi", italic: true },
{ name: "severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2)", lowercase: true },
{ name: "Streptococcus pneumoniae", italic: true },
{ name: "Tick-borne encephalitis (TBE)", lowercase: true },
{ name: "varicella-zoster virus (VZV)", lowercase: true },
{ name: "variola virus", lowercase: true },
{ name: "Vibrio cholerae", italic: true },
{ name: "yellow fever virus", lowercase: true }

];

/**
 * Formats a pathogen name based on manual formatting rules
 * @param pathogenName - The original pathogen name
 * @returns Object with formatted name and CSS classes
 */
export function formatPathogenName(pathogenName: string): {
  displayName: string;
  className: string;
} {
  if (!pathogenName) {
    return { displayName: pathogenName, className: '' };
  }

  // Find matching rule (case-insensitive)
  const rule = PATHOGEN_FORMATTING_RULES.find(
    (r) => r.name.toLowerCase() === pathogenName.toLowerCase()
  );

  let displayName = pathogenName;
  const classes: string[] = [];

  if (rule) {
    // Apply lowercase if specified
    if (rule.lowercase) {
      displayName = pathogenName.toLowerCase();
    }

    // Add italic class if specified
    if (rule.italic) {
      classes.push('italic');
    }
  }

  return {
    displayName,
    className: classes.join(' '),
  };
}

/**
 * Formats a pathogen name and returns JSX-ready props
 * @param pathogenName - The original pathogen name
 * @returns Object with formatted name and className for React
 */
export function getPathogenDisplayProps(pathogenName: string): {
  children: string;
  className?: string;
} {
  const { displayName, className } = formatPathogenName(pathogenName);
  return {
    children: displayName,
    ...(className && { className }),
  };
}

