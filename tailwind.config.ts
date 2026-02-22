import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './packages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      fontFamily: {
        sans: ['IBM Plex Sans Arabic', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          gold: {
            50: '#fff9f0',
            100: '#f9e7c7',
            200: '#f2d197',
            300: '#efc780',
            400: '#e9b353',
            500: '#e39f26',
            600: '#d18b1a',
            700: '#b77512',
          },
          gray: {
            50: '#f8f8f8',
            100: '#f1f1f1',
            200: '#e0e0e0',
            300: '#c8c8c8',
            500: '#5a5a5a',
            600: '#4a4a4a',
            700: '#3a3a3a',
            800: '#2a2a2a',
            900: '#1a1a1a',
          },
        },
        'brand-primary': '#e9b353',
        'brand-secondary': '#4A4A4A',
      },
      spacing: {
        'content': 'var(--content-spacing, 1rem)',
        'safe-t': 'var(--sat)',
        'safe-r': 'var(--sar)',
        'safe-b': 'var(--sab)',
        'safe-l': 'var(--sal)',
      },
      height: {
        'header': 'calc(var(--header-height, 2.75rem) + var(--sat))',
        'bottom-nav': 'var(--bottom-nav-height, 4rem)',
      },
      maxHeight: {
        'header': 'calc(var(--header-height, 2.75rem) + var(--sat))',
      },
      minHeight: {
        'tap-target': '44px',
      },
      maxWidth: {
        'app': 'var(--app-max-width, 28rem)',
      },
       borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 12px -4px rgba(0, 0, 0, 0.08)',
        'dialog': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'gold': '0 10px 40px -10px rgba(233, 179, 83, 0.5)',
        'gold-light': '0 4px 12px -4px rgba(233, 179, 83, 0.3)',
      },
      zIndex: {
        'toast': '100',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'overlay': '1200',
        'modal': '1210',
        'popover': '1300',
        'tooltip': '1400',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast, 150ms)',
        'medium': 'var(--transition-medium, 250ms)',
        'slow': 'var(--transition-slow, 350ms)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "pulse-once": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.1)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.05)' },
          '60%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(5px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scale: {
          from: { transform: 'scale(0.95)' },
          to: { transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-once": "pulse-once 0.5s ease-in-out",
        'heart-beat': 'heart-beat 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        scale: 'scale 0.2s ease-out',
        pulse: 'pulse 1.5s infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
