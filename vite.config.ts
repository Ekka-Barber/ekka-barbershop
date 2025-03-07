
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { createHtmlPlugin } from "vite-plugin-html";
import compression from "vite-plugin-compression";
import type { OutputAsset } from 'rollup';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Remove the emotion configuration
      // Use faster babel transforms
      devTarget: "esnext"
    }),
    mode === 'development' &&
    componentTagger(),
    // Generate GZIP compressed files for production
    mode === 'production' && 
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Generate BROTLI compressed files for production
    mode === 'production' && 
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Inject preload/prefetch directives in HTML
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          preloadFonts: mode === 'production',
          deferScripts: mode === 'production',
        }
      }
    }),
    // Bundle visualization for production builds
    mode === 'production' &&
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: 'es2018',
    cssCodeSplit: true,
    // Improve chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-toast'],
          'utils-vendor': ['date-fns', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'charts': ['recharts'],
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
        },
        // Improve chunk naming
        chunkFileNames: mode === 'production' 
          ? 'assets/js/[name]-[hash].js' 
          : 'assets/js/[name].js',
        // Put CSS in dedicated files
        assetFileNames: (info) => {
          if (info.name && info.name.endsWith('.css')) return 'assets/css/[name]-[hash].css';
          if (info.name && info.name.match(/\.(woff2?|ttf|eot)$/)) return 'assets/fonts/[name]-[hash][extname]';
          if (info.name && info.name.match(/\.(png|jpe?g|gif|svg|webp)$/)) return 'assets/img/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Improve minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf.worker.min.js'],
    // Exclude large dependencies from optimization to improve build time
    exclude: ['react-pdf'],
  },
  // CSS optimization
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [],
    },
  },
}));
