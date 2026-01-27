/**
 * Time-related constants - safe magic numbers that have universal meanings
 * These are used throughout the application for calculations and should not change
 */
export const TIME = {
  // Basic time units
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH_APPROX: 30,
  MONTHS_PER_YEAR: 12,

  // Common time intervals in milliseconds
  SECOND_IN_MS: 1000,
  MINUTE_IN_MS: 60 * 1000,
  HOUR_IN_MS: 60 * 60 * 1000,
  DAY_IN_MS: 24 * 60 * 60 * 1000,
  WEEK_IN_MS: 7 * 24 * 60 * 60 * 1000,
  MONTH_IN_MS: 30 * 24 * 60 * 60 * 1000, // Approximate
} as const;

/**
 * Common time intervals used for caching and stale time calculations
 */
export const CACHE_TIME = {
  SHORT: 5 * TIME.MINUTE_IN_MS, // 300000 ms
  MEDIUM: 10 * TIME.MINUTE_IN_MS, // 600000 ms
  LONG: TIME.DAYS_PER_MONTH_APPROX * TIME.MINUTE_IN_MS, // 1800000 ms
  EXTRA_LONG: TIME.SECONDS_PER_MINUTE * TIME.MINUTE_IN_MS, // 3600000 ms
} as const;

/**
 * Common stale time intervals
 */
export const STALE_TIME = {
  SHORT: 5 * TIME.MINUTE_IN_MS, // 300000 ms
  MEDIUM: 10 * TIME.MINUTE_IN_MS, // 600000 ms
  LONG: TIME.DAYS_PER_MONTH_APPROX * TIME.MINUTE_IN_MS, // 1800000 ms
} as const;
