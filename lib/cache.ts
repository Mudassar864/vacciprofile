/**
 * Fetch from external API without caching
 * Since we're using a separate backend, we disable Next.js caching
 * to always get fresh data from the backend
 */
export async function fetchFromAPI(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    // cache: 'force-cache', 
    // next: {
    //   revalidate: 5*60, // Revalidate every 5 minutes
    // },
    cache: 'no-store', // Always fetch fresh data from separate backend
  });
}

