/**
 * Design Tokens - Single Source of Truth for Ekka App
 *
 * This file provides programmatic access to design tokens defined in CSS.
 * For runtime CSS usage, see src/index.css
 * For design documentation, see wrapup_plan/DESIGN_TOKENS.md
 */

import * as ANIMATION_TOKENS from './animations';

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const COLORS = {
  // Brand Colors
  brand: {
    primary: '#e9b353',
    secondary: '#4A4A4A',
    light: '#FAF9F7',
    gradient: {
      light: '#f2d197',
      base: '#efc780',
      dark: '#e39f26',
      darker: '#d4921b',
    },
  },

  // Semantic Colors (HSL values from index.css)
  primary: '38 77% 62%',
  'primary-foreground-light': '210 40% 98%',
  'primary-foreground-dark': '222.2 47.4% 11.2%',
  secondary: '210 40% 96.1%',
  'secondary-foreground-light': '222.2 47.4% 11.2%',
  'secondary-foreground-dark': '210 40% 98%',
  background: '0 0% 100%',
  backgroundDark: '222.2 84% 4.9%',
  foreground: '222.2 84% 4.9%',
  foregroundDark: '210 40% 98%',
  card: '0 0% 100%',
  cardDark: '222.2 84% 4.9%',
  'card-foreground-light': '222.2 84% 4.9%',
  'card-foreground-dark': '210 40% 98%',
  destructive: '0 84.2% 60.2%',
  destructiveDark: '0 62.8% 30.6%',
  'destructive-foreground': '210 40% 98%',
  muted: '210 40% 96.1%',
  mutedDark: '217.2 32.6% 17.5%',
  'muted-foreground-light': '215.4 16.3% 46.9%',
  'muted-foreground-dark': '215 20.2% 65.1%',
  accent: '210 40% 96.1%',
  accentDark: '217.2 32.6% 17.5%',
  'accent-foreground-light': '222.2 47.4% 11.2%',
  'accent-foreground-dark': '210 40% 98%',
  border: '214.3 31.8% 91.4%',
  borderDark: '217.2 32.6% 17.5%',
  input: '214.3 31.8% 91.4%',
  inputDark: '217.2 32.6% 17.5%',
  ring: '38 77% 62%',

  // State Colors
  success: '34 197 94%',
  warning: '234 179 8%',
  error: '239 68 68%',
  info: '59 130 246%',

  // Neutral Scale
  gray: {
    50: '249 250 251',
    100: '243 244 246',
    200: '229 231 235',
    300: '209 213 219',
    400: '156 163 175',
    500: '107 114 128',
    600: '75 85 99',
    700: '55 65 81',
    800: '31 41 55',
    900: '17 24 39',
  },
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const SPACING = {
  // Base spacing scale (Tailwind default)
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',    // 48px

  // Application-specific spacing
  content: '1rem',
  header: '2.75rem',
  'bottom-nav': '4rem',
  'app-max-width': '28rem',
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const TYPOGRAPHY = {
  fontFamily: {
    sans: "'IBM Plex Sans Arabic', sans-serif",
    arabic: "'Cairo', 'Noto Sans Arabic', sans-serif",
  },

  // Common text size combinations
  sectionTitle: 'text-lg sm:text-xl md:text-2xl font-semibold tracking-tight',
  sectionDescription: 'text-sm sm:text-base text-muted-foreground',
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const BORDER_RADIUS = {
  base: '0.5rem',
  sm: 'calc(0.5rem - 4px)',  // 2px
  md: 'calc(0.5rem - 2px)',  // 6px
  lg: 'var(--radius)',          // 8px
  xl: '1rem',
  full: '9999px',
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const SHADOWS = {
  soft: '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
  card: '0 4px 12px -4px rgba(0, 0, 0, 0.08)',
  dialog: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',

  // Luxury multi-layer shadows
  hero: '0 50px 140px -60px rgba(0,0,0,0.85), 0 20px 60px -30px rgba(214,179,90,0.25)',
  cardLuxury: '0 30px 70px -30px rgba(0,0,0,0.6), 0 10px 30px -10px rgba(232,198,111,0.15)',
  buttonGold: '0 25px 50px -20px rgba(232,198,111,0.8), 0 10px 25px -10px rgba(214,179,90,0.4)',
  buttonGoldHover: '0 30px 60px -20px rgba(232,198,111,0.9), 0 15px 35px -10px rgba(214,179,90,0.5)',
  stat: '0 15px 35px -15px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
  goldOrb: '0 0 50px rgba(214,179,90,0.2)',
  gold: '0 10px 40px -10px rgba(233, 179, 83, 0.5)',
  goldLight: '0 4px 12px -4px rgba(233, 179, 83, 0.3)',
} as const;

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export const BREAKPOINTS = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const TRANSITIONS = {
  fast: '150ms',
  medium: '250ms',
  slow: '350ms',
} as const;

// ============================================================================
// SAFE AREA TOKENS (iOS Notch Support)
// ============================================================================

export const SAFE_AREA = {
  top: 'var(--sat)',
  right: 'var(--sar)',
  bottom: 'var(--sab)',
  left: 'var(--sal)',
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export { ANIMATION_TOKENS as ANIMATIONS };

// ============================================================================
// UTILITY CLASSES
// ============================================================================

export const UTILITY_CLASSES = {
  hideScrollbar: 'hide-scrollbar',
  momentumScroll: 'momentum-scroll',
  touchTarget: 'touch-target',
  customScrollbar: 'custom-scrollbar',
  pageShell: 'page-shell',
  pagePadding: 'page-padding',
  appSurface: 'app-surface',
  pageStack: 'page-stack',
} as const;

// ============================================================================
// MAIN EXPORT
// ============================================================================

export const DESIGN_TOKENS = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  breakpoints: BREAKPOINTS,
  transitions: TRANSITIONS,
  safeArea: SAFE_AREA,
  utilityClasses: UTILITY_CLASSES,
} as const;

// Type exports for convenience
export type DesignTokens = typeof DESIGN_TOKENS;
export type ColorTokens = typeof COLORS;
export type SpacingTokens = typeof SPACING;
export type TypographyTokens = typeof TYPOGRAPHY;
export type BorderRadiusTokens = typeof BORDER_RADIUS;
export type ShadowTokens = typeof SHADOWS;
export type BreakpointTokens = typeof BREAKPOINTS;
export type TransitionTokens = typeof TRANSITIONS;
export type SafeAreaTokens = typeof SAFE_AREA;
export type UtilityClassTokens = typeof UTILITY_CLASSES;
