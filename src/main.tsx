
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add performance monitoring in development
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

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
