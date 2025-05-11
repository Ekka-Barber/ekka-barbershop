import React from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis,
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SalaryHistoryPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const SalaryHistoryPagination: React.FC<SalaryHistoryPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always include first page, last page, current page, and one page before and after current
    const includePages = new Set([
      1, 
      totalPages, 
      currentPage, 
      currentPage - 1, 
      currentPage + 1
    ]);
    
    // Add valid page numbers to array
    for (let i = 1; i <= totalPages; i++) {
      if (includePages.has(i) && i > 0 && i <= totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Sort and remove duplicates
    return [...new Set(pageNumbers)].sort((a, b) => a - b);
  };
  
  // Show ellipsis between non-consecutive pages
  const renderPageLinks = () => {
    const pageNumbers = getPageNumbers();
    const result = [];
    
    for (let i = 0; i < pageNumbers.length; i++) {
      const pageNumber = pageNumbers[i];
      
      // Add page link
      result.push(
        <PaginationItem key={`page-${pageNumber}`}>
          <PaginationLink 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onPageChange(pageNumber);
            }}
            isActive={pageNumber === currentPage}
          >
            {pageNumber}
          </PaginationLink>
        </PaginationItem>
      );
      
      // Add ellipsis if needed
      if (i < pageNumbers.length - 1 && pageNumbers[i + 1] - pageNumber > 1) {
        result.push(
          <PaginationItem key={`ellipsis-${pageNumber}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    return result;
  };
  
  // Calculate displaying records info text
  const getItemsInfo = () => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return `Showing ${start}-${end} of ${totalItems} records`;
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
      <div className="text-sm text-muted-foreground">
        {getItemsInfo()}
      </div>
      
      <div className="flex items-center gap-3">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="10 per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    onPageChange(currentPage - 1);
                  }
                }}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {renderPageLinks()}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    onPageChange(currentPage + 1);
                  }
                }}
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default SalaryHistoryPagination; 