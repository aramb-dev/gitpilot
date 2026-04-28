import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex justify-end items-center space-x-4 font-mono">
      <span className="text-sm text-[#666]">
        {startItem}-{endItem} <span className="text-[#444]">of</span> {totalItems}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="p-2 h-9 border-[#333] bg-[#1a1a1a] text-[#888] hover:border-[#00ff00] hover:text-[#00ff00] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="p-2 h-9 border-[#333] bg-[#1a1a1a] text-[#888] hover:border-[#00ff00] hover:text-[#00ff00] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
