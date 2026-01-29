import React from 'react';

type AppLayoutProps = {
  children: React.ReactNode;
};

// This layout is updated to work with our new scrolling behavior
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    // Fixed-height scroll container to avoid body scroll lock on Android
    <div className="flex h-[100dvh] w-full justify-center overflow-hidden">
      <div className="w-full flex flex-col min-h-0">
        <main
          className="w-full flex-1 min-h-0 overflow-y-auto momentum-scroll touch-action-pan-y"
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
