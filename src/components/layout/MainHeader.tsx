// src/components/layout/MainHeader.tsx
import React from 'react';

const MainHeader = () => {
  return (
    // Removed sticky, z-index, and backdrop-blur properties
    // Kept w-full, border-b, and bg-background for basic styling if it's meant to be a section header
    <header className="w-full border-b bg-background">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
          </a>
        </div>
        {/* Add other header content like navigation, user menu, etc. */}
      </div>
    </header>
  );
};

export default MainHeader;
