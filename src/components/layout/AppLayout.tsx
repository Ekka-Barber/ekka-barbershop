import React from 'react';

type AppLayoutProps = {
  children: React.ReactNode;
};

// This layout assumes the CSS variables --sal, --sar, --sab, and --content-spacing (defined in App.css root) are available globally.
// It replaces the structure previously handled by .app-container and .content-area classes.
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    // Outer flex container to center content horizontally
    <div className="flex flex-1 justify-center w-full">
      {/* Removed max-w-md to allow content width to be page-specific */}
      <div className="w-full flex flex-1 flex-col">
        {/* Main content area with padding for safe areas */}
        <main className="flex-1 w-full px-[calc(1rem+var(--sal))] pr-[calc(1rem+var(--sar))] pb-[calc(1rem+var(--sab))]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 
