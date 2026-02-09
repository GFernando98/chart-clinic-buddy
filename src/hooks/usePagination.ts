import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  initialItemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  paginatedItems: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
}

export function usePagination<T>({
  items,
  initialItemsPerPage = 10,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to page 1 if items change and current page is out of range
  const validPage = useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      return 1;
    }
    if (currentPage < 1) {
      return 1;
    }
    return currentPage;
  }, [currentPage, totalPages]);

  // Update current page if it becomes invalid
  if (validPage !== currentPage) {
    setCurrentPage(validPage);
  }

  const paginatedItems = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, validPage, itemsPerPage]);

  const handleSetItemsPerPage = (count: number) => {
    setItemsPerPageState(count);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    paginatedItems,
    currentPage: validPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
  };
}
