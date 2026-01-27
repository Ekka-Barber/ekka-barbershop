import { useState } from 'react';

import { Employee } from '@shared/types/domains';

const ITEMS_PER_PAGE = 10;

export const usePaginatedEmployees = (employees: Employee[] = []) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEmployees = employees.slice(startIndex, endIndex);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    currentEmployees,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};
