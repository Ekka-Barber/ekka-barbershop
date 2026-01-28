import React from 'react';

type AppLayoutProps = {
  children: React.ReactNode;
};

// This layout is updated to work with our new scrolling behavior
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    // Outer flex container to center content horizontally
    <div
      className="flex min-h-screen w-full justify-center"
      style={{ minHeight: '100dvh' }}
    >
      {/* Removed max-w-md to allow content width to be page-specific */}
      <div className="w-full flex flex-col">
        {/* Main content area with comprehensive safe area support for iOS notches */}
        <main
          className="w-full flex-1"
          style={{
            paddingLeft: 'calc(1rem + var(--sal))',
            paddingRight: 'calc(1rem + var(--sar))',
            paddingBottom: 'calc(0.5rem + var(--sab))',
            paddingTop: 'var(--sat)' // Add top safe area for dynamic island
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 
