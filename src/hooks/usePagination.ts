
import { useState, useMemo, useCallback } from 'react';

interface UsePaginationProps {
  totalCount: number;
  pageSize: number;
  siblingCount?: number;
  initialPage?: number;
}

export const DOTS = '...';

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

/**
 * Custom hook for managing pagination logic.
 * @param totalCount - Total number of items.
 * @param pageSize - Number of items per page.
 * @param siblingCount - Number of page numbers to show on each side of the current page (default: 1).
 * @param initialPage - The initial active page (default: 1).
 * @returns Pagination range, current page, and functions to control pagination.
 */
export function usePagination({
  totalCount,
  pageSize,
  siblingCount = 1,
  initialPage = 1,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize);

    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    /*
      Case 1: If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPageCount]
    */
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount,
    );

    /*
      We do not show dots just when there is just one page number to be inserted between
      the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence,
      whether to show dots is decided by if the left sibling index is greater than 2
      and the right sibling index is less than totalPageCount - 2.
    */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    /*
      Case 2: No left dots to show, but rights dots to be shown
    */
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);

      return [...leftRange, DOTS, totalPageCount];
    }

    /*
      Case 3: No right dots to show, but left dots to be shown
    */
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount,
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    /*
      Case 4: Both left and right dots to be shown
    */
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    // Should not happen, but as a fallback
    return range(1, totalPageCount);

  }, [totalCount, pageSize, siblingCount, currentPage]);

  const goToPage = useCallback((pageNumber: number) => {
    const totalPageCount = Math.ceil(totalCount / pageSize);
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPageCount)));
  }, [totalCount, pageSize]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const canNextPage = useMemo(() => currentPage < Math.ceil(totalCount / pageSize), [currentPage, totalCount, pageSize]);
  const canPrevPage = useMemo(() => currentPage > 1, [currentPage]);

  return {
    currentPage,
    paginationRange,
    goToPage,
    nextPage,
    prevPage,
    canNextPage,
    canPrevPage,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}