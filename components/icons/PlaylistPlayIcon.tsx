import React, { FC } from 'react';
const PlaylistPlayIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }: any) => (
 <svg;
// FIXED:  className={className}
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 xmlns="http://www.w3.org/2000/svg"
// FIXED:  aria-hidden="true" />
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h10M4 18h10m6-4v4m0 0l-4-2m4 2l4-2" />
// FIXED:  </svg>
);
// This icon combines list lines with a play symbol, suitable for "Liked Videos" or general playlists.

export default PlaylistPlayIcon;