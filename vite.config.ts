import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const reactSingletonPath = path.resolve(__dirname, './src/lib/react-singleton.ts');
const reactOriginalPath = path.resolve(__dirname, './node_modules/react/index.js');
const reactJsxRuntimePath = path.resolve(__dirname, './node_modules/react/jsx-runtime.js');
const reactJsxDevRuntimePath = path.resolve(__dirname, './node_modules/react/jsx-dev-runtime.js');

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
  ],
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
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
      onwarn(warning, warn) {
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
      output: {
        manualChunks: undefined
      }
    },
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    minify: mode === 'production' ? 'esbuild' : false,
    target: 'es2020',
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
