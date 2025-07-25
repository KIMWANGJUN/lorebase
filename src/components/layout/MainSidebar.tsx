// src/components/layout/MainSidebar.tsx
import React from 'react';

const MainSidebar = () => {
  return (
    <aside className="hidden w-64 flex-shrink-0 md:block">
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] py-6 pr-6">
        <nav className="flex flex-col space-y-2">
          <a href="/community/channels/general">Community</a>
          <a href="/free-assets">Free Assets</a>
          <a href="/profile">Profile</a>
          {/* Add more links as needed */}
        </nav>
      </div>
    </aside>
  );
};

export default MainSidebar;
