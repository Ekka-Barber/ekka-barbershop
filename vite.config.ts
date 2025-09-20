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
    host: "localhost",
    hmr: {
      port: 9913,
    },
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
          'vendor-motion': ['framer-motion'],
          'vendor-utils': ['date-fns', 'lodash', 'clsx', 'class-variance-authority'],
          
          // Granular admin feature chunks for better code splitting
          'admin-qr-management': [
            'src/components/admin/QRCodeManager.tsx',
            'src/components/admin/qr-code/QRCodeList.tsx',
            'src/components/admin/qr-code/UpdateQRCodeUrl.tsx'
          ],
          'admin-qr-display': [
            'src/components/admin/QRCodeDisplay.tsx',
            'src/components/admin/CreateQRCodeForm.tsx'
          ],
          'admin-qr-analytics': [
            'src/components/admin/qr-code/QRCodeAnalytics.tsx',
            'src/components/admin/qr-code/analytics/AnalyticsFilters.tsx',
            'src/components/admin/qr-code/analytics/BreakdownCard.tsx',
            'src/components/admin/qr-code/analytics/OverviewCard.tsx',
            'src/components/admin/qr-code/analytics/ScanDetailsCard.tsx'
          ],
          'admin-files': [
            'src/components/admin/FileManagement.tsx',
            'src/components/admin/file-management/FileListItem.tsx',
            'src/components/admin/file-management/FileListSection.tsx',
            'src/components/admin/file-management/FileUploadSection.tsx',
            'src/components/admin/file-management/FileEndDateManager.tsx'
          ],
          'admin-services': [
            'src/components/admin/ServiceCategoryList.tsx',
            'src/components/admin/ServiceItem.tsx',
            'src/components/admin/CategoryDialog.tsx',
            'src/components/admin/ServiceDialog.tsx',
            'src/components/admin/ServiceForm.tsx',
            'src/components/admin/service-management/ServiceManagementHeader.tsx',
            'src/components/admin/service-management/ServiceBranchAssignment.tsx',
            'src/components/admin/service-management/EmptyServiceState.tsx',
            'src/components/admin/service-management/ServiceCategorySkeleton.tsx',
            'src/components/admin/service-form/BasicServiceInfo.tsx',
            'src/components/admin/service-form/PricingSection.tsx',
            'src/components/admin/service-form/ServiceDescriptions.tsx',
            'src/components/admin/category-management/CategoryActions.tsx',
            'src/components/admin/category-management/CategoryBranchAssignment.tsx',
            'src/components/admin/category-management/CategoryList.tsx'
          ],
          'admin-branches': [
            'src/components/admin/branch-management/BranchesTab.tsx',
            'src/components/admin/branch-management/BranchForm.tsx',
            'src/components/admin/branch-management/BranchList.tsx'
          ],
          'admin-ui-elements': [
            'src/components/admin/ui-elements/UiElementsManager.tsx',
            'src/components/admin/ui-elements/EditElementDialog.tsx',
            'src/components/admin/ui-elements/IconSelectorDialog.tsx'
          ],
          'admin-google-ads': [
            'src/components/admin/GoogleAdsTab.tsx'
          ],
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
    chunkSizeWarningLimit: 500,
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
  }
}));
