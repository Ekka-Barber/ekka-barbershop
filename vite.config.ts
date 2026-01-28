import path from 'path';

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression for static assets
    compression({
      algorithms: ['gzip'],
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024, // Only compress files > 1KB
    }),
    // Brotli compression for better compression ratios
    compression({
      algorithms: ['brotliCompress'],
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared/ui': path.resolve(__dirname, './packages/ui/src'),
      '@shared/lib': path.resolve(__dirname, './packages/shared/src/lib'),
      '@shared/types': path.resolve(__dirname, './packages/shared/src/types'),
      '@shared/hooks': path.resolve(__dirname, './packages/shared/src/hooks'),
      '@shared/utils': path.resolve(__dirname, './packages/shared/src/utils'),
      '@shared/constants': path.resolve(__dirname, './packages/shared/src/constants'),
      '@shared/services': path.resolve(__dirname, './packages/shared/src/services'),
      '@shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['zustand', '@tanstack/react-query'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'tailwindcss-animate',
            'sonner',

          ],
          'vendor-icons': ['lucide-react'],
          'vendor-charts': ['recharts'],
          // 'vendor-react-pdf': ['@react-pdf/renderer'], // Removed - using jsPDF/html2canvas instead
          // PDF libraries removed from manualChunks to prevent unwanted preloading
          // They will be automatically code-split and only loaded when PDF features are used
          // Previously: 'vendor-jspdf': ['jspdf', 'html2canvas'] - caused 576KB preload on all routes
          'vendor-dnd': ['@hello-pangea/dnd'],
          'vendor-animation': ['framer-motion'],
           'vendor-dates': ['date-fns', 'react-day-picker'],
          'vendor-supabase': [
            '@supabase/auth-helpers-react',
            '@supabase/auth-ui-react',
            '@supabase/auth-ui-shared',
            '@supabase/supabase-js',
          ],
        },
      },
    },
  },
});
