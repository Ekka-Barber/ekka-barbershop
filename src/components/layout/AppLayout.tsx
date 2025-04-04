
import React from 'react';

type AppLayoutProps = {
  children: React.ReactNode;
};

// This layout is updated to work with our new scrolling behavior
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    // Outer flex container to center content horizontally
    <div className="flex flex-1 justify-center w-full h-full momentum-scroll overflow-y-auto overscroll-contain">
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
