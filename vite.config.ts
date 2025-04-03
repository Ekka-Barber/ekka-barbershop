
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/places/reviews': {
        target: 'https://maps.googleapis.com/maps/api',
        changeOrigin: true,
        rewrite: (path) => {
          // Get language from the request URL if available, default to 'en'
          const url = new URL(path, 'http://example.com');
          const placeId = url.searchParams.get('placeId');
          const apiKey = url.searchParams.get('apiKey');
          const lang = url.searchParams.get('language') || 'en'; // Get language param
          // Pass language to the Google API
          return `/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}&language=${lang}`;
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
    sourcemap: false,
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
}));
