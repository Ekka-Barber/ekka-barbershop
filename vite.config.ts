import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Add this import for Vitest config types
import type { UserConfig } from 'vite';
import type { InlineConfig } from 'vitest';

interface VitestConfigExport extends UserConfig {
  test: InlineConfig;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Vitest configuration
  test: {
    globals: true, // Use global APIs like describe, it, expect
    environment: 'jsdom', // Simulate browser environment
    setupFiles: './src/setupTests.ts', // Run setup file before tests
    css: false, // Disable CSS processing for speed, can enable if needed
  },
  server: {
    host: "::",
    port: 4141,
    proxy: {
      '/api/places': {
        target: 'https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/google-places',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://example.com');
          return url.search;
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-toast'],
          'utils-vendor': ['date-fns', 'class-variance-authority', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf.worker.min.js'],
  },
}) as VitestConfigExport); // Cast the config object
