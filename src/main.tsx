
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Dynamically import App for code splitting
const App = React.lazy(() => import('./App.tsx'));

// Add error boundary for better error handling
const ErrorFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
    <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
    <p className="mb-4">The application failed to load. Please try refreshing the page.</p>
    <button 
      onClick={() => window.location.reload()} 
      className="px-4 py-2 bg-[#C4A36F] text-white rounded-md"
    >
      Refresh Page
    </button>
  </div>
);

// Implement progressive loading with suspense
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

// Load a minimal loading spinner while the app loads
const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#C4A36F] animate-spin"></div>
  </div>
);

// Report web vitals for better performance monitoring
const reportWebVitals = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', () => {
      // Use requestIdleCallback to avoid blocking the main thread
      const requestIdleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      requestIdleCallback(() => {
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationTiming) {
          // Log key metrics
          console.log(`Time to Interactive: ${navigationTiming.domInteractive}ms`);
          console.log(`First Contentful Paint: ${performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 'N/A'}ms`);
        }
      });
    });
  }
};

// Add performance observer for CLS, LCP
if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log(`[Performance] ${entry.name}: ${entry.startTime.toFixed(0)}ms`);
      });
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.error('Performance observer error:', e);
  }
}

// Render the application with error boundaries and suspense
root.render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingSpinner />}>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <App />
      </ErrorBoundary>
    </React.Suspense>
  </React.StrictMode>
);

// Report performance metrics
reportWebVitals();
