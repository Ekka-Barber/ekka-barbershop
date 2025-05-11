
import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  ...props
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    if (currentPage > 2) {
      pages.push(1);
    }
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      pages.push("ellipsis-start");
    }

    // Show current page and neighbors
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push("ellipsis-end");
    }

    // Always show last page if there is more than one page
    if (totalPages > 1 && totalPages !== currentPage) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={cn("flex items-center justify-center space-x-1", className)} {...props}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="h-8 w-8 p-0"
      >
        <span className="sr-only">Previous page</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {totalPages > 0 && getPageNumbers().map((page, i) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <div key={`ellipsis-${i}`} className="flex items-center justify-center h-8 w-8">
              <span className="text-sm text-muted-foreground">...</span>
            </div>
          );
        }

        return (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof page === "number" && onPageChange(page)}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Page {page}</span>
            <span>{page}</span>
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="h-8 w-8 p-0"
      >
        <span className="sr-only">Next page</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
