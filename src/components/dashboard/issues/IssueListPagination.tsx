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
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#333] font-mono">
      <div className="text-xs text-[#666]">
        {totalCount !== undefined && (
          <span>
            [PAGE_{currentPage}{totalPages && `_OF_${totalPages}`}]
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00] bg-[#1a1a1a] h-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || isLoading}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          PREV
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00] bg-[#1a1a1a] h-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
        >
          NEXT
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
