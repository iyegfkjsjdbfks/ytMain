import React, { FC } from 'react';
const SaveIconFilled: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }: any) => (
 <svg
// FIXED:  className={className}
 fill="currentColor"
 stroke="currentColor" // Keep stroke for consistency if paths use it
 viewBox="0 0 24 24"
 xmlns="http://www.w3.org/2000/svg"
// FIXED:  aria-hidden="true" />
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
// FIXED:  </svg>
);

export default SaveIconFilled;
