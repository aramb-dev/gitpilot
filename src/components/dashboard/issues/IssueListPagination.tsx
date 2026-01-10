'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IssueListPaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  totalCount?: number;
  perPage?: number;
}

export function IssueListPagination({
  currentPage,
  hasNextPage,
  hasPrevPage,
  isLoading,
  onPageChange,
  totalCount,
  perPage = 30,
}: IssueListPaginationProps) {
  const totalPages = totalCount ? Math.ceil(totalCount / perPage) : undefined;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
      <div className="text-sm text-gray-500">
        {totalCount !== undefined && (
          <span>
            Page {currentPage}
            {totalPages && ` of ${totalPages}`}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || isLoading}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
