
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Add compression plugins for production builds
    mode === 'production' && compression({ algorithm: 'gzip', exclude: [/\.(br)$/, /\.(gz)$/] }),
    mode === 'production' && compression({ algorithm: 'brotliCompress', exclude: [/\.(gz)$/, /\.(br)$/] }),
    // Add bundle visualizer in analyze mode
    mode === 'analyze' && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    // Extract CSS into separate chunks
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    sourcemap: false,
    // Improved minification and optimization settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // CSS code splitting - enable to create separate CSS chunks
    cssCodeSplit: true,
    // Chunk strategy optimization
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-slot', 
            '@radix-ui/react-toast',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
          'form-vendor': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'utils-vendor': ['date-fns', 'class-variance-authority', 'clsx', 'tailwind-merge', 'lodash'],
          'chart-vendor': ['recharts'],
          'admin': ['/src/pages/Admin.tsx'],
          'critical-css': ['/src/critical.css'],
          'animations': ['/src/animations.css'],
        },
        // Add asset fingerprinting and cache optimization
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // Limit asset inlining size
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf.worker.min.js'],
    // Optimize dependencies on startup
    esbuildOptions: {
      target: 'es2020',
    },
  },
}));
