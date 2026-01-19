
export interface PathogenFormattingRule {
  name: string; // Exact name to match (case-insensitive)
  italic?: boolean; // Apply italic styling
  lowercase?: boolean; // Apply lowercase transformation
}


export const PATHOGEN_FORMATTING_RULES: PathogenFormattingRule[] = [
  
  { name: "Adenovirus", },
{ name: "Bacillus anthracis", italic: true },
{ name: "Bordetella pertussis", italic: true },
{ name: "Chikungunya virus", },
{ name: "Clostridium tetani", italic: true },
{ name: "Corynebacterium diphtheriae", italic: true },
{ name: "dengue virus", },
{ name: "Ebola virus" },
{ name: "Haemophilus influenzae", italic: true },
{ name: "hepatitis A virus", },
{ name: "hepatitis B virus", },
{ name: "human papilloma virus (HPV)", },
{ name: "influenza virus", },
{ name: "Japanese encephalitis virus (JEV)" },
{ name: "measles virus", },
{ name: "mpox virus (MPXV, hMPXV)", },
{ name: "mumps virus", },
{ name: "Mycobacterium tuberculosis", italic: true },
{ name: "Neisseria meningitidis", italic: true },
{ name: "Plasmodium falciparum", italic: true },
{ name: "poliovirus", },
{ name: "rabies virus (RABV)", },
{ name: "respiratory syncytial virus (RSV)", },
{ name: "rotavirus", },
{ name: "rubella virus", },
{ name: "Salmonella Typhi", italic: true },
{ name: "severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2)", },
{ name: "Streptococcus pneumoniae", italic: true },
{ name: "Tick-borne encephalitis (TBE)", },
{ name: "varicella-zoster virus (VZV)", },
{ name: "variola virus", },
{ name: "Vibrio cholerae", italic: true },
{ name: "yellow fever virus", }

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

