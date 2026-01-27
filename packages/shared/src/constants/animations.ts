/**
 * Animation configuration constants for consistent timing and easing
 * Used across the application for smooth, accessible animations
 */

// Background animation configurations
// Optimized: removed opacity animations for better performance
export const BACKGROUND_ANIMATIONS = {
  ORB_1: {
    duration: 10,
    scale: [1, 1.1, 1],
    delay: 0,
  },
  ORB_2: {
    duration: 8,
    scale: [1.1, 1, 1.1],
    delay: 2,
  },
  ORB_3: {
    duration: 12,
    scale: [1, 1.15, 1],
    delay: 4,
  },
};

// Entrance animation configurations
export const ENTRANCE_ANIMATIONS = {
  MAIN_CONTAINER: {
    duration: 0.6,
    ease: "easeOut" as const,
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  HEADER: {
    duration: 0.8,
    delay: 0.2,
    ease: "easeOut" as const,
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  UI_ELEMENTS: {
    duration: 0.6,
    delay: 0.4,
    ease: "easeOut" as const,
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  SEPARATOR: {
    duration: 0.6,
    delay: 0.6,
    ease: "easeOut" as const,
    initial: { opacity: 0, scaleX: 0 },
    animate: { opacity: 1, scaleX: 1 },
  },
  INSTALL_PROMPT: {
    duration: 0.6,
    delay: 0.8,
    ease: "easeOut" as const,
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
} as const;

// Common easing functions
export const EASING = {
  EASE_IN_OUT: "easeInOut" as const,
  EASE_OUT: "easeOut" as const,
  EASE_IN: "easeIn" as const,
} as const;

// Performance optimization settings
export const ANIMATION_PERFORMANCE = {
  WILL_CHANGE: {
    TRANSFORM_OPACITY: 'transform, opacity' as const,
    OPACITY: 'opacity' as const,
    AUTO: 'auto' as const,
  },
  HARDWARE_ACCELERATION: {
    BACKFACE_VISIBILITY: 'hidden' as const,
    TRANSFORM_Z: 'translateZ(0)' as const,
  },
} as const;

// Animation timing constants
export const TIMING = {
  INSTANT: 0,
  FAST: 0.2,
  NORMAL: 0.4,
  SLOW: 0.8,
  BACKGROUND_MIN: 6,
  BACKGROUND_MAX: 10,
} as const;
