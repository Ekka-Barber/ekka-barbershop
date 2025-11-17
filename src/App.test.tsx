import { render, screen } from '@testing-library/react';
// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests for simplicity
    },
  },
});

describe('App', () => {
  it('renders the main App component without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}> 
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );
    // Check for the main landmark role, which seems present on the Customer page render
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  // Add more tests here later
}); 
