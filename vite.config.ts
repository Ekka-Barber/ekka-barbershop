import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 9913,
    host: "0.0.0.0",
    strictPort: false, // Allow Vite to automatically find available port if 9913 is busy
    hmr: {
      host: "localhost",
      overlay: false // Disable error overlay for better performance
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor libraries - group related packages
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('framer-motion')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('react-pdf') || id.includes('pdfjs')) {
              return 'vendor-pdf';
            }
            // Group smaller utilities together
            if (id.includes('date-fns') || id.includes('lodash') || id.includes('clsx') ||
                id.includes('class-variance-authority') || id.includes('tailwind-merge')) {
              return 'vendor-utils';
            }
          }

          // Feature-based chunks for large components
          if (id.includes('src/components/PDFViewer.tsx')) {
            return 'pdf-viewer';
          }
        },
        // Optimize chunk file names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.\w+$/, '')
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const extType = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(extType || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      }
    },
    // Enable source maps for better debugging in development
    sourcemap: mode === 'development',
    // Increase chunk size warning limit to reduce noise
    chunkSizeWarningLimit: 1500,
    // Enable minification in production only
    minify: mode === 'production' ? 'esbuild' : false,
    // Target modern browsers for better performance
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Enable optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'recharts',
      'date-fns',
      'lodash',
      'clsx'
    ],
    // Exclude problematic dependencies
    exclude: []
  }
}));
