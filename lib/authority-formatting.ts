/**
 * Formats a licensing authority name to show only the country if available in parentheses,
 * otherwise shows the complete authority name.
 * 
 * @param authorityName - The original authority name
 * @returns Formatted authority name (country if in parentheses, otherwise full name)
 * 
 * @example
 * formatAuthorityName('Paul-Ehrlich-Institut (Germany)') // Returns 'Germany'
 * formatAuthorityName('Health Canada (Canada)') // Returns 'Canada'
 * formatAuthorityName('Bulgarian Drug Agency (BDA) (Bulgaria)') // Returns 'Bulgaria'
 * formatAuthorityName('FDA') // Returns 'FDA'
 * formatAuthorityName('EMA') // Returns 'EMA'
 */
export function formatAuthorityName(authorityName: string): string {
  if (!authorityName || typeof authorityName !== 'string') {
    return authorityName;
  }

  // Find all matches of text in parentheses
  const matches = authorityName.match(/\(([^)]+)\)/g);
  
  if (matches && matches.length > 0) {
    // If there are multiple sets of parentheses, use the last one (typically the country)
    // If there's only one, use that one
    const lastMatch = matches[matches.length - 1];
    const countryMatch = lastMatch.match(/\(([^)]+)\)/);
    
    if (countryMatch && countryMatch[1]) {
      // Extract and return only the country name from the last parentheses
      return countryMatch[1].trim();
    }
  }

  // If no parentheses found, return the complete authority name
  return authorityName.trim();
}

/**
 * Formats multiple authority names
 * @param authorityNames - Array of authority names
 * @returns Array of formatted authority names
 */
export function formatAuthorityNames(authorityNames: string[]): string[] {
  if (!Array.isArray(authorityNames)) {
    return authorityNames;
  }
  
  return authorityNames.map(formatAuthorityName);
}

