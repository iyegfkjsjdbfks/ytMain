import React, { FC } from 'react';

import type React from 'react';

// Using a Heroicons v2 style path for ArrowUturnRightIcon (Share-like icon)
const ArrowUturnRightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
    />
  </svg>
);
// This is a common representation for "Share" or "Forward".
// If a different "Share" icon is preferred (like the three connected dots), it can be changed.
// For simplicity and consistency with Heroicons, this one is used.
export default ArrowUturnRightIcon;