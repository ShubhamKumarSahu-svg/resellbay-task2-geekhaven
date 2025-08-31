'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export const AppPagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) {
    return null;
  }

  const { page, pages } = pagination;

  const handlePrevious = (e) => {
    e.preventDefault();
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (page < pages) {
      onPageChange(page + 1);
    }
  };

  const handlePageClick = (e, pageNum) => {
    e.preventDefault();
    onPageChange(pageNum);
  };

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePrevious}
            disabled={page === 1}
            aria-disabled={page === 1}
          />
        </PaginationItem>
        {[...Array(pages).keys()].map((p) => (
          <PaginationItem key={p + 1}>
            <PaginationLink
              href="#"
              isActive={page === p + 1}
              onClick={(e) => handlePageClick(e, p + 1)}
            >
              {p + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handleNext}
            disabled={page === pages}
            aria-disabled={page === pages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
