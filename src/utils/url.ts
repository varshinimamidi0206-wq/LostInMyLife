/**
 * LostInMyLife Canonical URLs & Authentication Redirect Resolver
 * 
 * Production URL: https://lost-in-my-life.vercel.app
 * 
 * Rules:
 * 1. Normal users must NEVER be redirected to generated Vercel deployment URLs.
 * 2. In production or on any deployed preview/branch URL, authentication redirects
 *    must ALWAYS point to https://lost-in-my-life.vercel.app/auth/callback.
 * 3. Localhost is permitted only during local development.
 */

export const PRODUCTION_SITE_URL = 'https://lost-in-my-life.vercel.app';

/**
 * Returns the exact OAuth / auth redirect URL.
 * 
 * @param path Relative path (e.g. '/auth/callback' or '/reset-password')
 * @returns Fully qualified redirect URL
 */
export function getAuthRedirectUrl(path: string = '/auth/callback'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Allow localhost for local development & testing
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${window.location.origin}${normalizedPath}`;
    }
  }

  // If a custom production domain is provided via env, use it if it's not a generated Vercel URL
  const envUrl = (
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    ''
  ).trim().replace(/\/$/, '');

  if (envUrl && !envUrl.includes('-projects.vercel.app')) {
    return `${envUrl}${normalizedPath}`;
  }

  // Canonical production fallback
  return `${PRODUCTION_SITE_URL}${normalizedPath}`;
}
