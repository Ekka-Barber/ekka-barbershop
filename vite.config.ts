
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
      '/api/places': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://example.com');
          const placeId = url.searchParams.get('placeId');
          const apiKey = url.searchParams.get('apiKey');
          const language = url.searchParams.get('language') || 'en';
          return `/maps/api/place/details/json?place_id=${placeId}&fields=reviews,reviews_sort&key=${apiKey}&language=${language}&reviews_sort=newest`;
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
