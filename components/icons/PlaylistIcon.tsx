
/// <reference types="react/jsx-runtime" />
declare global {
  namespace JSX {
    interface IntrinsicElements {
      []: any;
    }
  }
}

import type React from 'react';

const PlaylistIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 10h16M4 14h10m6-1v5l-3.5-2.5L20 13V8l-4 2.5V13z" />
    {/* A slightly different playlist icon with a more distinct play symbol part */}
  </svg>
);

export default PlaylistIcon;
