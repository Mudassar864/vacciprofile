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
 * formatAuthorityName('FDA') // Returns 'FDA'
 * formatAuthorityName('EMA') // Returns 'EMA'
 */
export function formatAuthorityName(authorityName: string): string {
  if (!authorityName || typeof authorityName !== 'string') {
    return authorityName;
  }

  // Check if the authority name contains a country in parentheses
  const match = authorityName.match(/\(([^)]+)\)/);
  
  if (match && match[1]) {
    // Extract and return only the country name from parentheses
    return match[1].trim();
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

