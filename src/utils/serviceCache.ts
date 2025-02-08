
const CACHE_KEYS = {
  SELECTED_SERVICES: 'selectedServices',
  ACTIVE_CATEGORY: 'activeCategory'
} as const;

export const cacheServices = (services: any[]) => {
  localStorage.setItem(CACHE_KEYS.SELECTED_SERVICES, JSON.stringify(services));
};

export const getCachedServices = () => {
  const cached = localStorage.getItem(CACHE_KEYS.SELECTED_SERVICES);
  return cached ? JSON.parse(cached) : [];
};

export const cacheActiveCategory = (categoryId: string) => {
  localStorage.setItem(CACHE_KEYS.ACTIVE_CATEGORY, categoryId);
};

export const getCachedActiveCategory = () => {
  return localStorage.getItem(CACHE_KEYS.ACTIVE_CATEGORY);
};

export const clearServiceCache = () => {
  localStorage.removeItem(CACHE_KEYS.SELECTED_SERVICES);
  localStorage.removeItem(CACHE_KEYS.ACTIVE_CATEGORY);
};
