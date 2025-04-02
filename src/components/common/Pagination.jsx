import React from "react";
import { cn } from "../../utils/helpers";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./Button";

/**
 * Pagination Component
 * Navigation for repository lists
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  siblingCount = 1,
}) => {
  // Generate page range
  const generatePageRange = () => {
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + first + last + current

    // If total pages is less than the page numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Case 1: Show left dots but no right dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 1 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, "leftDots", ...rightRange];
    }

    // Case 2: Show right dots but no left dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 1 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "rightDots", totalPages];
    }

    // Case 3: Show both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, "leftDots", ...middleRange, "rightDots", totalPages];
    }
  };

  const pages = generatePageRange();

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn("flex items-center justify-center space-x-1", className)}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="hidden sm:flex"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages?.map((page, i) => {
        if (page === "leftDots" || page === "rightDots") {
          return (
            <Button
              key={`dots-${i}`}
              variant="ghost"
              size="sm"
              disabled
              className="cursor-default"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        return (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="hidden sm:flex"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export { Pagination };
