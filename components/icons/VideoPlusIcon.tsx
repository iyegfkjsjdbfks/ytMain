import React, { FC } from 'react';
const VideoPlusIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }: any) => (
 <svg
 className={className}
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 xmlns="http://www.w3.org/2000/svg"
 aria-hidden="true"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18V6a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V18a2 2 0 01-2 2H7a2 2 0 01-2-2zm4-6h4m-2-2v4" />
 </svg>
);

export default VideoPlusIcon;
