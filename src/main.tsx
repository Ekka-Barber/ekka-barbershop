
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './animations.css';

// Function to prefetch critical API data
const prefetchCriticalData = async () => {
  try {
    const { supabase } = await import('./integrations/supabase/client');
    // Prefetch branches data which is needed on the Customer page
    const { data } = await supabase.from('branches').select('*');
    
    // Store in sessionStorage for immediate use
    if (data) {
      sessionStorage.setItem('prefetched_branches', JSON.stringify(data));
      console.log('Successfully prefetched branches data');
    }
  } catch (error) {
    console.error('Error prefetching data:', error);
  }
};

// Add performance monitoring in development only
if (import.meta.env.DEV) {
  const reportWebVitals = async () => {
    const { onCLS, onFID, onLCP, onFCP, onTTFB } = await import('web-vitals');
    onCLS(console.log);
    onFID(console.log);
    onLCP(console.log);
    onFCP(console.log);
    onTTFB(console.log);
  };
  reportWebVitals();
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

// Render app with a loading fallback for Suspense
root.render(
  <React.StrictMode>
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);

// Start prefetching after the app has rendered
if (window.requestIdleCallback) {
  window.requestIdleCallback(prefetchCriticalData);
} else {
  setTimeout(prefetchCriticalData, 1000);
}
