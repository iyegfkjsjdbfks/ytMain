
/// <reference types="react/jsx-runtime" />
declare global {
  namespace JSX {
    interface IntrinsicElements {
      []: any;
    }
  }
}
import type React from 'react';

const ThumbsDownIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M18 9.5a1.5 1.5 0 11-3 0V3.5a1.5 1.5 0 013 0v6zM14 9.667V4.237a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0010.058 2H4.642a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 003.439 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.2-2.467a4 4 0 00.865-2.4z" />
  </svg>
);

export default ThumbsDownIcon;
