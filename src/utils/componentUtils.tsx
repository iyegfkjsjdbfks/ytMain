/// <reference types="react/jsx-runtime" />
import React, { type ReactNode } from 'react';


/**
 * Safely render an array of items as React components
 *
 * This utility function helps prevent common rendering issues with arrays:
 * 1. Handles empty or null arrays
 * 2. Provides proper key extraction
 * 3. Filters out undefined items
 *
 * @param items Array of items to render
 * @param renderItem Function to render each item
 * @param keyExtractor Function to extract unique key for each item
 * @returns Array of React nodes
 */
export const safeArrayRender = <T, >(
  items: T[] | null | undefined,
  renderItem: (item: T, index: number) => ReactNode,
  keyExtractor?: (item: T, index: number) => string | number,
): ReactNode[] => {
  if (!items || !Array.isArray(items)) {
return [];
}

  return items
    .filter((item): item is T => item !== undefined && item !== null)
    .map((item, index) => {
      const key = keyExtractor ? keyExtractor(item, index) : index;
      return (
        <React.Fragment key={key}>
          {renderItem(item, index)}
        </React.Fragment>
      );
    });
};

/**
 * Safely render a conditional element in React
 *
 * @param condition Boolean condition to check
 * @param component Component to render if condition is true
 * @param fallback Optional fallback component if condition is false
 * @returns React node or null
 */
export const renderIf = (
  condition: any,
  component: ReactNode,
  fallback: ReactNode = null,
): ReactNode => {
  return condition ? component : fallback;
};

/**
 * Create a unique ID for DOM elements
 *
 * @param prefix Optional prefix for the ID
 * @returns Unique ID string
 */
export const createUniqueId = (prefix = 'component'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Chunk an array into smaller arrays of a specified size
 * Useful for grid layouts and pagination
 *
 * @param array Array to chunk
 * @param size Size of each chunk
 * @returns Array of chunks
 */
export const chunkArray = <T, >(array: T, size: any): T[][] => {
  if (!array.length) {
return [];
}

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
};


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
