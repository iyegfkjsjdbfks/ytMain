import React from 'react';
import { FC } from 'react';
const ShortsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }: any) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.535 8.168L9.244 5.314a.75.75 0 00-1.136.644v5.95l-2.181-1.26a.75.75 0 00-1.136.645v5.296a.75.75 0 001.136.644l2.181-1.26v1.646a.75.75 0 001.136.644l8.582-4.955a.75.75 0 000-1.289l-4.291-2.476zm-.882 3.007L16.26 13.03v-2.186l-3.607-2.082v5.413zM8.858 11.69l3.607 2.082V8.359L8.858 10.44v1.25zM6.927 15.36l1.181-.682v-3.482l-1.181-.681v4.845z"
    />
  </svg>
);

export default ShortsIcon;
