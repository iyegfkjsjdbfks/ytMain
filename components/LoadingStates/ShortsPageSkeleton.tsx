import React, { FC } from 'react';

import type React from 'react';

const ShortsPageSkeleton: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center bg-black">
      <p className="text-white text-lg">Loading Shorts...</p>
    </div>
  );
};

export default ShortsPageSkeleton;