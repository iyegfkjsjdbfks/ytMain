import React from "react";
import { type ClassValue, clsx } from 'clsx';

import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and merges Tailwind classes with tailwind-merge
 * @param inputs - Class values to combine and merge
 * @returns A single string of combined and merged class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Export as default for convenience
export default cn;
