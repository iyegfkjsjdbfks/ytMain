import React from 'react';
import { FC } from 'react';
const MenuIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }: any) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

export default MenuIcon;
