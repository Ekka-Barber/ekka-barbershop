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
    host: "::"
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-toast'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['react-pdf'],
          'vendor-motion': ['framer-motion'],
          'vendor-utils': ['date-fns', 'lodash', 'clsx', 'class-variance-authority'],
          
          // Feature chunks
          'admin-components': [
            'src/components/admin/QRCodeManager.tsx',
            'src/components/admin/FileManagement.tsx',
            'src/components/admin/qr-code/QRCodeAnalytics.tsx'
          ],
          'pdf-viewer': ['src/components/PDFViewer.tsx'],
          'customer-components': [
            'src/components/customer/GoogleReviews.tsx',
            'src/components/customer/BranchDialog.tsx'
          ]
        }
      }
    },
    // Enable source maps for better debugging in production
    sourcemap: mode === 'development',
    // Optimize chunk size threshold
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: mode === 'production' ? 'esbuild' : false,
  },
  // Enable optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
    exclude: [
      'react-pdf' // This will be lazy loaded
    ]
  }
}));
