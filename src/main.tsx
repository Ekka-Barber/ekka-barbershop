
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { disableConsoleLogging } from '@/utils/disableConsoleLogging';
import { disableErrorLogging } from '@/utils/disableErrorLogging';

// Disable all console and error logging
disableConsoleLogging();
disableErrorLogging();

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

// Wrap App with React.StrictMode, QueryClientProvider, and BrowserRouter
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
