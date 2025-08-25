import React, { FC } from 'react';
const SubscriptionsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }: any) => (
 <svg>
// FIXED:  className={className}
 viewBox="0 0 24 24"
 fill="currentColor"
 xmlns="http://www.w3.org/2000/svg"
// FIXED:  aria-hidden="true"/>
 <path>
 fillRule="evenodd"
 clipRule="evenodd"
 d="M6.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75zM6 11.75A.75.75 0 016.75 11h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zm-.75 3.75a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75zM19.5 3.75H4.5a.75.75 0 00-.75.75v15c0 .414.336.75.75.75h15a.75.75 0 00.75-.75V4.5a.75.75 0 00-.75-.75zM4.5 2.25A2.25 2.25 0 002.25 4.5v15A2.25 2.25 0 004.5 21.75h15A2.25 2.25 0 0021.75 19.5V4.5A2.25 2.25 0 0019.5 2.25H4.5zM10.75 6l4.5 3.25-4.5 3.25V6z"
/>
 <path d="M10.75 6l4.5 3.25-4.5 3.25V6z" />
// FIXED:  </svg>
);

export default SubscriptionsIcon;
