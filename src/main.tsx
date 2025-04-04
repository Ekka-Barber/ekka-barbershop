
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from '@/services/offlineSupport';
import { logger } from '@/utils/logger';

// Register service worker for offline support
// We'll register it after a slight delay to prioritize initial rendering
setTimeout(() => {
  registerServiceWorker().catch(error => {
    logger.error('Service worker registration failed:', error);
  });
}, 3000);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetch on window focus
      retry: 1, // Limit retries to reduce network activity
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Apply momentum scrolling to root element
rootElement.classList.add('momentum-scroll');

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
