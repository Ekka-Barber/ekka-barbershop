import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const reactSingletonPath = path.resolve(__dirname, './src/lib/react-singleton.ts');
const reactOriginalPath = path.resolve(__dirname, './node_modules/react/index.js');
const reactJsxRuntimePath = path.resolve(__dirname, './node_modules/react/jsx-runtime.js');
const reactJsxDevRuntimePath = path.resolve(__dirname, './node_modules/react/jsx-dev-runtime.js');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: /^react$/, replacement: reactSingletonPath },
      { find: /^react-original$/, replacement: reactOriginalPath },
      { find: /^react\/jsx-runtime$/, replacement: reactJsxRuntimePath },
      { find: /^react\/jsx-dev-runtime$/, replacement: reactJsxDevRuntimePath },
    ],
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'framer-motion'],
  },
  // Ensure React is always available globally
  define: {
    global: 'globalThis',
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
          // CRITICAL: React and React-DOM must NEVER be split - they must always be in the main bundle
          // This ensures lazy-loaded components always use the same React instance
          if (id.includes('node_modules')) {
            // React core - must be in main bundle, never split
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react/jsx-runtime')) {
              // Don't return a chunk name - this keeps React/React-DOM in the main bundle
              return;
            }
            if (id.includes('react-router') || id.includes('framer-motion') || id.includes('recharts')) {
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
    chunkSizeWarningLimit: 2000,
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
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'recharts',
      'date-fns',
      'lodash',
      'clsx',
      'framer-motion',
      '@emotion/is-prop-valid',
      '@emotion/memoize'
    ],
    // Force React to be deduplicated and always available
    force: true,
    esbuildOptions: {
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
  }
}));
