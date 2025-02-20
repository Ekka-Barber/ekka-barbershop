
// List of domains to exclude from analytics
export const EXCLUDED_DOMAINS = [
  'preview--ekka-barbershop.lovable.app',
  'lovable.dev',
  'localhost',
  '127.0.0.1'
];

export const isExcludedDomain = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;
    return EXCLUDED_DOMAINS.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
};
