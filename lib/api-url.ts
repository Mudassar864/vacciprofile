/**
 * Returns the API base URL. When the page is loaded over HTTPS, forces the API
 * URL to use HTTPS to avoid mixed content blocking (browsers block HTTP requests
 * from HTTPS pages).
 *
 * Set NEXT_PUBLIC_API_URL to your API URL. In production with HTTPS frontend,
 * use an HTTPS API URL (e.g. https://your-api.com).
 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    url.toLowerCase().startsWith('http://')
  ) {
    return url.replace(/^http:\/\//i, 'https://');
  }
  return url;
}
