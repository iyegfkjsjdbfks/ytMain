
/// <reference types="react/jsx-runtime" />
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
// TODO: Fix import - import type React from 'react';

// Solid Chat Bubble Icon
const SolidChatBubbleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M4.804 21.642l.094-.048a11.346 11.346 0 01-2.038-4.55C1.986 14.79 1.5 12.265 1.5 9.75 1.5 4.358 6.358 0 11.75 0S22 4.358 22 9.75c0 5.082-4.134 9.262-9.348 9.34L12.5 19.1l.087.086-2.56 2.456zM9 11.25a.75.75 0 100-1.5.75.75 0 000 1.5zm3.75-.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
  </svg>
);

export { SolidChatBubbleIcon as ChatBubbleOvalLeftEllipsisIcon };
export default SolidChatBubbleIcon; // Default export for convenience
