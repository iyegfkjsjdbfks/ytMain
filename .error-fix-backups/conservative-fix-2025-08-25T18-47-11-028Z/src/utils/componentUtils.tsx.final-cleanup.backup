// Component Utils - Minimal Implementation
import React, { ReactNode } from 'react';

export const safeArrayRender = <T>(
  items: T[] | null | undefined,
  renderItem: (item: T, index: number) => ReactNode,
  keyExtractor?: (item: T, index: number) => string | number
): ReactNode[] => {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is T => item !== undefined && item !== null)
    .map((item, index) => {
      const key = keyExtractor ? keyExtractor(item, index) : index;
      return React.cloneElement(
        renderItem(item, index) as React.ReactElement,
        { key }
      );
    });
};

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P): ReactNode => {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      console.error('Component error:', error);
      return React.createElement('div', null, 'Error rendering component');
    }
  };
};

export const createUniqueId = (prefix = 'component'): string => {
  return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  if (!Array.isArray(array) || size <= 0) {
    return [];
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
};