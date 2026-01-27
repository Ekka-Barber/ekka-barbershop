/**
 * UI-related constants - safe magic numbers for consistent design
 * These are used throughout the application for layout and sizing
 */
export const UI = {
  // Common breakpoints (Tailwind CSS defaults)
  BREAKPOINT_SM: 640,
  BREAKPOINT_MD: 768,
  BREAKPOINT_LG: 1024,
  BREAKPOINT_XL: 1280,
  BREAKPOINT_2XL: 1536,

  // Common sizes
  SIZE_XS: 8,
  SIZE_SM: 12,
  SIZE_MD: 16,
  SIZE_LG: 20,
  SIZE_XL: 24,
  SIZE_2XL: 32,
  SIZE_3XL: 40,
  SIZE_4XL: 48,
  SIZE_5XL: 64,
  SIZE_6XL: 80,

  // Spacing units (common multiples)
  SPACE_1: 4,
  SPACE_2: 8,
  SPACE_3: 12,
  SPACE_4: 16,
  SPACE_5: 20,
  SPACE_6: 24,
  SPACE_8: 32,
  SPACE_10: 40,
  SPACE_12: 48,
  SPACE_16: 64,
  SPACE_20: 80,
  SPACE_24: 96,

  // Common dimensions used in components
  CHART_HEIGHT: 80,
  CHART_WIDTH: 60,
  GRID_COLUMNS_MIN: 3,
  GRID_COLUMNS_MAX: 6,

  // Common opacity values (as decimals)
  OPACITY_25: 0.25,
  OPACITY_50: 0.5,
  OPACITY_75: 0.75,

  // Z-index layers
  Z_INDEX_DROPDOWN: 1000,
  Z_INDEX_MODAL: 1050,
  Z_INDEX_POPOVER: 1070,
  Z_INDEX_TOAST: 1080,
} as const;

/**
 * Common grid configurations
 */
export const GRID = {
  COLUMNS_3: 3,
  COLUMNS_4: 4,
  COLUMNS_5: 5,
  COLUMNS_6: 6,
} as const;
